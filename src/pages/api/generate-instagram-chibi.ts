import type { APIRoute } from 'astro';
import { generateInstagramChibi } from '../../lib/instagramChibiGenerator.js';

export const POST: APIRoute = async ({ request }) => {
    console.log('🎨 API Instagram Chibi: Recibiendo petición POST...');
    
    try {
        const formData = await request.formData();
        const personFile = formData.get('person') as File;
        const extraDetails = (formData.get('extraDetails') as string) || '';
        const quality = (formData.get('quality') as string) || 'medium';

        if (!personFile || personFile.size === 0) {
            console.error('❌ No se recibió archivo de persona');
            return new Response(JSON.stringify({
                success: false,
                error: 'Se requiere una imagen de persona para generar el Instagram Chibi'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('📱 Imagen recibida:', {
            name: personFile.name,
            size: personFile.size,
            type: personFile.type
        });

        const personBuffer = Buffer.from(await personFile.arrayBuffer());

        console.log('🚀 Llamando a generateInstagramChibi...');
        const result = await generateInstagramChibi({
            personImage: personBuffer,
            extraDetails,
            quality
        });

        console.log('✅ Resultado de generación:', result);

        return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Error en API Instagram Chibi:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido procesando el Instagram Chibi'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
