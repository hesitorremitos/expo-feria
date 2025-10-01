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
 * Genera un muñeco de crochet tejido a mano estilo chibi
 */
export async function generateYarnDoll({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🧶 Iniciando generación de Yarn Doll...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Yarn Doll
        const prompt = createYarnDollPrompt(extraDetails);
        console.log('📝 Prompt Yarn Doll generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Yarn Doll a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Yarn Doll generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateYarnDollFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveYarnDollMetadata({
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
            styleId: 'yarn-doll'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Yarn Doll:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Yarn Doll',
            generationTime: totalTime,
            styleId: 'yarn-doll'
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
 * Crea el prompt específico para Yarn Doll
 */
function createYarnDollPrompt(extraDetails) {
    let basePrompt = `Use the uploaded photo to create a handmade crochet yarn doll artwork in chibi style that respects the person's characteristics.

Yarn Doll Style: Hand-crocheted Chibi Amigurumi

The transformation should include:
- Adorable chibi-style yarn doll with oversized round head and tiny body (chibi proportions: big head 50%, small body, stubby limbs)
- Hand-crocheted texture with visible yarn stitches and soft, fuzzy wool fibers throughout
- IMPORTANT: Respect the person's hair color, hairstyle, and clothing colors from the original photo
- IMPORTANT: Maintain the person's clothing style (shirt, jacket, dress, etc.) translated to crocheted version
- Yarn colors should match the original photo's palette (hair color, clothing colors, skin tone)
- Crocheted outfit with visible knit patterns and texture that replicates their actual clothes
- Large expressive button eyes or embroidered eyes with sparkle
- Cute rosy cheeks and gentle smile embroidered with thread
- Fluffy yarn hair matching the person's actual hair color and style with visible individual strands
- Small handmade accessories matching the person's style (hat, glasses, scarf, etc. if they wear them)
- Artisan handmade quality with slight imperfections that add charm and authenticity
- Soft cotton wool texture throughout, looking cuddly and huggable
- Clean white or neutral gradient background to showcase the doll
- Warm soft lighting that highlights the yarn's fiber texture and craftsmanship
- Cozy, kawaii, and heartwarming atmosphere suitable for all genders
- Amigurumi aesthetic: round, squishy, and irresistibly cute
- Professional product photography angle, slightly from above
- Gender-neutral and respectful representation of the person
- No texts, no logos - just pure handmade yarn doll charm`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional handmade details: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo
 */
function generateYarnDollFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `yarn-doll_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Yarn Doll guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos
 */
async function saveYarnDollMetadata({
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
                styleId: 'yarn-doll',
                type: 'yarn-doll',
                theme: 'hand-crocheted-chibi',
                extraDetails: extraDetails || 'Muñeco de crochet estándar estilo chibi',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Yarn Doll',
                aesthetic: 'Handmade Amigurumi'
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
