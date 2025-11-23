import React, { useEffect, useRef } from 'react';

const StarBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }

        // Shooting stars
        const shootingStars = [];

        const createShootingStar = () => {
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height / 2; // Upper half

            shootingStars.push({
                x: startX,
                y: startY,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 6,
                angle: Math.PI / 4 + Math.random() * Math.PI / 6, // 45-75 degrees
                opacity: 1
            });
        };

        // Create shooting star every few seconds
        const shootingStarInterval = setInterval(() => {
            if (Math.random() < 0.5) { // 50% chance
                createShootingStar();
            }
        }, 3000);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw regular stars
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();

                star.x += star.vx;
                star.y += star.vy;

                if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
                if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
            });

            // Draw shooting stars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const star = shootingStars[i];

                // Update position
                star.x += Math.cos(star.angle) * star.speed;
                star.y += Math.sin(star.angle) * star.speed;
                star.opacity -= 0.01;

                // Draw shooting star with gradient trail
                if (star.opacity > 0) {
                    const gradient = ctx.createLinearGradient(
                        star.x,
                        star.y,
                        star.x - Math.cos(star.angle) * star.length,
                        star.y - Math.sin(star.angle) * star.length
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(
                        star.x - Math.cos(star.angle) * star.length,
                        star.y - Math.sin(star.angle) * star.length
                    );
                    ctx.stroke();
                } else {
                    shootingStars.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            clearInterval(shootingStarInterval);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
        />
    );
};

export default StarBackground;
