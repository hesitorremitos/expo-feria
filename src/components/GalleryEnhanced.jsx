import React, { useState } from 'react';

const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen || !image) return null;

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative max-w-6xl w-full bg-gray-900 rounded-2xl overflow-hidden">
        {/* Header del modal */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black via-black/70 to-transparent p-6">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">{image.fileName}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  {image.styleId}
                </span>
                {image.generationTime && <span>⏱️ {image.generationTime}s</span>}
                <span>📅 {formatDate(image.createdAt)}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
          {/* Imagen principal */}
          <div className="relative bg-black flex items-center justify-center p-8 pt-24">
            <img 
              src={image.imageUrl} 
              alt={`Imagen generada - ${image.styleId}`}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Panel de información */}
          <div className="bg-gray-50 p-8 pt-24 overflow-y-auto max-h-[80vh]">
            
            {/* Información de generación */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Información de Generación
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <strong className="text-gray-700">Estilo:</strong>
                  <p className="text-gray-600 mt-1">{image.styleId}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <strong className="text-gray-700">Tamaño:</strong>
                  <p className="text-gray-600 mt-1">{formatFileSize(image.size)}</p>
                </div>
                {image.generationTime && (
                  <div className="bg-white p-3 rounded-lg">
                    <strong className="text-gray-700">Tiempo:</strong>
                    <p className="text-gray-600 mt-1">{image.generationTime} segundos</p>
                  </div>
                )}
                <div className="bg-white p-3 rounded-lg">
                  <strong className="text-gray-700">Calidad:</strong>
                  <p className="text-gray-600 mt-1">
                    {image.generation?.quality === 'high' ? '🎨 Alta' : '⚡ Media'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <strong className="text-gray-700">Creado:</strong>
                  <p className="text-gray-600 mt-1">{formatDate(image.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Detalles extra - Solo si el usuario los añadió */}
            {image.hasMetadata && 
             image.extraDetails && 
             image.extraDetails !== 'No especificado' && 
             image.extraDetails.trim() && 
             image.extraDetails.trim().length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                  Detalles Personalizados
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-purple-700 leading-relaxed">{image.extraDetails}</p>
                </div>
              </div>
            )}

            {/* Imágenes originales */}
            {image.originalImages && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  Imágenes Originales
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="text-gray-700 block mb-2">Persona</strong>
                    <img 
                      src={image.originalImages.person.url} 
                      alt="Imagen original de la persona"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-gray-500">{formatFileSize(image.originalImages.person.size)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <strong className="text-gray-700 block mb-2">Celebridad</strong>
                    <img 
                      src={image.originalImages.celebrity.url} 
                      alt="Imagen original de la celebridad"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-gray-500">{formatFileSize(image.originalImages.celebrity.size)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-3">
              <a 
                href={image.imageUrl} 
                download={image.fileName}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
              >
                Descargar Imagen Generada
              </a>
              
              {image.originalImages && (
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={image.originalImages.person.url} 
                    download={image.originalImages.person.fileName}
                    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors text-center block"
                  >
                    Descargar Persona
                  </a>
                  <a 
                    href={image.originalImages.celebrity.url} 
                    download={image.originalImages.celebrity.fileName}
                    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors text-center block"
                  >
                    Descargar Celebridad
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryGrid = ({ images, onImageClick }) => {
  const [filter, setFilter] = useState('all');
  
  // Obtener estilos únicos para filtros
  const uniqueStyles = [...new Set(images.map(img => img.styleId))];
  
  // Filtrar imágenes
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.styleId === filter);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todas ({images.length})
        </button>
        
        {uniqueStyles.map(style => {
          const count = images.filter(img => img.styleId === style).length;
          return (
            <button
              key={style}
              onClick={() => setFilter(style)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === style 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {style} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de imágenes */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay imágenes</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aún no se han generado imágenes. ¡Crea la primera!' 
              : `No hay imágenes para el filtro "${filter}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div 
              key={image.id || image.fileName || `image-${Math.random()}`}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
              onClick={() => onImageClick(image)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={image.imageUrl} 
                  alt={`Imagen generada - ${image.styleId}`}
                  className="w-full h-64 object-cover group-hover:brightness-110 transition-all duration-200"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Error cargando imagen:', image.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Badges de información */}
                <div className="absolute top-3 left-3 space-y-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {image.styleId}
                  </span>
                  {image.hasMetadata && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium block">
                      Completa
                    </span>
                  )}
                </div>
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-semibold truncate">{image.celebrityName || 'Sin celebridad'}</p>
                    <p className="text-xs opacity-80">
                      {new Date(image.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {image.generationTime && (
                      <p className="text-xs opacity-80">⏱️ {image.generationTime}s</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay imágenes */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay imágenes {filter !== 'all' ? `de ${filter}` : ''}
          </h3>
          <p className="text-gray-500">
            {filter !== 'all' 
              ? 'Intenta con otro filtro o genera nuevas imágenes'
              : 'Genera tu primera imagen para verla aquí'
            }
          </p>
        </div>
      )}
    </div>
  );
};

const Gallery = ({ images, stats }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const imagesWithMetadata = images.filter(img => img.hasMetadata).length;

  return (
    <div className="space-y-8">
      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{stats.totalImages}</div>
          <div className="text-blue-100">Imágenes Generadas</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{formatFileSize(stats.totalSize)}</div>
          <div className="text-green-100">Espacio Utilizado</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="text-3xl font-bold">{imagesWithMetadata}</div>
          <div className="text-purple-100">Con Metadatos</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="text-xl font-bold">
            {stats.lastGenerated 
              ? new Date(stats.lastGenerated).toLocaleDateString('es-ES')
              : 'N/A'
            }
          </div>
          <div className="text-orange-100">Última Generación</div>
        </div>
      </div>

      {/* Grid de imágenes */}
      <GalleryGrid images={images} onImageClick={handleImageClick} />

      {/* Modal mejorado */}
      <ImageModal 
        image={selectedImage}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Gallery;