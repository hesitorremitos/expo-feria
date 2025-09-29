import type { APIRoute } from 'astro';
import { generateImage } from '../../lib/imageGenerator.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        
        const personImage = formData.get('person_image') as File;
        const celebrityImage = formData.get('celebrity_image') as File;
        const celebrityName = formData.get('celebrity_name') as string || '';
        const extraDetails = formData.get('extra_details') as string || '';

        if (!personImage || !celebrityImage) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Faltan imágenes'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convertir archivos a Buffer para OpenAI
        const personBuffer = Buffer.from(await personImage.arrayBuffer());
        const celebrityBuffer = Buffer.from(await celebrityImage.arrayBuffer());

        // Generar imagen usando el servicio
        const result = await generateImage({
            personImage: personBuffer,
            celebrityImage: celebrityBuffer,
            celebrityName,
            extraDetails,
            styleId: 'que-paso-ayer-fiesta'
        });

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: '¡Imagen generada exitosamente!',
                imageUrl: result.imageUrl,
                fileName: result.fileName,
                generationTime: result.generationTime,
                prompt: result.prompt,
                // Mantener info original para compatibilidad
                images: {
                    persona: personImage.name,
                    celebridad: celebrityImage.name
                },
                data: {
                    celebrityName: celebrityName || 'No especificado',
                    extraDetails: extraDetails || 'No especificado'
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: result.error,
                generationTime: result.generationTime
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};