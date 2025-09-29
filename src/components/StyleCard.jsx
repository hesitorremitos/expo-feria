import React, { useState } from 'react';
import Button from './Button.jsx';

const StyleCard = (props) => {
  const { 
    id,
    title, 
    description, 
    images = [],
    totalGenerated = 0,
    onClick,
    className = ''
  } = props;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-carousel para imágenes generadas
  React.useEffect(() => {
    if (images.length > 1 && totalGenerated > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 4000); // Cambia cada 4 segundos

      return () => clearInterval(interval);
    }
  }, [images.length, totalGenerated]);

  const handleStyleSelect = () => {
    if (onClick) {
      onClick({ id, title, description });
    } else {
      // Navegar directamente a la página específica del estilo en la carpeta generate
      if (id === 'que-paso-ayer-fiesta' || id === 'que-paso-ayer') {
        window.location.href = '/generate/que-paso-ayer';
      } else {
        // Para otros estilos, usar el id como página en generate
        window.location.href = `/generate/${id}`;
      }
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
              className="w-full h-full object-cover transition-all duration-500"
              onError={(e) => {
                // Si falla la imagen generada, usar placeholder
                e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
            
            {/* Overlay para imágenes generadas */}
            {totalGenerated > 0 && (
              <div className="absolute top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Generada por AI
                </div>
              </div>
            )}
            
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
                        index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Navegación con flechas */}
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          // Placeholder cuando no hay imágenes
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <div className="text-center text-primary-600">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Esperando generaciones</p>
              <p className="text-xs opacity-75 mt-1">¡Sé el primero!</p>
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
        <p className="text-accent-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
        
        {/* Estado de generaciones */}
        {totalGenerated > 0 ? (
          <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">
                  {totalGenerated} imágenes generadas
                </span>
              </div>
              <span className="text-green-600 text-xs">
                Últimas actualizadas
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 font-medium text-sm">
                ¡Sé el primero en generar!
              </span>
            </div>
          </div>
        )}
        
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