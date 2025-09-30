// Endpoint específico para generar Figuras Coleccionables - Solo requiere foto de persona
import type { APIRoute } from 'astro';
import { generateFigureCollector } from '../../lib/figureGenerator.js';

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

        // Generar figura coleccionable
        console.log('⚡ Procesando solicitud de figura coleccionable...');
        const result = await generateFigureCollector({
            personImage: personBuffer,
            extraDetails,
            quality
        });

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: '¡Figura coleccionable generada exitosamente!',
                imageUrl: result.imageUrl,
                fileName: result.fileName,
                generationTime: result.generationTime,
                prompt: result.prompt,
                styleId: 'figure-collector',
                images: {
                    person: personImage.name
                },
                data: {
                    extraDetails: extraDetails || 'Figura coleccionable estándar',
                    type: 'Figura escala 1/7',
                    theme: 'collectible-figure',
                    scale: '1/7'
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