import type { APIRoute } from 'astro';
import { generatePolaroidChibi } from '../../lib/polaroidChibiGenerator.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();
		const personImageFile = formData.get('person') as File;
		const extraDetails = (formData.get('extraDetails') as string) || '';
		const quality = (formData.get('quality') as string) || 'medium';

		if (!personImageFile) {
			return new Response(
				JSON.stringify({ 
					success: false, 
					error: 'La imagen de la persona es requerida' 
				}),
				{ 
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Convertir File a Buffer
		const personImageBuffer = Buffer.from(await personImageFile.arrayBuffer());

		const result = await generatePolaroidChibi({
			personImage: personImageBuffer,
			extraDetails,
			quality
		});

		return new Response(
			JSON.stringify(result),
			{ 
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);

	} catch (error) {
		console.error('Error in generate-polaroid-chibi API:', error);
		return new Response(
			JSON.stringify({ 
				success: false, 
				error: error instanceof Error ? error.message : 'Error desconocido al generar la imagen'
			}),
			{ 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
