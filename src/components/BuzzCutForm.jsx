import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';
import GenerationLoader from './GenerationLoader.jsx';

const BuzzCutForm = () => {
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

    console.log('✂️ Iniciando generación de Buzz Cut Street...');
    setIsGenerating(true);

    const submitData = new FormData();
    submitData.append('personImage', formData.personImage);
    submitData.append('extraDetails', formData.extraDetails);
    submitData.append('quality', formData.quality);

    try {
      console.log('� Enviando petición a /api/generate-buzz-cut...');
      const response = await fetch('/api/generate-buzz-cut', {
        method: 'POST',
        body: submitData
      });

      console.log('📥 Respuesta recibida:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('� Resultado procesado:', result);

      if (result.success) {
        console.log('✅ Generación exitosa, mostrando modal...');
        console.log('📊 Datos del resultado:', JSON.stringify(result, null, 2));
        // Usar setTimeout para asegurar que el estado se actualice correctamente
        setTimeout(() => {
          setResult(result);
          console.log('� Modal debería estar visible ahora');
        }, 100);
      } else {
        console.error('❌ Error en generación:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('💥 Error en petición:', error);
      console.error('💥 Stack trace:', error.stack);
      
      // Evitar any navigation or reload on error
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
    console.log('🔴 BuzzCutForm: Closing result modal');
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

  // Capturar errores no manejados que puedan causar recargas
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
        <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-primary-800 mb-4 text-center">
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
                className="w-4 h-4 text-purple-500 border-purple-300 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-primary-700">
                🎨 Media (Más rápido)
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value="high"
                checked={formData.quality === 'high'}
                onChange={handleInputChange}
                className="w-4 h-4 text-pink-500 border-pink-300 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-primary-700">
                ✨ Alta (Mejor calidad)
              </span>
            </label>
          </div>
        </div>

        {/* Subida de imagen */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-primary-800 text-center">
            📸 Sube tu foto
          </h3>
          
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="person-image"
              placeholder="Arrastra tu foto aquí o haz clic para seleccionar"
              className="aspect-square"
            />
            <p className="text-xs text-accent-500 mt-2 text-center">
              Tu foto se transformará en buzz cut street style ✂️
            </p>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="space-y-4">
          <label htmlFor="extraDetails" className="block text-sm font-semibold text-primary-800 text-center">
            🎯 Detalles adicionales (opcional)
          </label>
          <div className="max-w-lg mx-auto">
            <textarea
              id="extraDetails"
              name="extraDetails"
              value={formData.extraDetails}
              onChange={handleInputChange}
              rows="3"
              placeholder="Ej: Neon azul y rosa, ambiente nocturno, expresión seria, luces más intensas..."
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-accent-500 mt-2 text-center">
              Personaliza los colores neon, ambiente o mood de tu buzz cut street
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
            className="bg-gradient-to-r from-slate-600 to-purple-600 hover:from-slate-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
          >
            {isGenerating ? 'Creando tu buzz cut street...' : '✂️ Crear Buzz Cut Street'}
          </Button>

          {formData.personImage && (
            <Button
              type="button"
              onClick={handleReset}
              className="bg-accent-400 hover:bg-accent-500 text-white px-4 py-2 text-sm ml-4"
            >
              Limpiar formulario
            </Button>
          )}
        </div>

        {/* Información sobre buzz cut street */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 max-w-2xl mx-auto">
          <div className="text-center text-sm text-primary-700 space-y-2">
            <p className="font-semibold text-base">✂️ ¿Qué es Buzz Cut Street Style?</p>
            <p>Una transformación de peinado a buzz cut profesional con ambiente urbano cinematic, luces neon y calidad cinematográfica ✨</p>
            <p className="text-xs text-accent-600">Perfecto para un look moderno, fresco y con estilo street profesional 🏙️</p>
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

export default BuzzCutForm;