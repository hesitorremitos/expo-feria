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
 * Genera un retrato estilo Film Noir con ambiente Art Deco
 */
export async function generateFilmNoirPortrait({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🎬 Iniciando generación de Film Noir Portrait...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Film Noir
        const prompt = createFilmNoirPrompt(extraDetails);
        console.log('📝 Prompt Film Noir generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica para Film Noir
        console.log(`🚀 Enviando petición Film Noir a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Film Noir Portrait generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateFilmNoirFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveFilmNoirMetadata({
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
            styleId: 'film-noir-portrait'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Film Noir Portrait:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Film Noir',
            generationTime: totalTime,
            styleId: 'film-noir-portrait'
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
 * Crea el prompt específico y optimizado para Film Noir Portrait
 */
function createFilmNoirPrompt(extraDetails) {
    let basePrompt = `Use the uploaded headshot to create a Film Noir-inspired portrait set in 19th century Americas (1800s-1890s).

Photography Style: Historical Film Noir Portrait - 19th Century Americas

Setting: Vintage 1800s American Interior - Victorian Era Elegance

The transformation should include:
- Classic sepia-toned or black and white aesthetic with high contrast and vintage grain texture
- Soft, dramatic lighting reminiscent of early photography (daguerreotype/tintype style)
- 19th century American interior elements: Victorian furniture, ornate wooden panels, velvet curtains, antique oil lamps
- Period-accurate clothing and styling from 1800s Americas (Victorian fashion, tailored suits, elegant dresses)
- Historical ambiance with vintage architectural details (carved wood, brass fixtures, crystal chandeliers)
- Moody, cinematic quality with strong shadows and highlights typical of early portrait photography
- Aged photograph appearance with slight vignetting and subtle paper texture
- Timeless 1800s American sophistication and historical mystique
- Professional portrait composition with depth and vintage character
- Elements that evoke the Old West, Victorian parlors, or Belle Époque salons of 19th century Americas`;
    
    // Agregar detalles específicos si los hay
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional historical details: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo de Film Noir
 */
function generateFilmNoirFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `film-noir-portrait_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Film Noir Portrait guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos específicos para Film Noir Portrait
 */
async function saveFilmNoirMetadata({
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

        // Crear objeto de metadatos específico para Film Noir
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
                styleId: 'film-noir-portrait',
                type: 'film-noir-portrait',
                theme: 'art-deco-lounge',
                extraDetails: extraDetails || 'Film Noir Portrait estándar con ambiente Art Deco',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Film Noir',
                setting: 'Art Deco Lounge'
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

        console.log(`📋 Metadatos Film Noir guardados: ${contentCollectionPath}`);
        console.log(`🖼️ Imagen original guardada: ${personFileName}`);

        return {
            contentCollectionPath,
            metadataPath,
            personPath
        };

    } catch (error) {
        console.error('❌ Error guardando metadatos Film Noir:', error);
        // No fallar la generación por errores en metadatos
        return null;
    }
}
