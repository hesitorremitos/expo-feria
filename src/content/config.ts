import { defineCollection, z } from 'astro:content';

// Colección para metadatos de imágenes generadas
const generatedImages = defineCollection({
  type: 'data',
  schema: z.object({
    // Imagen generada
    generatedImage: z.object({
      fileName: z.string(),
      url: z.string(), // Cambiado de z.string().url() a z.string() para permitir URLs relativas
      createdAt: z.string().datetime(),
      generationTime: z.string(),
      size: z.number()
    }),
    
    // Imágenes originales
    originalImages: z.object({
      person: z.object({
        fileName: z.string(),
        url: z.string(), // Cambiado de z.string().url() a z.string()
        size: z.number()
      }),
      celebrity: z.object({
        fileName: z.string(),
        url: z.string(), // Cambiado de z.string().url() a z.string()
        size: z.number()
      })
    }),
    
    // Parámetros de generación
    generation: z.object({
      styleId: z.string(),
      celebrityName: z.string(),
      extraDetails: z.string(),
      prompt: z.string(),
      model: z.string(),
      quality: z.string(),
      size: z.string()
    }),
    
    // Metadata adicional
    timestamp: z.number(),
    version: z.string()
  })
});

export const collections = {
  'generated-images': generatedImages,
};