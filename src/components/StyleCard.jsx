import React, { useState } from 'react';
import Button from './Button.jsx';

const StyleCard = (props) => {
  const { 
    id,
    title, 
    description, 
    images = [],
    onClick,
    className = ''
  } = props;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleStyleSelect = () => {
    if (onClick) {
      onClick({ id, title, description });
    } else {
      // Navegar a la página de generación con el estilo seleccionado
      window.location.href = `/generate?style=${id}&title=${encodeURIComponent(title)}`;
    }
  };

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-elegant hover:shadow-elegant-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}>
      {/* Imagen cuadrada grande */}
      <div className="aspect-square relative overflow-hidden">
        {/* Carousel de imágenes */}
        {images.length > 0 ? (
          <div className="relative w-full h-full">
            <img 
              src={images[currentImageIndex]} 
              alt={`${title} ejemplo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Controles del carousel */}
            {images.length > 1 && (
              <>
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Placeholder cuando no hay imágenes
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-200 to-accent-300">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-xl font-bold text-primary-800 mb-3 group-hover:text-primary-700 transition-colors">
          {title}
        </h3>
        
        {/* Descripción */}
        <p className="text-accent-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {description}
        </p>
        
        {/* Información adicional */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-accent-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generación rápida</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Alta calidad</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Formato cuadrado</span>
          </div>
        </div>

        {/* Botón de acción */}
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          onClick={handleStyleSelect}
        >
          Seleccionar Estilo
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default StyleCard;