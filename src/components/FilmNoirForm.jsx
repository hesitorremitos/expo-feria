import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';
import GenerationLoader from './GenerationLoader.jsx';

const FilmNoirForm = () => {
  const [formData, setFormData] = useState({
    personImage: null,
    extraDetails: '',
    quality: 'medium'
  });
  
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manejar subida de imagen
  const handleImageUpload = useCallback((uploaderId, file) => {
    setFormData(prev => ({
      ...prev,
      personImage: file
    }));
  }, []);

  // Manejar cambios en inputs de texto
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Validar si el formulario está completo
  const isFormValid = !!formData.personImage;

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFormValid) {
      alert('Por favor sube tu foto');
      return;
    }

    console.log('🎬 Iniciando generación de Film Noir Portrait...');
    setIsGenerating(true);

    const submitData = new FormData();
    submitData.append('personImage', formData.personImage);
    submitData.append('extraDetails', formData.extraDetails);
    submitData.append('quality', formData.quality);

    try {
      console.log('📤 Enviando petición a /api/generate-film-noir...');
      const response = await fetch('/api/generate-film-noir', {
        method: 'POST',
        body: submitData
      });

      console.log('📥 Respuesta recibida:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📊 Resultado procesado:', result);

      if (result.success) {
        console.log('✅ Generación exitosa, mostrando modal...');
        setTimeout(() => {
          setResult(result);
        }, 100);
      } else {
        console.error('❌ Error en generación:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Error en petición:', error);
      try {
        alert(`Error: ${error.message || 'Error desconocido'}`);
      } catch (alertError) {
        console.error('Error mostrando alerta:', alertError);
      }
    } finally {
      console.log('🏁 Finalizando proceso de generación...');
      setIsGenerating(false);
    }
  };

  // Cerrar modal de resultado
  const handleCloseResult = useCallback(() => {
    console.log('🔴 FilmNoirForm: Closing result modal');
    setResult(null);
  }, []);

  // Manejar cancelación de generación
  const handleCancelGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      personImage: null,
      extraDetails: '',
      quality: 'medium'
    });
    setResult(null);
  }, []);

  // Manejar eventos globales de subida de imágenes
  React.useEffect(() => {
    const handleImageUploaded = (event) => {
      const { uploaderId, file } = event.detail;
      handleImageUpload(uploaderId, file);
    };

    window.addEventListener('imageUploaded', handleImageUploaded);
    
    return () => {
      window.removeEventListener('imageUploaded', handleImageUploaded);
    };
  }, [handleImageUpload]);

  // Capturar errores no manejados
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('🚨 Error no manejado capturado:', event.error);
      event.preventDefault();
      return false;
    };

    const handleUnhandledRejection = (event) => {
      console.error('🚨 Promise rejection no manejada:', event.reason);
      event.preventDefault();
      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="p-8">
      
      <div className="space-y-8">
        
        {/* Control de calidad */}
        <div className="bg-gradient-to-r from-gray-900 to-zinc-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 text-center">
            ⚙️ Calidad de generación
          </h3>
          <div className="flex justify-center space-x-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value="medium"
                checked={formData.quality === 'medium'}
                onChange={handleInputChange}
                className="w-4 h-4 text-gray-400 border-gray-600 focus:ring-gray-500"
              />
              <span className="text-sm font-medium text-gray-300">
                🎬 Media (Más rápido)
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value="high"
                checked={formData.quality === 'high'}
                onChange={handleInputChange}
                className="w-4 h-4 text-amber-500 border-amber-400 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-gray-300">
                ✨ Alta (Mejor calidad)
              </span>
            </label>
          </div>
        </div>

        {/* Subida de imagen */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 text-center">
            📸 Sube tu foto
          </h3>
          
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="person-image"
              placeholder="Arrastra tu foto aquí o haz clic para seleccionar"
              className="aspect-square"
            />
            <p className="text-xs text-gray-600 mt-2 text-center">
              Tu foto se transformará en un retrato Film Noir cinematográfico 🎬
            </p>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="space-y-4">
          <label htmlFor="extraDetails" className="block text-sm font-semibold text-gray-800 text-center">
            🎯 Detalles adicionales (opcional)
          </label>
          <div className="max-w-lg mx-auto">
            <textarea
              id="extraDetails"
              name="extraDetails"
              value={formData.extraDetails}
              onChange={handleInputChange}
              rows="3"
              placeholder="Ej: Efecto sepia, más grano vintage, salón victoriano, expresión solemne, muebles antiguos..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-gray-700 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-600 mt-2 text-center">
              Personaliza la textura vintage, ambiente 1800s o detalles victorianos de tu retrato
            </p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="text-center space-y-4">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }}
            disabled={!isFormValid || isGenerating}
            className="bg-gradient-to-r from-gray-900 via-zinc-800 to-stone-900 hover:from-black hover:via-zinc-900 hover:to-stone-950 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg border border-amber-600/30"
          >
            {isGenerating ? 'Creando tu Retrato del Siglo XIX...' : '📜 Crear Retrato Histórico'}
          </Button>

          {formData.personImage && (
            <Button
              type="button"
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm ml-4"
            >
              Limpiar formulario
            </Button>
          )}
        </div>

        {/* Información sobre Film Noir */}
        <div className="bg-gradient-to-br from-gray-100 to-zinc-100 rounded-xl p-6 border border-gray-300 max-w-2xl mx-auto">
          <div className="text-center text-sm text-gray-800 space-y-2">
            <p className="font-semibold text-base">📜 ¿Qué es el Retrato del Siglo XIX?</p>
            <p>Una fotografía histórica inspirada en los retratos americanos del 1800s, con estilo daguerrotipo/tintype y elegante ambiente victoriano ✨</p>
            <p className="text-xs text-gray-600">Perfecto para capturar la elegancia, nostalgia y sofisticación de la América antigua 🏛️</p>
          </div>
        </div>

      </div>

      {/* Loader de generación */}
      <GenerationLoader 
        isVisible={isGenerating} 
        onCancel={handleCancelGeneration}
      />

      {/* Modal de resultado */}
      {result && (
        <ResultModal
          result={result}
          onClose={handleCloseResult}
        />
      )}

    </div>
  );
};

export default FilmNoirForm;
