import type { APIRoute } from 'astro';
import { generateBuzzCutStreet } from '../../lib/buzzCutGenerator.js';

/**
 * API endpoint para generar imágenes con estilo buzz cut street
 * POST /api/generate-buzz-cut
 */
export const POST: APIRoute = async ({ request }) => {
    console.log('📡 [API] Solicitud buzz cut street recibida');
    
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
                    error: 'La imagen de la persona es obligatoria para el buzz cut street' 
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

        // 5. Generar buzz cut street style
        console.log('🚀 [API] Iniciando generación buzz cut street...');
        const result = await generateBuzzCutStreet({
            personImage: personImageBuffer,
            extraDetails,
            quality: quality as 'low' | 'medium' | 'high'
        });

        // 6. Procesar resultado
        if (result.success) {
            console.log('✅ [API] Buzz cut street generado exitosamente:', {
                fileName: result.fileName,
                generationTime: result.generationTime
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    message: '¡Buzz cut street style generado exitosamente!',
                    imageUrl: result.imageUrl,
                    fileName: result.fileName,
                    generationTime: result.generationTime,
                    styleId: result.styleId,
                    prompt: result.prompt,
                    images: {
                        person: personImage.name
                    },
                    data: {
                        extraDetails: extraDetails || 'Buzz cut street style estándar',
                        type: 'Buzz Cut Street Style',
                        theme: 'street-style'
                    }
                }),
                { 
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                }
            );
        } else {
            console.error('❌ [API] Error en generación buzz cut street:', result.error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: result.error,
                    generationTime: result.generationTime,
                    styleId: result.styleId
                }),
                { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

    } catch (error) {
        console.error('💥 [API] Error crítico en buzz cut street:', error);
        
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor en buzz cut street',
                details: error instanceof Error ? error.stack : undefined
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

// Configurar métodos permitidos
export const prerender = false;