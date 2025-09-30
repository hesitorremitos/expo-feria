import React from 'react';

const OriginalImagesGrid = ({ image, formatFileSize }) => {
  const { availableImages, originalImages } = image;
  
  if (!availableImages.length) return null;

  return (
    <div className="mb-8">
      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
        Imágenes Originales
      </h4>
      <div className={`grid gap-4 ${availableImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {availableImages.map((imageKey) => {
          const imageData = originalImages[imageKey];
          const label = imageKey === 'person' ? 'Persona' : 
                       imageKey === 'celebrity' ? 'Celebridad' : 
                       imageKey.charAt(0).toUpperCase() + imageKey.slice(1);
          
          return (
            <div key={imageKey} className="bg-white p-3 rounded-lg border">
              <strong className="text-gray-700 block mb-2">{label}</strong>
              <img 
                src={imageData.url} 
                alt={`Imagen original de ${label.toLowerCase()}`}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <p className="text-xs text-gray-500">{formatFileSize(imageData.size)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OriginalImagesGrid;