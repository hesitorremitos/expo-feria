import React from 'react';
import { getStyleConfig } from '../lib/styleConfig.js';

const ResultModal = ({ result, onClose }) => {
  if (!result) {
    console.log('🚫 ResultModal: No result provided');
    return null;
  }

  console.log('🎭 ResultModal: Rendering with result:', result);

  // Obtener configuración dinámica del estilo
  const styleConfig = getStyleConfig(result.styleId);
  const hasImages = result.images && Object.keys(result.images).length > 0;

  console.log('🎨 ResultModal: Style config:', styleConfig);

  // UseEffect para detectar si el modal se desmonta inesperadamente
  React.useEffect(() => {
    console.log('🔄 ResultModal: Component mounted/updated');
    return () => {
      console.log('🗑️ ResultModal: Component unmounting');
    };
  }, [result]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header dinámico */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-green-600 mb-2">
            {styleConfig.emoji} ¡{styleConfig.name} Generado!
          </h3>
          <p className="text-gray-600">
            {result.message || `Tu ${styleConfig.description} ha sido creado exitosamente`}
          </p>
          {result.generationTime && (
            <p className="text-sm text-gray-500 mt-2">
              ⏱️ Generado en {result.generationTime} segundos usando {result.styleId === 'figure-collector' ? 'nano-banana-oss' : 'gpt-image-1'}
            </p>
          )}
        </div>
        
        {/* Imagen generada */}
        {result.imageUrl && (
          <div className="mb-6">
            <img 
              src={result.imageUrl} 
              alt="Imagen generada" 
              className="w-full rounded-xl shadow-lg border-2 border-gray-200"
            />
          </div>
        )}
        
        {/* Información de archivos - Dinámico según styleConfig */}
        <div className="space-y-4 mb-6">
          {hasImages && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📄 Archivos utilizados:</h4>
              <div className="text-sm space-y-1">
                {styleConfig.requiredImages.map((imageKey) => {
                  const actualKey = imageKey === 'person' ? 'persona' : imageKey; // Mapeo para compatibilidad
                  const fileName = result.images[actualKey] || result.images[imageKey];
                  
                  if (fileName) {
                    const label = styleConfig.downloads.find(d => d.key === imageKey)?.label || 
                                 (imageKey === 'person' || imageKey === 'persona' ? 'Persona' : 
                                  imageKey === 'celebrity' || imageKey === 'celebridad' ? 'Celebridad' : 
                                  imageKey.charAt(0).toUpperCase() + imageKey.slice(1));
                    
                    return (
                      <p key={imageKey}>
                        <strong className="text-primary-700">{label}:</strong> {fileName}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {/* Personalización dinámica según el estilo */}
          {result.data && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                {styleConfig.emoji} {styleConfig.description}
              </h4>
              <div className="text-sm space-y-1">
                {/* Mostrar información específica del estilo */}
                {result.data.celebrityName && result.data.celebrityName !== 'No especificado' && (
                  <p><strong className="text-blue-700">Celebridad:</strong> {result.data.celebrityName}</p>
                )}
                {result.data.type && (
                  <p><strong className="text-blue-700">Tipo:</strong> {result.data.type}</p>
                )}
                {result.data.scale && (
                  <p><strong className="text-blue-700">Escala:</strong> {result.data.scale}</p>
                )}
                {result.data.theme && (
                  <p><strong className="text-blue-700">Tema:</strong> {result.data.theme}</p>
                )}
                {result.data.extraDetails && 
                 result.data.extraDetails !== 'No especificado' && 
                 result.data.extraDetails !== 'Figura coleccionable estándar' && 
                 result.data.extraDetails.trim() !== '' && (
                  <p><strong className="text-blue-700">Detalles:</strong> {result.data.extraDetails}</p>
                )}
                
                {/* Mostrar título y subtítulo dinámicos */}
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p><strong className="text-blue-700">Generación:</strong> {styleConfig.displayFields.title(result.data)}</p>
                  <p><strong className="text-blue-700">Categoría:</strong> {styleConfig.displayFields.type}</p>
                </div>
              </div>
            </div>
          )}

          {result.prompt && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎨 Prompt usado:</h4>
              <p className="text-sm text-purple-700 italic">{result.prompt}</p>
            </div>
          )}
        </div>
        
        {/* Botones dinámicos */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 ResultModal: Close button clicked');
              onClose();
            }}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
          
          {result.imageUrl && (
            <a 
              href={result.imageUrl} 
              download={result.fileName || `${styleConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
            >
              📸 Descargar Imagen
            </a>
          )}
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = '/gallery';
            }}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            🖼️ Ver Galería
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // En lugar de recargar, mejor resetear el formulario
              onClose();
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
            className="flex-1 bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors font-medium"
          >
            🔄 Generar Otra
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;