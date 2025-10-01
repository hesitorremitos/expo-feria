import type { APIRoute } from 'astro';
import { generatePencilSketch } from '../../lib/pencilSketchGenerator.js';

export const POST: APIRoute = async ({ request }) => {
    console.log('🎨 API Pencil Sketch: Recibiendo petición POST...');
    
    try {
        // Obtener FormData de la petición
        const formData = await request.formData();
        const personFile = formData.get('person') as File;
        const extraDetails = (formData.get('extraDetails') as string) || '';
        const quality = (formData.get('quality') as string) || 'medium';

        // Validar que existe la imagen de persona
        if (!personFile || personFile.size === 0) {
            console.error('❌ No se recibió archivo de persona');
            return new Response(JSON.stringify({
                success: false,
                error: 'Se requiere una imagen de persona para generar el boceto a lápiz'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✏️ Imagen recibida:', {
            name: personFile.name,
            size: personFile.size,
            type: personFile.type
        });

        // Convertir archivo a Buffer
        const personBuffer = Buffer.from(await personFile.arrayBuffer());

        // Llamar al generador
        console.log('🚀 Llamando a generatePencilSketch...');
        const result = await generatePencilSketch({
            personImage: personBuffer,
            extraDetails,
            quality
        });

        console.log('✅ Resultado de generación:', result);

        // Retornar resultado
        return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Error en API Pencil Sketch:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido procesando el boceto a lápiz'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
