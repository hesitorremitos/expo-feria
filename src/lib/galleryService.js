import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

/**
 * Obtiene todas las imágenes generadas usando Content Collections como fallback
 */
export async function getGeneratedImages() {
    try {
        // Primero intentar cargar desde archivos dinámicos (método principal para runtime)
        const legacyImages = getGeneratedImagesLegacy();
        
        if (legacyImages && legacyImages.length > 0) {
            return legacyImages;
        }
        
        // Si no hay imágenes dinámicas, usar Content Collections (para imágenes estáticas)
        const imageCollection = await getCollection('generated-images');
        
        // Mapear a formato legible
        const images = imageCollection.map(entry => {
            const metadata = entry.data;
            
            return {
                id: entry.id,
                fileName: metadata.generatedImage.fileName,
                url: metadata.generatedImage.url,
                imageUrl: metadata.generatedImage.url, // Para compatibilidad
                createdAt: metadata.generatedImage.createdAt,
                generationTime: metadata.generatedImage.generationTime,
                size: metadata.generatedImage.size,
                
                // Información de generación
                generation: metadata.generation,
                styleId: metadata.generation?.styleId || 'desconocido',
                celebrityName: metadata.generation?.celebrityName || 'Sin especificar',
                prompt: metadata.generation?.prompt || '',
                
                // Imágenes originales
                originalImages: metadata.originalImages,
                
                // Metadata para el componente
                hasMetadata: true,
                timestamp: metadata.timestamp
            };
        });
        
        // Ordenar por fecha de creación más reciente
        return images.sort((a, b) => b.timestamp - a.timestamp);
        
    } catch (error) {
        console.error('Error loading images from both sources:', error);
        return [];
    }
}

/**
 * Método legacy para cargar imágenes (backward compatibility)
 */
function getGeneratedImagesLegacy() {
    try {
        const dataDir = path.join(process.cwd(), 'data', 'generated');
        const metadataDir = path.join(dataDir, 'metadata');
        
        // Verificar si existe el directorio
        if (!fs.existsSync(dataDir)) {
            return [];
        }

        if (!fs.existsSync(metadataDir)) {
            return [];
        }

        const metadataFiles = fs.readdirSync(metadataDir);
        
        // Filtrar solo archivos JSON
        const jsonFiles = metadataFiles.filter(file => file.endsWith('.json'));

        const images = [];
        
        jsonFiles.forEach(metadataFile => {
            try {
                const metadataPath = path.join(metadataDir, metadataFile);
                const rawData = fs.readFileSync(metadataPath, 'utf8');
                const metadata = JSON.parse(rawData);
                
                // Obtener el nombre de la imagen del metadata
                const fileName = metadata.generatedImage?.fileName || metadata.fileName;
                
                if (!fileName) {
                    return;
                }
                
                // Verificar que la imagen PNG correspondiente exists
                const imagePath = path.join(dataDir, fileName);
                if (fs.existsSync(imagePath)) {
                    images.push({
                        id: metadata.id || fileName.replace('.png', ''),
                        fileName: fileName,
                        url: `/api/images/${fileName}`,
                        imageUrl: `/api/images/${fileName}`, // Para compatibilidad con el componente
                        createdAt: metadata.generatedImage?.createdAt || metadata.createdAt,
                        generationTime: metadata.generatedImage?.generationTime || metadata.generationTime || 'Desconocido',
                        size: metadata.generatedImage?.size || metadata.size,
                        
                        // Información de generación
                        generation: metadata.generation,
                        styleId: metadata.generation?.styleId || 'desconocido',
                        celebrityName: metadata.generation?.celebrityName || 'Sin especificar',
                        prompt: metadata.generation?.prompt || '',
                        
                        // Imágenes originales
                        originalImages: metadata.originalImages,
                        
                        // Metadata para el componente
                        hasMetadata: true,
                        timestamp: metadata.timestamp || Date.now()
                    });
                }
                
            } catch (fileError) {
                console.error(`Error procesando ${metadataFile}:`, fileError);
            }
        });
        
        // Ordenar por fecha de creación más reciente
        return images.sort((a, b) => b.timestamp - a.timestamp);
        
    } catch (error) {
        console.error('Error loading generated images:', error);
        return [];
    }
}

/**
 * Obtiene los detalles de una imagen específica por su ID
 */
export async function getImageById(id) {
    try {
        const images = await getGeneratedImages();
        return images.find(image => image.id === id || image.fileName === id);
    } catch (error) {
        console.error('Error getting image by ID:', error);
        return null;
    }
}

/**
 * Obtiene estadísticas de la galería
 */
export async function getGalleryStats() {
    try {
        const images = await getGeneratedImages();
        
        const totalImages = images.length;
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        const averageGenerationTime = images.length > 0 
            ? images.reduce((sum, img) => {
                const time = parseFloat(img.generationTime) || 0;
                return sum + time;
            }, 0) / images.length 
            : 0;
        
        // Obtener el rango de fechas - filtrar fechas válidas
        const validDates = images
            .map(img => new Date(img.createdAt))
            .filter(date => !isNaN(date.getTime()));
        
        const oldestDate = validDates.length > 0 ? new Date(Math.min(...validDates)) : null;
        const newestDate = validDates.length > 0 ? new Date(Math.max(...validDates)) : null;
        
        const stats = {
            totalImages,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            averageGenerationTime: averageGenerationTime.toFixed(2),
            dateRange: {
                oldest: oldestDate?.toISOString(),
                newest: newestDate?.toISOString()
            },
            lastGenerated: newestDate?.toISOString()
        };
        
        return stats;
        
    } catch (error) {
        console.error('Error getting gallery stats:', error);
        return {
            totalImages: 0,
            totalSize: 0,
            totalSizeMB: '0',
            averageGenerationTime: '0',
            dateRange: { oldest: null, newest: null },
            lastGenerated: null
        };
    }
}