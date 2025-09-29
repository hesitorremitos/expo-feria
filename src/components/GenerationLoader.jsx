import React, { useState, useEffect } from 'react';

const GenerationLoader = ({ isVisible, onCancel }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const motivationalMessages = [
    "🎨 Preparando los pinceles digitales...",
    "🤖 La IA está despertando su creatividad...",
    "✨ Mezclando píxeles con magia...",
    "🎭 Creando la escena perfecta...",
    "🔮 Los algoritmos están trabajando duro...",
    "🎪 Montando la fiesta épica...",
    "🌟 Puliendo cada detalle...",
    "🎬 Dirigiendo la toma perfecta...",
    "🎨 Aplicando los toques finales...",
    "🚀 ¡Ya casi tenemos tu obra maestra!"
  ];

  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0);
      setCurrentMessageIndex(0);
      return;
    }

    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % motivationalMessages.length);
    }, 3000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(messageInterval);
    };
  }, [isVisible]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        
        {/* Animación de carga principal */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Círculo externo rotando */}
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            
            {/* Círculo interno pulsando */}
            <div className="absolute inset-3 bg-primary-600 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-white text-xl">🎨</span>
            </div>
          </div>
          
          {/* Título principal */}
          <h3 className="text-2xl font-bold text-primary-800 mb-2">
            Generando tu imagen...
          </h3>
          
          {/* Contador de tiempo */}
          <div className="bg-primary-50 rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-600 font-mono text-lg font-semibold">
              ⏱️ {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* Mensaje motivacional rotativo */}
        <div className="mb-6">
          <p className="text-accent-600 text-lg transition-all duration-500 ease-in-out">
            {motivationalMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="mb-6">
          <div className="bg-primary-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-400 h-full rounded-full"
              style={{ 
                width: '70%', 
                animation: 'progressSlide 2s ease-in-out infinite' 
              }}
            ></div>
          </div>
          <p className="text-sm text-accent-500 mt-2">
            Esto puede tomar entre 30-90 segundos
          </p>
        </div>

        {/* Consejos mientras espera */}
        <div className="bg-accent-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-accent-700 mb-2">💡 Mientras esperas:</h4>
          <ul className="text-sm text-accent-600 space-y-1 text-left">
            <li>• Las mejores imágenes tardan un poco más</li>
            <li>• La IA está analizando cada detalle</li>
            <li>• ¡El resultado valdrá la pena!</li>
          </ul>
        </div>

        {/* Botón de cancelar */}
        <button
          onClick={onCancel}
          className="text-accent-500 hover:text-accent-700 text-sm transition-colors duration-200"
        >
          Cancelar generación
        </button>

      </div>

      <style jsx>{`
        @keyframes progressSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default GenerationLoader;