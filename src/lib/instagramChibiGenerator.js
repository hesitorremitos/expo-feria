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

/**
 * Genera un chibi 3D sentado en marco de Instagram
 */
export async function generateInstagramChibi({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('📱 Iniciando generación de Instagram Chibi...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Instagram Chibi
        const prompt = createInstagramChibiPrompt(extraDetails);
        console.log('📝 Prompt Instagram Chibi generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Instagram Chibi a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Instagram Chibi generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateInstagramChibiFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveInstagramChibiMetadata({
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
            styleId: 'instagram-chibi'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Instagram Chibi:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Instagram Chibi',
            generationTime: totalTime,
            styleId: 'instagram-chibi'
        };
    }
}

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

function createInstagramChibiPrompt(extraDetails) {
    let basePrompt = `Use the uploaded photo to create a 3D chibi character sitting on an Instagram photo frame artwork.

Instagram Chibi Style: 3D Cute Character on Social Media Frame

The transformation should include:
- Adorable 3D rendered chibi character with oversized head and tiny body (chibi proportions: 60% head, 40% body)
- Character casually sitting on the edge of a large Instagram photo frame, legs dangling
- The Instagram frame should look like a physical white-bordered Polaroid-style photo frame standing upright
- Inside the frame: a blurred or abstract background representing an Instagram post
- Instagram app UI elements visible on the frame (like button, comment icon, share icon) in soft colors
- Character has smooth 3D plastic/clay-like texture with soft lighting and subtle shadows
- IMPORTANT: Respect the person's hair color, hairstyle, and basic clothing style
- Large sparkling anime-style eyes with light reflections
- Cute rounded facial features with rosy cheeks
- Simple casual outfit matching the person's style (t-shirt, hoodie, etc.)
- Relaxed sitting pose: one leg crossed, hands resting on frame edge
- Character looking friendly and approachable, slight smile
- Professional 3D rendering with soft ambient lighting
- Clean gradient background (pastel pink, blue, or purple tones)
- Depth of field effect: character in focus, background slightly blurred
- Social media aesthetic: modern, trendy, Instagram-worthy
- Playful and creative composition showing character interacting with the frame
- Smooth render quality like Pixar or modern 3D animation
- No texts on frame, no logos - just pure creative 3D chibi art`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional creative details: ${extraDetails}`;
    }

    return basePrompt;
}

function generateInstagramChibiFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `instagram-chibi_${timestamp}_${randomId}.png`;
}

async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Instagram Chibi guardado: ${outputPath}`);
    return outputPath;
}

async function saveInstagramChibiMetadata({
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
                styleId: 'instagram-chibi',
                type: 'instagram-chibi',
                theme: '3d-chibi-social-media',
                extraDetails: extraDetails || 'Chibi 3D en marco de Instagram estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Instagram Chibi',
                aesthetic: '3D Social Media Art'
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
