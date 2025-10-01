import type { APIRoute } from 'astro';
import { generateFilmNoirPortrait } from '../../lib/filmNoirGenerator.js';

/**
 * API endpoint para generar imágenes con estilo Film Noir Portrait
 * POST /api/generate-film-noir
 */
export const POST: APIRoute = async ({ request }) => {
    console.log('📡 [API] Solicitud Film Noir Portrait recibida');
    
    try {
        // 1. Verificar content-type
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            console.error('❌ [API] Content-Type inválido:', contentType);
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Content-Type debe ser multipart/form-data' 
                }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 2. Procesar form data
        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const extraDetails = (formData.get('extraDetails') as string) || '';
        const quality = (formData.get('quality') as string) || 'medium';

        console.log('📝 [API] Datos recibidos:', {
            personImage: personImage ? `${personImage.name} (${personImage.size} bytes)` : 'No enviada',
            extraDetails: extraDetails || 'Sin detalles adicionales',
            quality
        });

        // 3. Validar imagen obligatoria
        if (!personImage || personImage.size === 0) {
            console.error('❌ [API] Imagen de persona no proporcionada');
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'La imagen de la persona es obligatoria para el Film Noir Portrait' 
                }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 4. Validar que sea una imagen
        if (!personImage.type.startsWith('image/')) {
            console.error('❌ [API] Archivo no es imagen:', personImage.type);
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'El archivo debe ser una imagen válida' 
                }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 4.5. Convertir imagen a Buffer para el generador
        const personImageBuffer = Buffer.from(await personImage.arrayBuffer());
        console.log('🔄 [API] Imagen convertida a Buffer:', personImageBuffer.length, 'bytes');

        // 5. Generar Film Noir Portrait
        console.log('🚀 [API] Iniciando generación Film Noir Portrait...');
        const result = await generateFilmNoirPortrait({
            personImage: personImageBuffer,
            extraDetails,
            quality: quality as 'low' | 'medium' | 'high'
        });

        // 6. Procesar resultado
        if (result.success) {
            console.log('✅ [API] Film Noir Portrait generado exitosamente:', {
                fileName: result.fileName,
                generationTime: result.generationTime
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    message: '¡Film Noir Portrait generado exitosamente!',
                    imageUrl: result.imageUrl,
                    fileName: result.fileName,
                    generationTime: result.generationTime,
                    styleId: result.styleId,
                    prompt: result.prompt,
                    images: {
                        person: personImage.name
                    },
                    metadata: {
                        style: 'Film Noir Portrait',
                        setting: 'Art Deco Lounge',
                        extraDetails: extraDetails || 'Estilo estándar'
                    }
                }),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        } else {
            console.error('❌ [API] Error en generación:', result.error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: result.error,
                    generationTime: result.generationTime
                }),
                { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

    } catch (error) {
        console.error('💥 [API] Error inesperado:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido al generar Film Noir Portrait'
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
