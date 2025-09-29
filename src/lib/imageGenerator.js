import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';

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
    styleId = 'que-paso-ayer-fiesta'
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
        console.log('🚀 Enviando petición a OpenAI...');
        const response = await client.images.edit({
            model: "gpt-image-1",
            image: images,
            prompt,
            quality: "medium",
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Imagen generada en ${totalTime} segundos`);

        // 5. Guardar imagen
        const imageBase64 = response.data[0].b64_json;
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const fileName = generateFileName(styleId);
        const outputPath = await saveImage(imageBuffer, fileName);

        return {
            success: true,
            imageUrl: `/uploads/${fileName}`,
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
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Guardar imagen
    const outputPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Imagen guardada: ${outputPath}`);
    return outputPath;
}