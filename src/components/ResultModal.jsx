import React from 'react';

const ResultModal = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-green-600 mb-2">
            ✅ ¡Imagen Generada!
          </h3>
          <p className="text-gray-600">
            {result.message}
          </p>
          {result.generationTime && (
            <p className="text-sm text-gray-500 mt-2">
              ⏱️ Generada en {result.generationTime} segundos
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
        
        {/* Información de archivos */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📄 Archivos utilizados:</h4>
            <div className="text-sm space-y-1">
              <p><strong className="text-primary-700">Persona:</strong> {result.images?.persona}</p>
              <p><strong className="text-primary-700">Celebridad:</strong> {result.images?.celebridad}</p>
            </div>
          </div>
          
          {(result.data?.celebrityName !== 'No especificado' || result.data?.extraDetails !== 'No especificado') && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">✨ Personalización:</h4>
              <div className="text-sm space-y-1">
                {result.data?.celebrityName !== 'No especificado' && (
                  <p><strong className="text-blue-700">Nombre:</strong> {result.data.celebrityName}</p>
                )}
                {result.data?.extraDetails !== 'No especificado' && (
                  <p><strong className="text-blue-700">Detalles:</strong> {result.data.extraDetails}</p>
                )}
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
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
          
          {result.imageUrl && (
            <a 
              href={result.imageUrl} 
              download={result.fileName || 'imagen-generada.png'}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
            >
              📸 Descargar Imagen
            </a>
          )}
          
          <button 
            onClick={() => window.location.reload()}
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