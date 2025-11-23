import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas to full screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Characters to use in the rain
        const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = canvas.width / fontSize;

        // Array of drops - one per column
        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -100; // Start at random heights
        }

        // Drawing the characters
        function draw() {
            // Black background with slight transparency for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0'; // Green text
            ctx.font = fontSize + 'px monospace';

            // Loop over drops
            for (let i = 0; i < drops.length; i++) {
                // Random character to print
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));

                // x = i * fontSize, y = value of drops[i] * fontSize
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Sending the drop back to the top randomly after it has crossed the screen
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Increment Y coordinate
                drops[i]++;
            }
        }

        // Animation loop
        const interval = setInterval(draw, 33);

        // Handle window resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-green-500 text-xl animate-pulse">
                Press <span className="font-bold">ESC</span> to exit
            </div>
        </div>
    );
};

export default MatrixRain;
