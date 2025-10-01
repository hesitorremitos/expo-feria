export const prerender = false;

import { getGeneratedImages } from '../../lib/galleryService.js';
import { normalizeImageData } from '../../lib/styleConfig.js';

export async function GET() {
  try {
    const images = await getGeneratedImages();
    
    if (images.length === 0) {
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        image: null,
        totalImages: 0
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Normalizar y obtener la última imagen
    const normalizedImages = images.map(img => normalizeImageData(img));
    const latest = normalizedImages[0]; // Ya están ordenadas por fecha descendente
    
    return new Response(JSON.stringify({
      timestamp: latest.timestamp || Date.now(),
      image: latest,
      totalImages: normalizedImages.length,
      imageId: latest.id || latest.fileName
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error getting latest image:', error);
    return new Response(JSON.stringify({
      error: 'Error loading images',
      timestamp: Date.now(),
      image: null,
      totalImages: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
