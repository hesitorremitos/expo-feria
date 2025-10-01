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

function createGhibliStylePrompt(extraDetails) {
    let basePrompt = `Transform the person into authentic Studio Ghibli anime art style:

STUDIO GHIBLI CHARACTER DESIGN:
- Convert the person into a genuine Studio Ghibli anime character with authentic Hayao Miyazaki aesthetic
- IMPORTANT: Respect and preserve the person's hair color, hairstyle, facial features, and clothing style
- Characteristic large expressive anime eyes with multiple light reflections and emotional depth
- Soft watercolor-style shading with gentle gradients typical of Ghibli films
- Hand-drawn traditional 2D animation aesthetic (NOT 3D rendered)
- Natural and organic linework with slight variation in line weight
- Warm color palette with gentle earth tones and soft pastels
- Delicate facial features: small nose, gentle smile, rosy cheeks
- Hair with natural flow and movement, slightly windswept
- Clothing with detailed folds and fabric texture in Ghibli's signature style

GHIBLI AESTHETIC QUALITIES:
- Nostalgic and whimsical atmosphere like Spirited Away, My Neighbor Totoro, or Howl's Moving Castle
- Soft cel-shaded coloring with watercolor texture overlays
- Gentle lighting with warm sunlight or soft ambient glow
- Natural environment elements: floating leaves, gentle breeze effects, soft clouds
- Dreamy background with bokeh light particles or nature elements
- Traditional hand-painted background art style
- Emotional expressiveness and gentle demeanor
- Sense of wonder and magical realism

BACKGROUND & COMPOSITION:
- Peaceful natural setting: meadow, forest clearing, cloudy sky, or sunset field
- Soft focus background with Studio Ghibli signature painted landscape
- Warm golden hour lighting or soft overcast daylight
- Subtle environmental details: grass blades, flower petals, tree leaves
- Depth with foreground and background layers
- Cinematic composition like a Ghibli movie frame
- Atmosphere particles: floating pollen, dust motes in sunlight, gentle sparkles

TECHNICAL DETAILS:
- Traditional 2D anime cel animation style
- Hand-drawn line quality with slight imperfections for authenticity
- Watercolor painting texture throughout
- Soft gradient shading (NOT hard shadows)
- Warm color grading with slight film grain
- Studio Ghibli's signature gentle color palette
- Frame-worthy composition like official Ghibli movie poster
- High detail in eyes, hair strands, and clothing folds

IMPORTANT: Maintain the person's actual appearance but transform it into authentic Studio Ghibli anime art. The character should feel like they belong in a Hayao Miyazaki film - gentle, expressive, and full of life. Preserve hair color, style, and clothing characteristics while adapting them to Ghibli's aesthetic.

No text, no logos. Pure Studio Ghibli anime art transformation.`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional scene details: ${extraDetails}`;
    }

    return basePrompt;
}

function generateGhibliStyleFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `ghibli-style_${timestamp}_${randomId}.png`;
}

async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Ghibli Style guardado: ${outputPath}`);
    return outputPath;
}

async function saveGhibliStyleMetadata({
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
                styleId: 'ghibli-style',
                type: 'ghibli-style',
                theme: 'studio-ghibli-anime',
                extraDetails: extraDetails || 'Transformación estilo Studio Ghibli estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Ghibli Style',
                aesthetic: 'Studio Ghibli Anime Art'
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
 * Genera transformación estilo Studio Ghibli
 */
export async function generateGhibliStyle({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🎨 Iniciando generación de Ghibli Style...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Ghibli Style
        const prompt = createGhibliStylePrompt(extraDetails);
        console.log('📝 Prompt Ghibli Style generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Ghibli Style a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Ghibli Style generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateGhibliStyleFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveGhibliStyleMetadata({
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
            styleId: 'ghibli-style'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Ghibli Style:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Ghibli Style',
            generationTime: totalTime,
            styleId: 'ghibli-style'
        };
    }
}
