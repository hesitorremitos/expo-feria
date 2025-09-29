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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Imagen */}
        <img 
          src={image.imageUrl} 
          alt={`Imagen generada - ${image.styleId}`}
          className="max-w-full max-h-full rounded-lg shadow-2xl"
        />

        {/* Información */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
          <div className="text-white space-y-2">
            <p className="text-lg font-semibold">{image.fileName}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Estilo:</strong> {image.styleId}</p>
              <p><strong>Tamaño:</strong> {formatFileSize(image.size)}</p>
              <p><strong>Creado:</strong> {formatDate(image.createdAt)}</p>
              <p>
                <a 
                  href={image.imageUrl} 
                  download={image.fileName}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  📸 Descargar
                </a>
              </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.map((image, index) => (
          <div 
            key={image.fileName}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={() => onImageClick(image)}
          >
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img 
                src={image.imageUrl} 
                alt={`Imagen generada - ${image.styleId}`}
                className="w-full h-64 object-cover group-hover:brightness-110 transition-all duration-200"
                loading="lazy"
              />
              
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-semibold">{image.styleId}</p>
                  <p className="text-xs opacity-80">
                    {new Date(image.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

  return (
    <div className="space-y-8">
      {/* Estadísticas */}
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
          <div className="text-3xl font-bold">{Object.keys(stats.styleStats).length}</div>
          <div className="text-purple-100">Estilos Únicos</div>
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

      {/* Modal */}
      <ImageModal 
        image={selectedImage}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Gallery;