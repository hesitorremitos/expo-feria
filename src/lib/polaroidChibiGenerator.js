import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import OpenAI, { toFile } from 'openai';

// Configuración de rutas
const DATA_DIR = path.resolve(process.cwd(), 'data', 'generated');

// Asegurar que existe la carpeta data/generated
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cliente OpenAI configurado
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-7rXWvbPjWSQYAXJCCf8d3aD572864eEe924a8cC0C926E4De",
    baseURL: process.env.OPENAI_BASE_URL || "https://api.laozhang.ai/v1"
});

async function downloadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        console.log('🌐 Descargando imagen desde:', url);
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Error HTTP: ${response.statusCode}`));
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(`✅ Imagen descargada: ${buffer.length} bytes`);
                resolve(buffer);
            });
        }).on('error', (error) => {
            console.error('❌ Error descargando imagen:', error);
            reject(error);
        });
    });
}

function createPolaroidChibiPrompt(extraDetails) {
    let basePrompt = `Create a creative 3D chibi character breaking out of a Polaroid photo:

3D CHIBI CHARACTER DESIGN:
- Adorable 3D rendered chibi character with oversized head (60% of total height) and tiny body
- IMPORTANT: Respect and maintain the person's hair color, hairstyle, and basic physical features
- Large expressive anime-style eyes with multiple light reflections and sparkles
- Cute rounded facial features with rosy cheeks and gentle smile
- Small button nose and simplified anime mouth
- Hair with volume and natural flow, slightly windswept with individual strands visible
- Chibi proportions: big head, small body, short stubby legs, tiny hands
- Simple casual outfit matching person's style (t-shirt, hoodie, jeans, etc.)
- Smooth 3D render with soft clay/plastic texture like Pixar quality

POLAROID PHOTO INTERACTION:
- Large vintage Polaroid instant photo with white borders (classic instant camera photo format)
- The Polaroid photo is tilted at a slight angle, giving dynamic composition
- Chibi character is literally BREAKING OUT of the Polaroid photo
- Upper body emerging from the photo frame (breaking the 4th wall effect)
- Legs and lower body still visible inside the flat printed photo portion
- Torn paper edges where character breaks through the Polaroid frame
- The inside photo shows a matching background scene continuing into the character
- Physical depth: character is 3D popping out, photo is flat surface

DEPTH AND LAYERS:
- Clear separation between 3D chibi (foreground) and flat photo (background)
- Character casting soft shadow on the Polaroid frame and background
- Photo appears to be a physical object with slight thickness visible
- Realistic lighting on 3D character vs flat printed look on photo portion
- Sense of movement - character actively climbing/jumping out of frame

BACKGROUND & LIGHTING:
- Clean gradient background (soft pastel: pink, blue, purple, or mint green)
- Professional studio lighting with soft shadows
- Subtle depth of field: character sharp focus, background soft blur
- Warm ambient light creating friendly atmosphere
- Optional: Floating sparkles or light particles around character

POLAROID PHOTO DETAILS:
- White border frame characteristic of Polaroid instant photos
- Slight paper texture visible on the Polaroid surface
- Bottom white space could have small caption text area (leave blank)
- Photo has slight curl or bend to show it's a physical object
- Vintage instant camera aesthetic

TECHNICAL QUALITY:
- High-resolution 3D rendering with smooth surfaces
- Professional lighting setup with soft key light and fill light
- Color grading: warm and inviting tones
- Sharp details on character, especially eyes and hair
- Playful and creative composition
- Instagram-worthy aesthetic perfect for profile pictures

IMPORTANT: The chibi character must respect the person's actual appearance (hair color/style, ethnicity, clothing preferences) while maintaining adorable chibi proportions. The "breaking out of photo" effect should be clear and dramatic, creating a fun and eye-catching visual.

No text, no logos. Pure creative 3D chibi breaking out of Polaroid art.`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional creative details: ${extraDetails}`;
    }

    return basePrompt;
}

function generatePolaroidChibiFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `polaroid-chibi_${timestamp}_${randomId}.png`;
}

async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Polaroid Chibi guardado: ${outputPath}`);
    return outputPath;
}

async function savePolaroidChibiMetadata({
    fileName,
    personImage,
    extraDetails,
    prompt,
    generationTime,
    createdAt,
    quality
}) {
    try {
        const baseName = fileName.replace('.png', '');
        const personFileName = `${baseName}_person_original.png`;

        const personPath = path.join(DATA_DIR, personFileName);
        fs.writeFileSync(personPath, personImage);

        const metadata = {
            generatedImage: {
                fileName,
                url: `/api/images/${fileName}`,
                createdAt,
                generationTime,
                size: fs.statSync(path.join(DATA_DIR, fileName)).size
            },
            originalImages: {
                person: {
                    fileName: personFileName,
                    url: `/api/images/${personFileName}`,
                    size: personImage.length
                }
            },
            generation: {
                styleId: 'polaroid-chibi',
                type: 'polaroid-chibi',
                theme: '3d-chibi-polaroid-breakout',
                extraDetails: extraDetails || 'Chibi 3D saliendo de Polaroid estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Polaroid Chibi',
                aesthetic: '3D Chibi Breaking Out'
            },
            timestamp: Date.now(),
            version: '1.0'
        };

        const contentDir = path.join(process.cwd(), 'src', 'content', 'generated-images');
        if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
        }
        const contentCollectionPath = path.join(contentDir, `${baseName}.json`);
        fs.writeFileSync(contentCollectionPath, JSON.stringify(metadata, null, 2));

        const metadataDir = path.join(DATA_DIR, 'metadata');
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true });
        }
        const metadataPath = path.join(metadataDir, `${baseName}_metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log(`📋 Metadatos guardados: ${contentCollectionPath}`);
        return { contentCollectionPath, metadataPath, personPath };

    } catch (error) {
        console.error('❌ Error guardando metadatos:', error);
        return null;
    }
}

/**
 * Genera chibi 3D saliendo de foto Polaroid
 */
export async function generatePolaroidChibi({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('📷 Iniciando generación de Polaroid Chibi...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Polaroid Chibi
        const prompt = createPolaroidChibiPrompt(extraDetails);
        console.log('📝 Prompt Polaroid Chibi generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Polaroid Chibi a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Polaroid Chibi generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generatePolaroidChibiFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await savePolaroidChibiMetadata({
            fileName,
            personImage,
            extraDetails,
            prompt,
            generationTime: totalTime,
            createdAt: new Date().toISOString(),
            quality
        });

        return {
            success: true,
            imageUrl: `/api/images/${fileName}`,
            fileName,
            outputPath,
            generationTime: totalTime,
            prompt,
            styleId: 'polaroid-chibi'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Polaroid Chibi:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Polaroid Chibi',
            generationTime: totalTime,
            styleId: 'polaroid-chibi'
        };
    }
}
