// @ts-nocheck
import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

// Ruta de datos fuera del build
const DATA_DIR = path.resolve(process.cwd(), 'data', 'generated');

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Obtener la ruta completa del archivo desde los parámetros
    const filePath = params.path;
    
    if (!filePath) {
      return new Response('File path not provided', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Construir la ruta completa del archivo
    const fullFilePath = path.join(DATA_DIR, filePath);
    
    // Verificar que el archivo esté dentro de la carpeta data (seguridad)
    if (!fullFilePath.startsWith(DATA_DIR)) {
      return new Response('Access denied', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Verificar si el archivo existe
    if (!fs.existsSync(fullFilePath)) {
      return new Response('File not found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Obtener información del archivo
    const stats = fs.statSync(fullFilePath);
    const ext = path.extname(fullFilePath).toLowerCase();
    
    // Determinar el tipo de contenido
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.txt': 'text/plain',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Configurar headers de respuesta
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 año para imágenes generadas
      'X-Content-Type-Options': 'nosniff',
    });
    
    // Para imágenes, agregar headers adicionales
    if (contentType.startsWith('image/')) {
      headers.set('X-Image-Generated', 'true');
      headers.set('Last-Modified', stats.mtime.toUTCString());
    }

    // Verificar si el cliente ya tiene la versión más reciente (ETag)
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    headers.set('ETag', etag);
    
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: { 'ETag': etag }
      });
    }

    // Leer y devolver el archivo
    // Para archivos grandes, usar streaming (ReadableStream)
    if (stats.size > 1024 * 1024) { // > 1MB
      const stream = new ReadableStream({
        start(controller) {
          const fileStream = createReadStream(fullFilePath);
          
          fileStream.on('data', (chunk) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          
          fileStream.on('end', () => {
            controller.close();
          });
          
          fileStream.on('error', (error) => {
            controller.error(error);
          });
        }
      });
      
      return new Response(stream, {
        status: 200,
        headers: headers
      });
    } else {
      // Para archivos pequeños, leer directamente en memoria
      const fileBuffer = fs.readFileSync(fullFilePath);
      
      return new Response(fileBuffer, {
        status: 200,
        headers: headers
      });
    }

  } catch (error) {
    console.error('Error serving dynamic file:', error);
    
    // Log del error para debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        path: params.path
      });
    }
    
    return new Response('Internal server error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};