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

function createLegoCollectionPrompt(extraDetails) {
	let basePrompt = `Create a professional LEGO minifigure collection display:

CHARACTER DESIGN:
- Transform the person into a detailed LEGO minifigure with authentic LEGO proportions
- IMPORTANT: Respect and replicate the person's hair color, hairstyle, and distinctive features in LEGO form
- Signature cylindrical LEGO head with simple dot eyes and smile line
- Iconic yellow LEGO skin tone (classic minifigure style)
- Segmented LEGO body parts: cylindrical torso, arms, rectangular hands with grip holes
- LEGO legs with articulation lines at hips and knees
- Clothing should match the person's style translated to LEGO prints and accessories

LEGO COMPANION ANIMAL:
- Include a small LEGO animal companion next to the minifigure (dog, cat, or bird)
- Animal should be built from actual LEGO pieces with authentic brick connections visible
- Scale the animal appropriately to minifigure size (1-3 studs tall)
- Use solid LEGO colors (red, blue, green, white, gray, brown, or black)
- Show brick studs and connection points on the animal build

DISPLAY CASE:
- Professional glass display cube/box with crystal-clear transparency
- Minifigure standing on white or light gray LEGO baseplate (32x32 studs minimum)
- Baseplate shows visible LEGO studs in perfect grid pattern
- Glass has subtle reflections and highlights showing depth
- Modern minimalist display case with thin black or silver frame edges
- Soft internal LED lighting casting gentle shadows on baseplate

BACKGROUND & ENVIRONMENT:
- Clean gradient background (soft white to light blue or gray)
- Subtle environmental reflections on glass showing the display is in a well-lit room
- Optional: Blurred LEGO brick wall or shelf in far background
- Professional product photography aesthetic with studio lighting
- Slight rim lighting on glass edges to define the display case

TECHNICAL DETAILS:
- High-resolution LEGO brick texture with authentic stud patterns
- Visible connection points between LEGO pieces (realistic minifigure assembly)
- Proper LEGO proportions: 4 studs wide body, 3 bricks tall legs, cylindrical head
- ABS plastic sheen characteristic of LEGO pieces
- Sharp focus on minifigure, slight depth of field on background
- Professional collector display photography style

IMPORTANT: The minifigure must respect the person's actual appearance translated to LEGO form (hair color/style, clothing colors, accessories). The companion animal adds personality and collectible value. The display case presentation should feel like an exclusive limited-edition LEGO set.

No texts, no logos, no brand names visible. Pure LEGO minifigure collection display art.`;
    
    if (extraDetails.trim()) {
        basePrompt += `\n\nAdditional details: ${extraDetails}`;
    }

    return basePrompt;
}

function generateLegoCollectionFileName() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `lego-collection_${timestamp}_${randomId}.png`;
}

async function saveImage(imageBuffer, fileName) {
    const outputPath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 LEGO Collection guardado: ${outputPath}`);
    return outputPath;
}

async function saveLegoCollectionMetadata({
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
                styleId: 'lego-collection',
                type: 'lego-collection',
                theme: 'lego-minifigure-display',
                extraDetails: extraDetails || 'Minifigura LEGO en vitrina estándar',
                prompt,
                model: 'nano-banana-oss',
                quality: quality,
                size: '1024x1024',
                style: 'LEGO Collection',
                aesthetic: 'LEGO Display Art'
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
 * Genera una minifigura LEGO en vitrina de colección
 */
export async function generateLegoCollection({
    personImage,
    extraDetails = '',
    quality = 'medium'
}) {
    console.log('🧸 Iniciando generación de LEGO Collection...');
    const startTime = Date.now();
    
    try {
        // 1. Crear prompt específico para LEGO Collection
        const prompt = createLegoCollectionPrompt(extraDetails);
        console.log('📝 Prompt LEGO Collection generado:', prompt);

        // 2. Convertir imagen a formato OpenAI
        const image = await toFile(personImage, 'person.png', { type: 'image/png' });
        console.log('🖼️ Imagen convertida para OpenAI');

        // 3. Llamar a OpenAI con configuración específica
        console.log(`🚀 Enviando petición LEGO Collection a OpenAI (calidad: ${quality})...`);
        const response = await client.images.edit({
            model: "nano-banana-oss",
            image: image,
            prompt,
            quality: quality,
            size: "1024x1024",
        });

        // 4. Procesar respuesta
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ LEGO Collection generado en ${totalTime} segundos`);

        // 5. Descargar imagen desde URL temporal y guardar
        const imageUrl = response.data[0].url;
        console.log('🔗 URL temporal recibida:', imageUrl);
        
        const fileName = generateLegoCollectionFileName();
        const imageBuffer = await downloadImageFromUrl(imageUrl);
        const outputPath = await saveImage(imageBuffer, fileName);
        console.log('💾 Imagen descargada y guardada:', outputPath);
        
        // 6. Guardar metadatos completos
        await saveLegoCollectionMetadata({
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
            styleId: 'lego-collection'
        };

    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('❌ Error generando LEGO Collection:', error);
        
        return {
            success: false,
            error: error.message || 'Error desconocido en la generación de LEGO Collection',
            generationTime: totalTime,
            styleId: 'lego-collection'
        };
    }
}
