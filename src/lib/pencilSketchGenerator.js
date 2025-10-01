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
 * Genera un boceto a lápiz realista con textura de papel
 */
export async function generatePencilSketch({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('✏️ Iniciando generación de Pencil Sketch...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para Pencil Sketch
        const prompt = createPencilSketchPrompt(extraDetails);
        console.log('📝 Prompt Pencil Sketch generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición Pencil Sketch a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Pencil Sketch generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generatePencilSketchFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await savePencilSketchMetadata({
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
            styleId: 'pencil-sketch'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando Pencil Sketch:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de Pencil Sketch',
            generationTime: totalTime,
            styleId: 'pencil-sketch'
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
 * Crea el prompt específico para Pencil Sketch
 */
function createPencilSketchPrompt(extraDetails) {
    let basePrompt = `Use the uploaded photo to create a realistic hand-drawn pencil sketch artwork with authentic paper texture.

Pencil Sketch Style: Realistic Hand-Drawn Portrait

The transformation should include:
- Realistic pencil sketch portrait drawn by hand on textured paper
- Graphite pencil strokes with varying pressure: light for highlights, heavy for shadows
- Visible individual pencil lines and hatching techniques (cross-hatching, contour lines)
- Natural paper texture showing through: cream or off-white paper with subtle grain
- Detailed facial features with careful shading and tonal gradients
- Emphasis on capturing likeness and expression through line work
- Some areas more detailed (eyes, face) while other areas are looser sketches
- Authentic pencil smudges and subtle finger-blending marks
- Edge work that fades into the paper, unfinished sketch aesthetic in some areas
- Range of graphite tones from light gray to deep charcoal black
- Realistic shadows created through layered pencil strokes
- Paper imperfections: slight texture, minor wrinkles, natural aging
- Artist's signature or initials subtly in corner (optional)
- Natural lighting that doesn't overpower the delicate pencil work
- Traditional art studio aesthetic
- NO digital effects, NO filters - pure analog pencil drawing look
- Timeless classical portrait drawing style
- As if drawn by a skilled portrait artist with years of experience`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional artistic details: ${extraDetails}`;
    }

    return basePrompt;
}

/**
 * Genera un nombre único para el archivo
 */
function generatePencilSketchFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `pencil-sketch_${timestamp}_${randomId}.png`;
}

/**
 * Guarda la imagen en el directorio de datos
 */
async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`💾 Pencil Sketch guardado: ${outputPath}`);
    return outputPath;
}

/**
 * Guarda los metadatos
 */
async function savePencilSketchMetadata({
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
                styleId: 'pencil-sketch',
                type: 'pencil-sketch',
                theme: 'hand-drawn-realistic',
                extraDetails: extraDetails || 'Boceto a lápiz realista estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'Pencil Sketch',
                aesthetic: 'Classical Portrait Drawing'
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
