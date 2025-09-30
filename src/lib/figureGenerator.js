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
    apiKey: "sk-7rXWvbPjWSQYAXJCCf8d3aD572864eEe924a8cC0C926E4De",
    baseURL: "https://api.laozhang.ai/v1"
});

/**
 * Genera una figura coleccionable usando una sola imagen de entrada
 */
export async function generateFigureCollector({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🎨 Iniciando generación de figura coleccionable...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para figura coleccionable
        const prompt = createFigurePrompt(extraDetails);
        console.log('📝 Prompt figura generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica para figura
        console.log(`🚀 Enviando petición figura coleccionable a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Figura coleccionable generada en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateFigureFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveFigureMetadata({
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
            styleId: 'figure-collector'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando figura coleccionable:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de figura',
            generationTime: totalTime,
            styleId: 'figure-collector'
        };
    }
}

/**
 * Descarga una imagen desde una URL temporal
 */
async function downloadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        console.log('🌐 Descargando imagen desde:', url);
        
        // Determinar protocolo (http o https)
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
 * Crea el prompt específico y optimizado para figuras coleccionables
 */
function createFigurePrompt(extraDetails) {
    let basePrompt = `Create a 1/7 scale commercialized figure of the character in the image, in a realistic style and environment.

Place the figure on a computer desk, using a circular transparent acrylic base without any text.

On the computer screen, display the ZBrush modeling process of the figure.

Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.

The scene should be photorealistic with proper lighting, shadows, and materials. The figure should have high-quality sculpting details, realistic paint job, and professional presentation like official collectible figures.`;
    
    // Agregar detalles específicos si los hay
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional customization: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo de figura
 */
function generateFigureFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `figure-collector_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Figura coleccionable guardada: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos específicos para figuras coleccionables
 */
async function saveFigureMetadata({
    fileName,
    personImage,
    extraDetails,
    prompt,
    generationTime,
    createdAt,
    quality
}) {
    try {
        // Generar nombres para archivos relacionados
        const baseName = fileName.replace('.png', '');
        const personFileName = `${baseName}_person_original.png`;

        // Guardar imagen original
        const personPath = path.join(DATA_DIR, personFileName);
        fs.writeFileSync(personPath, personImage);

        // Crear objeto de metadatos específico para figuras
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
                // No celebrity image para figure collector
            },
            generation: {
                styleId: 'figure-collector',
                type: 'figure-collector',
                theme: 'collectible-figure',
                scale: '1/7',
                extraDetails: extraDetails || 'Figura coleccionable estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024'
            },
            timestamp: Date.now(),
            version: '1.0'
        };

        // Guardar metadatos en Content Collections
        const contentDir = path.join(process.cwd(), 'src', 'content', 'generated-images');
        if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
        }
        const contentCollectionPath = path.join(contentDir, `${baseName}.json`);
        fs.writeFileSync(contentCollectionPath, JSON.stringify(metadata, null, 2));

        // También guardar copia en data/generated/metadata
        const metadataDir = path.join(DATA_DIR, 'metadata');
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true });
        }
        const metadataPath = path.join(metadataDir, `${baseName}_metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log(`📋 Metadatos figura guardados: ${contentCollectionPath}`);
        console.log(`🖼️ Imagen original guardada: ${personFileName}`);

        return {
            contentCollectionPath,
            metadataPath,
            personPath
        };

    } catch (error) {
        console.error('❌ Error guardando metadatos figura:', error);
        // No fallar la generación por errores en metadatos
        return null;
    }
}