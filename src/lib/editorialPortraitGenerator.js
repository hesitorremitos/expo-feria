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
 * Genera un retrato editorial en blanco y negro de alta resolución
 */
export async function generateEditorialPortrait({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('📸 Iniciando generación de Editorial Portrait B&W...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Editorial Portrait
        const prompt = createEditorialPortraitPrompt(extraDetails);
        console.log('📝 Prompt Editorial Portrait generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Editorial Portrait a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Editorial Portrait generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateEditorialPortraitFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveEditorialPortraitMetadata({
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
            styleId: 'editorial-portrait'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Editorial Portrait:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Editorial Portrait',
            generationTime: totalTime,
            styleId: 'editorial-portrait'
        };
    }
}

/**
 * Descarga una imagen desde una URL temporal
 */
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
            
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
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

/**
 * Crea el prompt específico para Editorial Portrait B&W
 */
function createEditorialPortraitPrompt(extraDetails) {
    let basePrompt = `Use the uploaded photo to create a high-resolution black and white portrait artwork in an editorial and fine art photography style.

Photography Style: Editorial Portrait - Black and White Fine Art

The transformation should include:
- High-resolution black and white portrait with exceptional detail
- Soft gradient background transitioning from mid-gray to almost pure white, creating depth and tranquility
- Fine film grain adding tactile, analog-like softness reminiscent of classic black and white photography
- Part of the face subtly emerging from shadows - perhaps an eye, cheekbone, or lip contour
- Subject captured in a moment of thought or breath, not in traditional pose
- Sense of mystery, intimacy, and elegance in the composition
- Delicate yet profound features exuding melancholic and poetic beauty
- Gentle, directional light softly diffused, caressing facial curves
- Light glinting in the eye as the emotional core of the image
- Ample negative space dominating the composition, allowing the image to breathe
- No texts, no logos - only interplay of light, shadow, and emotion
- Abstract yet deeply human atmosphere
- Intimate, timeless, and poignantly beautiful aesthetic
- Like a fleeting glance or half-remembered dream`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional artistic details: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo
 */
function generateEditorialPortraitFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `editorial-portrait_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Editorial Portrait guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos
 */
async function saveEditorialPortraitMetadata({
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

        // Guardar imagen original
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
                styleId: 'editorial-portrait',
                type: 'editorial-portrait',
                theme: 'black-white-fine-art',
                extraDetails: extraDetails || 'Editorial portrait estándar con film grain',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Editorial B&W',
                aesthetic: 'Fine Art Photography'
            },
            timestamp: Date.now(),
            version: '1.0'
        };

        // Guardar metadatos
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
