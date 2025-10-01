import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';
import GenerationLoader from './GenerationLoader.jsx';

const InstagramChibiForm = () => {
  const [formData, setFormData] = useState({
    personImage: null,
    extraDetails: '',
    quality: 'medium'
  });
  
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = useCallback((uploaderId, file) => {
    setFormData(prev => ({
      ...prev,
      personImage: file
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const isFormValid = !!formData.personImage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFormValid) {
      alert('Por favor sube tu foto');
      return;
    }

    console.log('📱 Iniciando generación de Instagram Chibi...');
    setIsGenerating(true);

    const submitData = new FormData();
    submitData.append('person', formData.personImage);
    submitData.append('extraDetails', formData.extraDetails);
    submitData.append('quality', formData.quality);

    try {
      console.log('🚀 Enviando petición a /api/generate-instagram-chibi...');
      const response = await fetch('/api/generate-instagram-chibi', {
        method: 'POST',
        body: submitData
      });

      console.log('📥 Respuesta recibida:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Resultado procesado:', result);

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
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      console.log('🏁 Finalizando proceso de generación...');
      setIsGenerating(false);
    }
  };

  const handleCloseResult = useCallback(() => {
    console.log('🔴 InstagramChibiForm: Closing result modal');
    setResult(null);
  }, []);

  const handleCancelGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      personImage: null,
      extraDetails: '',
      quality: 'medium'
    });
    setResult(null);
  }, []);

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

  return (
    <div className="p-8">
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Control de calidad */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-primary-800 mb-4 text-center">
            ✨ Calidad de generación
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
                📱 Media (Más rápido)
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
              Tu foto se convertirá en un chibi 3D sentado en un marco de Instagram 📱
            </p>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="space-y-4">
          <label htmlFor="extraDetails" className="block text-sm font-semibold text-primary-800 text-center">
            🎨 Detalles adicionales (opcional)
          </label>
          <div className="max-w-lg mx-auto">
            <textarea
              id="extraDetails"
              name="extraDetails"
              value={formData.extraDetails}
              onChange={handleInputChange}
              rows="3"
              placeholder="Ej: Colores pastel específicos, pose particular, accesorios, fondo degradado rosa/azul..."
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-accent-500 mt-2 text-center">
              Personaliza la pose, colores del fondo o detalles del chibi 3D
            </p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="text-center space-y-4">
          <Button
            type="submit"
            disabled={!isFormValid || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
          >
            {isGenerating ? 'Creando tu chibi 3D...' : '📱 Crear Instagram Chibi'}
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

        {/* Información sobre instagram chibi */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 max-w-2xl mx-auto">
          <div className="text-center text-sm text-primary-700 space-y-2">
            <p className="font-semibold text-base">🎨 ¿Qué es un Instagram Chibi?</p>
            <p>Un personaje chibi 3D adorable sentado en un marco de Instagram con estética de redes sociales. Render 3D profesional con iluminación suave y colores pastel modernos 📱</p>
            <p className="text-xs text-accent-600">Perfecto para avatares y contenido de redes sociales</p>
          </div>
        </div>

      </form>

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

export default InstagramChibiForm;
