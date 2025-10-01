// Configuración centralizada de estilos de generación
export const STYLE_CONFIGS = {
  'que-paso-ayer-fiesta': {
    name: '¿Qué Pasó Ayer?',
    emoji: '🎬',
    description: 'Aventura épica estilo paparazzi',
    requiredImages: ['person', 'celebrity'],
    hasCelebrity: true,
    displayFields: {
      title: (data) => data.celebrityName || 'Sin celebridad',
      subtitle: (data) => 'Fiesta épica',
      type: 'Generación AI'
    },
    downloads: [
      { key: 'person', label: 'Descargar Persona' },
      { key: 'celebrity', label: 'Descargar Celebridad' }
    ]
  },
  
  'chibi-sticker': {
    name: 'Chibi Sticker Pack',
    emoji: '✨',
    description: 'Pack de 9 stickers kawaii',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: () => 'Pack Chibi Stickers',
      subtitle: (data) => data.theme || 'kawaii',
      type: '9 Stickers Pack'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  },

  'figure-collector': {
    name: 'Figure Collector',
    emoji: '🏆',
    description: 'Figura coleccionable escala 1/7',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: (data) => 'Figura Coleccionable 1/7',
      subtitle: (data) => data.scale || 'Escala 1/7',
      type: 'Figure Collector'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  },

  'buzz-cut-street': {
    name: 'Buzz Cut Street',
    emoji: '✂️',
    description: 'Fresh buzz cut con estilo urbano cinematic',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: (data) => 'Buzz Cut Street Style',
      subtitle: (data) => data.extraDetails || 'Estilo urbano cinematic',
      type: 'Street Style Transformation'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  },

  'film-noir-portrait': {
    name: 'Film Noir Portrait',
    emoji: '🎬',
    description: 'Retrato cinematográfico estilo Film Noir con ambiente Art Deco',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: (data) => 'Film Noir Portrait',
      subtitle: (data) => data.extraDetails || 'Art Deco Lounge',
      type: 'Cinematic Portrait'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  },

  'editorial-portrait': {
    name: 'Editorial Portrait B&W',
    emoji: '📸',
    description: 'Retrato editorial en blanco y negro de alta resolución con film grain',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: (data) => 'Editorial Portrait B&W',
      subtitle: (data) => data.extraDetails || 'Fine Art Photography',
      type: 'Editorial B&W'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  },

  'yarn-doll': {
    name: 'Yarn Doll Crochet',
    emoji: '🧶',
    description: 'Muñeco de crochet tejido a mano estilo chibi amigurumi',
    requiredImages: ['person'],
    hasCelebrity: false,
    displayFields: {
      title: (data) => 'Yarn Doll Chibi',
      subtitle: (data) => data.extraDetails || 'Handmade Amigurumi',
      type: 'Crochet Chibi'
    },
    downloads: [
      { key: 'person', label: 'Descargar Original' }
    ]
  }
};

// Función para obtener configuración de un estilo
export function getStyleConfig(styleId) {
  return STYLE_CONFIGS[styleId] || STYLE_CONFIGS['que-paso-ayer-fiesta'];
}

// Función para normalizar datos de imagen según el estilo
export function normalizeImageData(rawData) {
  const styleId = rawData.generation?.styleId || rawData.styleId || 'que-paso-ayer-fiesta';
  const config = getStyleConfig(styleId);
  
  return {
    ...rawData,
    styleId,
    config,
    // Campos normalizados
    displayTitle: config.displayFields.title(rawData.generation || rawData),
    displaySubtitle: config.displayFields.subtitle(rawData.generation || rawData),
    displayType: config.displayFields.type,
    // Imágenes disponibles
    availableImages: config.requiredImages.filter(key => rawData.originalImages?.[key]),
    // Downloads disponibles
    availableDownloads: config.downloads.filter(download => rawData.originalImages?.[download.key])
  };
}