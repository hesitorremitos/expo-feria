import React, { useState, useRef } from 'react';

const ImageUploader = ({ onImageUpload = null, placeholder = "Arrastra una imagen aquí o haz clic para seleccionar", className = "", id }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 10MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Llamar callback
    if (onImageUpload) {
      onImageUpload(file);
    }

    // Emitir evento personalizado para que la página lo escuche
    if (id) {
      const event = new CustomEvent('imageUploaded', {
        detail: { uploaderId: id, file: file }
      });
      window.dispatchEvent(event);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeImage = () => {
    setImagePreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onImageUpload) {
      onImageUpload(null);
    }

    // Emitir evento de imagen removida
    if (id) {
      const event = new CustomEvent('imageUploaded', {
        detail: { uploaderId: id, file: null }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {imagePreview ? (
        // Vista previa de la imagen
        <div className="relative">
          <div className="aspect-square rounded-xl overflow-hidden bg-accent-100 border-2 border-accent-200">
            <img 
              src={imagePreview} 
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Eliminar imagen"
          >
            ×
          </button>
        </div>
      ) : (
        // Área de subida
        <div
          className={`
            aspect-square rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center p-8 text-center
            ${dragActive 
              ? 'border-primary-500 bg-primary-50 scale-105' 
              : 'border-accent-300 bg-accent-50 hover:border-primary-400 hover:bg-primary-25'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          {/* Ícono de subida */}
          <svg 
            className={`w-12 h-12 mb-4 transition-colors ${dragActive ? 'text-primary-500' : 'text-accent-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>

          <p className={`text-base font-medium mb-2 ${dragActive ? 'text-primary-700' : 'text-accent-700'}`}>
            {dragActive ? '¡Suelta la imagen aquí!' : placeholder}
          </p>
          
          <p className="text-sm text-accent-500">
            PNG, JPG o WEBP (máx. 10MB)
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple={false}
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;