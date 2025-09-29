import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';

const GenerateForm = () => {
  const [formData, setFormData] = useState({
    personImage: null,
    celebrityImage: null,
    celebrityName: '',
    extraDetails: ''
  });
  
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar subida de imágenes
  const handleImageUpload = useCallback((uploaderId, file) => {
    setFormData(prev => ({
      ...prev,
      [uploaderId === 'person-image' ? 'personImage' : 'celebrityImage']: file
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
  const isFormValid = formData.personImage && formData.celebrityImage;

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Por favor sube ambas imágenes');
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('person_image', formData.personImage);
    submitData.append('celebrity_image', formData.celebrityImage);
    submitData.append('celebrity_name', formData.celebrityName);
    submitData.append('extra_details', formData.extraDetails);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        setResult(result);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal de resultado
  const handleCloseResult = useCallback(() => {
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

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Sección de imágenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Subir imagen de la persona */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Tu foto
            </label>
            <ImageUploader 
              id="person-image"
              placeholder="Arrastra tu foto aquí o haz clic para seleccionar"
            />
            <p className="text-xs text-accent-500">
              Formatos: JPG, PNG, WEBP • Máximo 10MB
            </p>
          </div>

          {/* Subir imagen de la celebridad */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Foto de la celebridad
            </label>
            <ImageUploader 
              id="celebrity-image"
              placeholder="Arrastra la foto de la celebridad aquí"
            />
            <p className="text-xs text-accent-500">
              Formatos: JPG, PNG, WEBP • Máximo 10MB
            </p>
          </div>
        </div>

        {/* Campos de texto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Nombre de la celebridad */}
          <div className="space-y-4">
            <label htmlFor="celebrityName" className="block text-sm font-semibold text-primary-800 mb-2">
              Nombre de la celebridad
            </label>
            <input
              type="text"
              id="celebrityName"
              name="celebrityName"
              value={formData.celebrityName}
              onChange={handleInputChange}
              placeholder="Ej: Leonardo DiCaprio, Brad Pitt..."
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
            <p className="text-xs text-accent-500">
              Especifica quién aparece en la foto para mejorar el resultado
            </p>
          </div>

          {/* Detalles extra */}
          <div className="space-y-4">
            <label htmlFor="extraDetails" className="block text-sm font-semibold text-primary-800 mb-2">
              Detalles adicionales
            </label>
            <textarea
              id="extraDetails"
              name="extraDetails"
              value={formData.extraDetails}
              onChange={handleInputChange}
              rows="3"
              placeholder="Ej: En una fiesta en Las Vegas, con ropa elegante..."
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-accent-500">
              Describe la escena, ambiente o detalles específicos que quieres
            </p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isFormValid || isSubmitting}
            className="px-12 py-4 text-lg font-semibold"
          >
            {isSubmitting ? '⏳ Procesando...' : '🎬 Generar Imagen'}
          </Button>
        </div>

      </form>

      {/* Modal de resultado */}
      <ResultModal 
        result={result} 
        onClose={handleCloseResult} 
      />
    </>
  );
};

export default GenerateForm;