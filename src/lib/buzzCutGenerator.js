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
 * Genera un estilo buzz cut street usando una sola imagen de entrada
 */
export async function generateBuzzCutStreet({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('✂️ Iniciando generación de buzz cut street style...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para buzz cut street
        const prompt = createBuzzCutPrompt(extraDetails);
        console.log('📝 Prompt buzz cut generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica para buzz cut
        console.log(`🚀 Enviando petición buzz cut street a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Buzz cut street style generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateBuzzCutFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveBuzzCutMetadata({
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
            styleId: 'buzz-cut-street'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando buzz cut street:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de buzz cut street',
            generationTime: totalTime,
            styleId: 'buzz-cut-street'
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
 * Crea el prompt específico y optimizado para buzz cut street style
 */
function createBuzzCutPrompt(extraDetails) {
    let basePrompt = `Use the uploaded headshot to change the hairstyle into a fresh buzz cut, cinematic street style, neon lights in the background.

The transformation should include:
- Clean, fresh buzz cut hairstyle (very short, uniform length)
- Cinematic street photography aesthetic
- Vibrant neon lights creating atmospheric background lighting
- Urban nighttime setting with street ambiance
- Professional portrait quality with dramatic lighting
- High contrast and vivid colors from neon reflections`;
    
    // Agregar detalles específicos si los hay
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional details: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo de buzz cut
 */
function generateBuzzCutFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `buzz-cut-street_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Buzz cut street guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos específicos para buzz cut street
 */
async function saveBuzzCutMetadata({
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

        // Crear objeto de metadatos específico para buzz cut street
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
                // No celebrity image para buzz cut street
            },
            generation: {
                styleId: 'buzz-cut-street',
                type: 'buzz-cut-street',
                theme: 'street-style',
                extraDetails: extraDetails || 'Buzz cut street style estándar',
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

        console.log(`📋 Metadatos buzz cut guardados: ${contentCollectionPath}`);
        console.log(`🖼️ Imagen original guardada: ${personFileName}`);

        return {
            contentCollectionPath,
            metadataPath,
            personPath
        };

    } catch (error) {
        console.error('❌ Error guardando metadatos buzz cut:', error);
        // No fallar la generación por errores en metadatos
        return null;
    }
}