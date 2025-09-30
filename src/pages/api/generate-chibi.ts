// Endpoint específico para generar Pack de Chibi Stickers - Solo requiere foto de persona
import type { APIRoute } from 'astro';
import { generateChibiSticker } from '../../lib/chibiGenerator.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        
        const personImage = formData.get('personImage') as File;
        const extraDetails = formData.get('extraDetails') as string || '';
        const quality = formData.get('quality') as string || 'medium';

        if (!personImage) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Falta la foto de persona'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar calidad
        if (quality !== 'medium' && quality !== 'high') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Calidad debe ser "medium" o "high"'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convertir archivo a Buffer para OpenAI
        const personBuffer = Buffer.from(await personImage.arrayBuffer());

        // Generar pack de chibi stickers
        console.log('🎨 Procesando solicitud de pack chibi stickers...');
        const result = await generateChibiSticker({
            personImage: personBuffer,
            extraDetails,
            quality
        });

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: '¡Pack de chibi stickers generado exitosamente!',
                imageUrl: result.imageUrl,
                fileName: result.fileName,
                generationTime: result.generationTime,
                prompt: result.prompt,
                styleId: 'chibi-sticker',
                images: {
                    persona: personImage.name
                },
                data: {
                    extraDetails: extraDetails || 'Estilo chibi por defecto',
                    type: '9-pack chibi stickers',
                    theme: 'kawaii'
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