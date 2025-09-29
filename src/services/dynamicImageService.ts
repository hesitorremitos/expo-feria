import type { LocalImageService, ImageTransform, AstroConfig } from "astro";
import fs from 'fs';
import path from 'path';

/**
 * Servicio de imágenes personalizado para Astro
 * Maneja imágenes generadas dinámicamente fuera de la carpeta public
 */
const dynamicImageService: LocalImageService = {
  /**
   * Valida y procesa las opciones de transformación de imagen
   */
  validateOptions(options: ImageTransform, imageConfig: AstroConfig['image']) {
    // Verificar que las dimensiones estén dentro de límites razonables
    const maxSize = 2048;
    
    if (options.width && options.width > maxSize) {
      console.warn(`Image width ${options.width} exceeds maximum ${maxSize}. Using maximum.`);
      options.width = maxSize;
    }
    
    if (options.height && options.height > maxSize) {
      console.warn(`Image height ${options.height} exceeds maximum ${maxSize}. Using maximum.`);
      options.height = maxSize;
    }

    return options;
  },

  /**
   * Genera la URL para acceder a la imagen
   */
  getURL(options: ImageTransform, imageConfig: AstroConfig['image']) {
    const { src } = options;
    
    // Para imágenes generadas dinámicamente, usar nuestro endpoint
    if (typeof src === 'string' && src.startsWith('/generated/')) {
      return src.replace('/generated/', '/api/images/');
    }
    
    // Para otras imágenes, usar la ruta estándar
    return src as string;
  },

  /**
   * Parsea la URL para extraer parámetros de transformación
   */
  parseURL(url: URL, imageConfig: AstroConfig['image']) {
    const searchParams = url.searchParams;
    
    return {
      src: url.pathname.replace('/api/images/', ''),
      width: searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined,
      height: searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined,
      format: (searchParams.get('f') as any) || 'png',
      quality: searchParams.get('q') ? parseInt(searchParams.get('q')!) : undefined,
    };
  },

  /**
   * Transforma la imagen (en nuestro caso, simplemente la lee)
   */
  async transform(inputBuffer: Uint8Array, options: ImageTransform, imageConfig: AstroConfig['image']) {
    const { src, width, height, format, quality } = options;
    
    try {
      // Ruta al archivo en el sistema de archivos
      const DATA_DIR = path.resolve(process.cwd(), 'data', 'generated');
      const filePath = path.join(DATA_DIR, src as string);
      
      // Verificar que el archivo existe y está en el directorio permitido
      if (!filePath.startsWith(DATA_DIR) || !fs.existsSync(filePath)) {
        throw new Error(`File not found: ${src}`);
      }

      // Leer el archivo
      const fileBuffer = fs.readFileSync(filePath);
      
      // TODO: Aquí podrías agregar transformaciones reales con Sharp si es necesario
      // Por ahora, devolvemos el archivo tal como está
      
      return {
        data: fileBuffer,
        format: format || 'png',
      };
      
    } catch (error) {
      console.error('Error transforming image:', error);
      throw error;
    }
  },

  /**
   * Configura atributos HTML adicionales para la imagen
   */
  getHTMLAttributes(options: ImageTransform, imageConfig: AstroConfig['image']) {
    const { src, width, height, format, ...attributes } = options;
    
    return {
      ...attributes,
      loading: options.loading ?? 'lazy',
      decoding: options.decoding ?? 'async',
    };
  }
};

export default dynamicImageService;