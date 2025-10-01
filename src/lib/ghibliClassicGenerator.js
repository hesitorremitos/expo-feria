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

function createGhibliClassicPrompt(extraDetails) {
    let basePrompt = `Redraw this photo in Ghibli style`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional creative details: ${extraDetails}`;
    }

    return basePrompt;
}

function generateGhibliClassicFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `ghibli-classic_${timestamp}_${randomId}.png`;
}

async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Ghibli Classic guardado: ${outputPath}`);
    return outputPath;
}

async function saveGhibliClassicMetadata({
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
                styleId: 'ghibli-classic',
                type: 'ghibli-classic',
                theme: 'studio-ghibli-anime-classic',
                extraDetails: extraDetails || 'Estilo Ghibli clásico',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Ghibli Classic',
                aesthetic: 'Studio Ghibli Anime'
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
 * Genera imagen en estilo Ghibli clásico
 */
export async function generateGhibliClassic({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🎨 Iniciando generación de Ghibli Classic...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Ghibli Classic
        const prompt = createGhibliClassicPrompt(extraDetails);
        console.log('📝 Prompt Ghibli Classic generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Ghibli Classic a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Ghibli Classic generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateGhibliClassicFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveGhibliClassicMetadata({
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
            styleId: 'ghibli-classic'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Ghibli Classic:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Ghibli Classic',
            generationTime: totalTime,
            styleId: 'ghibli-classic'
        };
    }
}
