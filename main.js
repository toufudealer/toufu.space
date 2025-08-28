window.addEventListener('load', () => {
    const profilePic = document.querySelector('.profile-pic');
    const vhsOverlay = document.getElementById('vhs-overlay'); // Select the VHS overlay

    function applyGlitch() {
        anime.timeline({
            targets: profilePic,
            duration: 70, // Shorter duration for sharper glitch
            easing: 'linear',
            loop: 2, // Play twice for a more intense flicker
            direction: 'alternate',
            complete: () => {
                // Ensure properties are reset
                profilePic.style.transform = '';
                profilePic.style.filter = '';
                profilePic.style.opacity = '';
            }
        })
        .add({
            translateX: () => anime.random(-8, 8), // Reduced range
            translateY: () => anime.random(-8, 8), // Reduced range
            scaleX: [
                { value: [1, 0.95, 1.05, 1], duration: 70 } // Slightly less aggressive scale
            ],
            scaleY: [
                { value: [1, 1.05, 0.95, 1], duration: 70 } // Slightly less aggressive scale
            ],
            skewX: () => anime.random(-5, 5), // Reduced range
            skewY: () => anime.random(-5, 5), // Reduced range
            opacity: [
                { value: [1, 0.7, 1], duration: 70 } // Slightly less aggressive opacity change
            ],
            filter: [
                { value: 'hue-rotate(0deg) contrast(100%)', duration: 0 },
                { value: 'hue-rotate(90deg) contrast(150%)', duration: 35 },
                { value: 'hue-rotate(0deg) contrast(100%)', duration: 35 }
            ]
        });
    }

    function startGlitchLoop() {
        const randomDelay = anime.random(1000, 4000); // Glitch every 1 to 4 seconds
        setTimeout(() => {
            applyGlitch();
            startGlitchLoop(); // Loop the glitch
        }, randomDelay);
    }

    startGlitchLoop(); // Start the glitch loop

    // Global Glitch Effect (Signal Distortion)
    const bodyElement = document.body; // Target the body for global effect

    function applyGlobalGlitch() {
        anime.timeline({
            targets: bodyElement,
            duration: 150, // Short, sharp glitch
            easing: 'steps(1)', // Step animation for glitch effect
            direction: 'alternate',
            complete: () => {
                // Ensure properties are reset after glitch
                bodyElement.style.transform = '';
                bodyElement.style.filter = '';
            }
        })
        .add({
            translateX: () => anime.random(-20, 20),
            translateY: () => anime.random(-20, 20),
            scaleX: [
                { value: [1, 0.9, 1.1, 1], duration: 75 }
            ],
            scaleY: [
                { value: [1, 1.1, 0.9, 1], duration: 75 }
            ],
            skewX: () => anime.random(-10, 10),
            skewY: () => anime.random(-10, 10),
            filter: [
                { value: 'hue-rotate(0deg) contrast(100%) saturate(100%) brightness(100%)', duration: 0 },
                { value: 'hue-rotate(90deg) contrast(150%) saturate(200%) brightness(120%)', duration: 75 },
                { value: 'hue-rotate(0deg) contrast(100%) saturate(100%) brightness(100%)', duration: 75 }
            ]
        });
    }

    function startGlobalGlitchLoop() {
        const randomDelay = anime.random(5000, 15000); // Glitch every 5 to 15 seconds
        setTimeout(() => {
            applyGlobalGlitch();
            startGlobalGlitchLoop(); // Loop the global glitch
        }, randomDelay);
    }

    startGlobalGlitchLoop(); // Start the global glitch loop

    // VHS Overlay Animation
    anime({
        targets: vhsOverlay,
        opacity: [
            { value: 0.2, duration: 200, easing: 'linear' },
            { value: 0.3, duration: 200, easing: 'linear' }
        ],
        translateY: [
            { value: () => anime.random(-5, 5), duration: 100, easing: 'linear' },
            { value: 0, duration: 100, easing: 'linear' }
        ],
        translateX: [
            { value: () => anime.random(-3, 3), duration: 100, easing: 'linear' },
            { value: 0, duration: 100, easing: 'linear' }
        ],
        filter: [
            { value: 'saturate(1.5) contrast(1.3)', duration: 0 },
            { value: 'saturate(2) contrast(1.5)', duration: 100, easing: 'linear' },
            { value: 'saturate(1.5) contrast(1.3)', duration: 100, easing: 'linear' }
        ],
        loop: true,
        direction: 'alternate',
                easing: 'linear'
    });

    // Parallax effect for the background - WIDEN UPWARDS EFFECT
    const parallaxBg = document.getElementById('parallax-bg');
    if (parallaxBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            // Adjust the parallax factor as needed. Smaller value means less movement.
            const parallaxFactor = 0.3;
            // Calculate background-position-y. Negative scrollY for upward movement.
            const backgroundPositionY = -scrollY * parallaxFactor;
            parallaxBg.style.backgroundPositionY = `${backgroundPositionY}px`;
        });
    }


    // Fish-eye effect based on scroll position
    const contentWrapper = document.getElementById('content-wrapper');
    const maxPerspective = 400; // Maximum perspective depth (retained for "heavier" look)
    const maxRotateX = 5;     // Maximum X-axis rotation (slower effect)
    const minScale = 0.95;    // Minimum scale (reduced outward zoom)

    function applyFishEyeEffect() {
        const currentScrollY = window.scrollY;
        // Calculate scrollEnd dynamically to account to account for varying content heights
        const scrollEnd = document.body.scrollHeight - window.innerHeight;

        // Calculate a normalized scroll position (0 to 1)
        // Ensure scrollEnd is not zero to prevent division by zero
        const scrollProgress = scrollEnd > 0 ? currentScrollY / scrollEnd : 0;

        // Calculate rotation based on scroll progress (from -maxRotateX to maxRotateX)
        const rotateX = (scrollProgress - 0.5) * 2 * maxRotateX;

        // Calculate scale: starts at 1, goes down to minScale at 0.5 scrollProgress, then back to 1
        const scale = 1 - Math.abs(scrollProgress - 0.5) * 2 * (1 - minScale);

        // Apply perspective and transforms
        contentWrapper.style.transform = `perspective(${maxPerspective}px) rotateX(${rotateX}deg) scale(${scale})`;
        contentWrapper.style.transformOrigin = 'center center'; // Ensure consistent origin
    }

    // Apply effect on load
    applyFishEyeEffect();

    // Apply effect on scroll
    window.addEventListener('scroll', applyFishEyeEffect);

    // Anime.js animation for skill badges on scroll
    const skillsContainer = document.querySelector('.skills-container');
    if (skillsContainer) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: '.skill-badge',
                        opacity: [0, 1],
                        translateY: [20, 0],
                        delay: anime.stagger(100)
                    });
                    observer.disconnect(); // Disconnect after animation
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

        observer.observe(skillsContainer);
    }

    // Anime.js animation for social media icons on scroll
    const socialMediaSection = document.querySelector('.social-media-section');
    if (socialMediaSection) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: '.social-icon',
                        opacity: [0, 1],
                        scale: [0.5, 1],
                        delay: anime.stagger(100)
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(socialMediaSection);
    }

    // Social media icon hover animations
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        const enterAnimation = () => {
            anime({
                targets: icon,
                scale: 1.2, // Scale up to 120%
                rotate: '5deg', // Rotate slightly
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        const leaveAnimation = () => {
            anime({
                targets: icon,
                scale: 1, // Scale back to original size
                rotate: '0deg', // Rotate back to original
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        icon.addEventListener('mouseenter', enterAnimation);
        icon.addEventListener('mouseleave', leaveAnimation);
        icon.addEventListener('touchstart', enterAnimation);
        icon.addEventListener('touchend', leaveAnimation);
    });

    // Profile picture hover animation
    const profilePicWrapper = document.querySelector('.profile-pic-wrapper'); // Target the wrapper for the border animation
    if (profilePicWrapper) {
        const enterAnimation = () => {
            anime({
                targets: profilePic,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutQuad'
            });
            anime({
                targets: profilePicWrapper,
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)', // Neon Cyan Glow
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        const leaveAnimation = () => {
            anime({
                targets: profilePic,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
            anime({
                targets: profilePicWrapper,
                boxShadow: '0 0 0 rgba(0, 255, 255, 0)', // Remove glow
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        profilePicWrapper.addEventListener('mouseenter', enterAnimation);
        profilePicWrapper.addEventListener('mouseleave', leaveAnimation);
        profilePicWrapper.addEventListener('touchstart', enterAnimation);
        profilePicWrapper.addEventListener('touchend', leaveAnimation);
    }

    // Username hover animation
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        const enterAnimation = () => {
            anime({
                targets: usernameElement,
                color: '#FF00FF', // Change to Neon Pink
                textShadow: '0 0 8px #FF00FF', // Add glow
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        const leaveAnimation = () => {
            anime({
                targets: usernameElement,
                color: '#FFFFFF', // Revert to white
                textShadow: 'none', // Remove glow
                duration: 300,
                easing: 'easeOutQuad'
            });
        };

        usernameElement.addEventListener('mouseenter', enterAnimation);
        usernameElement.addEventListener('mouseleave', leaveAnimation);
        usernameElement.addEventListener('touchstart', enterAnimation);
        usernameElement.addEventListener('touchend', leaveAnimation);
    }

    // Glitch animation for headers
    const glitchHeaders = document.querySelectorAll('.glitch-header');
    glitchHeaders.forEach(header => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: header,
                        loop: true, // Loop the glitch effect
                        direction: 'alternate',
                        duration: 80, // Slightly faster flicker
                        easing: 'steps(1)', // Step animation for glitch effect
                        color: [
                            { value: '#00FFFF', duration: 40 }, // Neon Cyan
                            { value: '#FF00FF', duration: 40 }, // Neon Pink
                            { value: '#00FF00', duration: 40 }  // Neon Green
                        ],
                        textShadow: [
                            { value: '0 0 5px #00FFFF', duration: 40 },
                            { value: '0 0 10px #FF00FF', duration: 40 },
                            { value: '0 0 5px #00FF00', duration: 40 }
                        ],
                        translateX: () => anime.random(-10, 10), // Increased range for sliding
                        translateY: () => anime.random(-10, 10), // Increased range for sliding
                        skewX: () => anime.random(-5, 5), // More aggressive skew
                        skewY: () => anime.random(-5, 5), // More aggressive skew
                        scaleX: [
                            { value: [1, 0.9, 1.1, 1], duration: 80 } // Signal distortion: horizontal stretch/compress
                        ],
                        scaleY: [
                            { value: [1, 1.1, 0.9, 1], duration: 80 } // Signal distortion: vertical stretch/compress
                        ],
                        filter: [
                            { value: 'brightness(100%) contrast(100%)', duration: 0 },
                            { value: 'brightness(150%) contrast(120%)', duration: 40 }, // Brighter, higher contrast
                            { value: 'brightness(80%) contrast(130%)', duration: 40 },  // Darker, even higher contrast
                            { value: 'brightness(100%) contrast(100%)', duration: 0 }
                        ],
                        // Simulate text cut-off with clip-path
                        clipPath: [
                            { value: 'inset(0 0 0 0)', duration: 0 },
                            { value: () => `inset(${anime.random(0, 50)}% 0 ${anime.random(0, 50)}% 0)`, duration: 40 },
                            { value: 'inset(0 0 0 0)', duration: 40 }
                        ]
                    });
                    observer.disconnect(); // Disconnect after starting the loop
                }
            });
        }, { threshold: 0.8 }); // Trigger when 80% of the element is visible

        observer.observe(header);
    });
});

// TV Static effect on social links
document.addEventListener('DOMContentLoaded', () => {
    const socialLinks = document.querySelectorAll('.social-icon');
    const staticOverlay = document.getElementById('static-overlay');

    if (socialLinks.length > 0 && staticOverlay) {
        socialLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const url = this.href;

                staticOverlay.classList.add('active');

                setTimeout(() => {
                    window.open(url, '_blank');
                    setTimeout(() => {
                        staticOverlay.classList.remove('active');
                    }, 200);
                }, 800); // Match the animation duration
            });
        });
    }
});