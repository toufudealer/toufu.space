import React from 'react';
import { motion } from 'framer-motion';

const AnimeGirl = () => {
    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-full flex items-center justify-center"
        >
            {/* Placeholder for the anime girl image */}
            <div className="relative h-[70vh] md:h-screen w-auto aspect-[9/16] md:aspect-auto flex items-end">
                {/* Glow effect */}


                <img
                    src="/anime-girl.png"
                    alt="Anime Character"
                    className="relative z-10 w-full h-full object-contain object-bottom border-none shadow-none bg-transparent transition-all duration-300"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }}
                />

                {/* Glitch Overlay Layers (Visible on Hover/Interaction or Randomly) */}
                <div className="absolute inset-0 bg-transparent z-20 pointer-events-none mix-blend-screen opacity-0 hover:opacity-100 transition-opacity duration-100">
                    {/* We can implement a more complex glitch here if needed */}
                </div>

                {/* Floating elements or particles could go here */}
            </div>
        </motion.div>
    );
};

export default AnimeGirl;
