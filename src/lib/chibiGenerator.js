import fs from 'fs';
import path from 'path';
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
 * Genera un sticker chibi usando una sola imagen de entrada
 */
export async function generateChibiSticker({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🎨 Iniciando generación de chibi sticker...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para chibi
        const prompt = createChibiPrompt(extraDetails);
        console.log('📝 Prompt chibi generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica para chibi
        console.log(`🚀 Enviando petición chibi a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "gpt-image-1",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Chibi sticker generado en ${totalTime} segundos`);

        // 5. Guardar imagen y metadatos
        const imageBase64 = response.data[0].b64_json;
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const fileName = generateChibiFileName();
        const outputPath = await saveImage(imageBuffer, fileName);
        
        // 6. Guardar metadatos completos
        await saveChibiMetadata({
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
            styleId: 'chibi-sticker'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando chibi sticker:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de chibi',
            generationTime: totalTime,
            styleId: 'chibi-sticker'
        };
    }
}

/**
 * Crea el prompt específico y optimizado para chibi stickers
 */
function createChibiPrompt(extraDetails) {
    let basePrompt = `Please create a set of 9 Chibi stickers featuring the character in the reference image, arranged in a 3x3 grid.
Design requirements:
- white background.
- 1:1 square aspect ratio.
- Consistent Chibi Ghibli cartoon style with vibrant colors.
- Each sticker must have a unique action, expression, and theme, reflecting diverse emotions like "sassy, mischievous, cute, frantic" (e.g., rolling eyes, laughing hysterically on the floor, soul leaving body, petrified, throwing money, foodie mode, social anxiety attack). Incorporate elements related to office workers and internet memes.
- Each character depiction must be complete, with no missing parts.
- Each sticker must have a uniform white outline, giving it a sticker-like appearance.
- No extraneous or detached elements in the image.
- Strictly no text, or ensure any text is 100% accurate (no text preferred).`;
    
    // Agregar detalles específicos si los hay
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional customization: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo chibi
 */
function generateChibiFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `chibi-sticker_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Chibi sticker guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos específicos para chibi stickers
 */
async function saveChibiMetadata({
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

        // Crear objeto de metadatos específico para chibi
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
                // No celebrity image para chibi stickers
            },
            generation: {
                styleId: 'chibi-sticker',
                type: 'chibi-sticker',
                theme: 'kawaii',
                extraDetails: extraDetails || 'Estilo chibi por defecto',
                prompt,
                model: 'gpt-image-1',
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

        console.log(`📋 Metadatos chibi guardados: ${contentCollectionPath}`);
        console.log(`🖼️ Imagen original guardada: ${personFileName}`);

        return {
            contentCollectionPath,
            metadataPath,
            personPath
        };

    } catch (error) {
        console.error('❌ Error guardando metadatos chibi:', error);
        // No fallar la generación por errores en metadatos
        return null;
    }
}