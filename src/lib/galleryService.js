import fs from 'fs';
import path from 'path';

/**
 * Obtiene todas las imágenes generadas de la carpeta uploads con metadatos completos
 */
export function getGeneratedImages() {
    try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const metadataDir = path.join(uploadsDir, 'metadata');
        
        // Verificar si existe el directorio
        if (!fs.existsSync(uploadsDir)) {
            return [];
        }

        // Obtener todos los archivos PNG principales (no los originales)
        const files = fs.readdirSync(uploadsDir)
            .filter(file => 
                file.endsWith('.png') && 
                !file.includes('_person_original') && 
                !file.includes('_celebrity_original')
            )
            .map(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                
                // Buscar metadatos correspondientes
                const baseName = file.replace('.png', '');
                const metadataPath = path.join(metadataDir, `${baseName}_metadata.json`);
                
                let metadata = null;
                if (fs.existsSync(metadataPath)) {
                    try {
                        const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
                        metadata = JSON.parse(metadataContent);
                    } catch (error) {
                        console.error(`Error leyendo metadatos para ${file}:`, error);
                    }
                }

                // Construir objeto de imagen con toda la información
                const imageInfo = {
                    fileName: file,
                    imageUrl: `/uploads/${file}`,
                    createdAt: stats.birthtime,
                    size: stats.size,
                    // Datos básicos (fallback para imágenes sin metadatos)
                    styleId: file.split('_')[0] || 'unknown',
                    timestamp: file.split('_')[1] || Date.now().toString()
                };

                // Si hay metadatos, agregar información completa
                if (metadata) {
                    imageInfo.metadata = metadata;
                    imageInfo.celebrityName = metadata.generation?.celebrityName || 'No especificado';
                    imageInfo.extraDetails = metadata.generation?.extraDetails || 'No especificado';
                    imageInfo.prompt = metadata.generation?.prompt || '';
                    imageInfo.generationTime = metadata.generatedImage?.generationTime || '0';
                    imageInfo.originalImages = metadata.originalImages || null;
                    imageInfo.hasMetadata = true;
                } else {
                    imageInfo.hasMetadata = false;
                }
                
                return imageInfo;
            })
            // Ordenar por fecha más reciente primero
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return files;
    } catch (error) {
        console.error('Error obteniendo imágenes:', error);
        return [];
    }
}

/**
 * Obtiene estadísticas de la galería
 */
export function getGalleryStats() {
    const images = getGeneratedImages();
    
    const totalImages = images.length;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const styleStats = images.reduce((acc, img) => {
        acc[img.styleId] = (acc[img.styleId] || 0) + 1;
        return acc;
    }, {});

    return {
        totalImages,
        totalSize,
        styleStats,
        lastGenerated: images.length > 0 ? images[0].createdAt : null
    };
}