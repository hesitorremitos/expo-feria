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
 * Genera una imagen AI usando OpenAI con dos imágenes de entrada
 */
export async function generateImage({
    personImage,
    celebrityImage,
    celebrityName = '',
    extraDetails = '',
    styleId = 'que-paso-ayer-fiesta',
    quality = 'medium' // 'medium' o 'high'
}) {
    console.log('🎬 Iniciando generación de imagen...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt personalizado
        const prompt = createPrompt(celebrityName, extraDetails, styleId);
        console.log('📝 Prompt generado:', prompt);

        // 2. Convertir imágenes a formato OpenAI
        const images = [
            await toFile(personImage, 'person.png', { type: 'image/png' }),
            await toFile(celebrityImage, 'celebrity.png', { type: 'image/png' })
        ];
        console.log('🖼️ Imágenes convertidas para OpenAI');

        // 3. Llamar a OpenAI
        console.log(`🚀 Enviando petición a OpenAI con calidad: ${quality}...`);
        const response = await client.images.edit({
            model: "gpt-image-1",
            image: images,
            prompt,
            quality: quality, // Usar parámetro dinámico
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Imagen generada en ${totalTime} segundos`);

        // 5. Guardar imagen y metadatos
        const imageBase64 = response.data[0].b64_json;
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const fileName = generateFileName(styleId);
        const outputPath = await saveImage(imageBuffer, fileName);
        
        // 6. Guardar metadatos completos
        await saveImageMetadata({
            fileName,
            personImage,
            celebrityImage,
            celebrityName,
            extraDetails,
            styleId,
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
            prompt
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando imagen:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación',
            generationTime: totalTime
        };
    }
}

/**
 * Crea el prompt personalizado según el estilo y parámetros
 */
function createPrompt(celebrityName, extraDetails, styleId) {
    const basePrompts = {
        'que-paso-ayer-fiesta': `Una foto estilo paparazzi espontánea y fotorrealista de mí y ${celebrityName || 'una celebridad'} en una fiesta universitaria. Están de pie en el sótano sucio de una fraternidad. Es una toma espontánea con mucho movimiento activo, interacción, etc. El destello de la cámara sobreexpone parcialmente la imagen, dándole una sensación caótica, como de tabloide.`
    };

    let prompt = basePrompts[styleId] || basePrompts['que-paso-ayer-fiesta'];
    
    // Agregar detalles extra si los hay
    if (extraDetails.trim()) {
        prompt += ` ${extraDetails}`;
    }

    return prompt;
}

/**
 * Genera un nombre único para el archivo de salida
 */
function generateFileName(styleId) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${styleId}_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio público
 */
async function saveImage(imageBuffer, fileName) {
    // Crear directorio si no existe
    const uploadsDir = DATA_DIR;
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Guardar imagen
    const outputPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Imagen guardada: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos completos de la generación
 */
async function saveImageMetadata({
    fileName,
    personImage,
    celebrityImage,
    celebrityName,
    extraDetails,
    styleId,
    prompt,
    generationTime,
    createdAt,
    quality
}) {
    try {
        // Generar nombres para las imágenes originales
        const baseName = fileName.replace('.png', '');
        const personFileName = `${baseName}_person_original.png`;
        const celebrityFileName = `${baseName}_celebrity_original.png`;

        // Guardar imágenes originales en data/generated
        const personPath = path.join(DATA_DIR, personFileName);
        const celebrityPath = path.join(DATA_DIR, celebrityFileName);
        
        fs.writeFileSync(personPath, personImage);
        fs.writeFileSync(celebrityPath, celebrityImage);

        // Crear objeto de metadatos completo
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
                },
                celebrity: {
                    fileName: celebrityFileName,
                    url: `/api/images/${celebrityFileName}`,
                    size: celebrityImage.length
                }
            },
            generation: {
                styleId,
                celebrityName: celebrityName || 'No especificado',
                extraDetails: extraDetails || 'No especificado',
                prompt,
                model: 'gpt-image-1',
                quality: quality,
                size: '1024x1024'
            },
            timestamp: Date.now(),
            version: '1.0'
        };

        // Guardar metadatos en Content Collections (src/content/generated-images/)
        const contentCollectionPath = path.join(process.cwd(), 'src', 'content', 'generated-images', `${baseName}.json`);
        fs.writeFileSync(contentCollectionPath, JSON.stringify(metadata, null, 2));

        // También mantener copia en data/generated/metadata para backward compatibility
        const metadataDir = path.join(DATA_DIR, 'metadata');
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true });
        }
        const metadataPath = path.join(metadataDir, `${baseName}_metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log(`📋 Metadatos guardados en Content Collections: ${contentCollectionPath}`);
        console.log(`🖼️ Imágenes originales guardadas: ${personFileName}, ${celebrityFileName}`);

        return {
            contentCollectionPath,
            metadataPath,
            personPath,
            celebrityPath
        };

    } catch (error) {
        console.error('❌ Error guardando metadatos:', error);
        // No fallar la generación por un error en metadatos
        return null;
    }
}