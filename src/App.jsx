import React, { useState, useEffect } from 'react';
import StarBackground from './components/StarBackground';
import Terminal from './components/Terminal';
import AnimeGirl from './components/AnimeGirl';
import MatrixRain from './components/MatrixRain';

function App() {
  const [matrixMode, setMatrixMode] = useState(false);

  // ESC key listener to exit Matrix mode
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && matrixMode) {
        setMatrixMode(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [matrixMode]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-mono selection:bg-green-500 selection:text-black">
      <StarBackground />

      <main className="relative z-10 container mx-auto px-4 h-screen flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        {/* Left Side - Anime Character */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end order-2 md:order-1">
          <AnimeGirl />
        </div>

        {/* Right Side - Terminal */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start order-1 md:order-2">
          <Terminal setMatrixMode={setMatrixMode} />
        </div>
      </main>

      {/* Optional Footer or Overlay */}
      <div className="absolute bottom-4 left-0 w-full text-center text-gray-500 text-xs z-20">
        &copy; {new Date().getFullYear()} Portfolio. Built with React & Tailwind.
      </div>

      {/* Matrix Mode Easter Egg */}
      {matrixMode && <MatrixRain />}
    </div>
  );
}

export default App;
