document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    const state = {
        mode: 'terminal', // 'terminal', 'pong', 'matrix'
        lines: [
            { text: "Initializing system...", type: "system" },
            { text: "> neofetch", type: "command" },
            { type: "ascii" }, // Placeholder for neofetch
            { text: "Welcome to my portfolio.", type: "info" },
            { text: "Type 'help' for available commands.", type: "info" }
        ],
        commandHistory: [],
        historyIndex: -1,
        pong: {
            gameInterval: null,
            ball: { x: 30, y: 10, dx: 1, dy: 1 },
            leftPaddle: 8,
            rightPaddle: 8,
            leftScore: 0,
            rightScore: 0,
            gameOver: false,
            winner: null
        }
    };

    // --- DOM Elements ---
    const outputDiv = document.getElementById('output');
    const inputField = document.getElementById('command-input');
    const terminalBody = document.getElementById('terminal-body');
    const starCanvas = document.getElementById('star-canvas');
    const matrixCanvas = document.getElementById('matrix-canvas');

    // --- Star Background ---
    function initStarBackground() {
        const ctx = starCanvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            starCanvas.width = window.innerWidth;
            starCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * starCanvas.width,
                y: Math.random() * starCanvas.height,
                radius: Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }

        const shootingStars = [];
        const createShootingStar = () => {
            const startX = Math.random() * starCanvas.width;
            const startY = Math.random() * starCanvas.height / 2;
            shootingStars.push({
                x: startX,
                y: startY,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 6,
                angle: Math.PI / 4 + Math.random() * Math.PI / 6,
                opacity: 1
            });
        };

        setInterval(() => {
            if (Math.random() < 0.5) createShootingStar();
        }, 3000);

        const animate = () => {
            ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            ctx.fillStyle = 'white';

            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                star.x += star.vx;
                star.y += star.vy;
                if (star.x < 0 || star.x > starCanvas.width) star.vx = -star.vx;
                if (star.y < 0 || star.y > starCanvas.height) star.vy = -star.vy;
            });

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const star = shootingStars[i];
                star.x += Math.cos(star.angle) * star.speed;
                star.y += Math.sin(star.angle) * star.speed;
                star.opacity -= 0.01;

                if (star.opacity > 0) {
                    const gradient = ctx.createLinearGradient(
                        star.x, star.y,
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
    }
    initStarBackground();

    // --- Matrix Rain ---
    function initMatrixRain() {
        const ctx = matrixCanvas.getContext('2d');
        let animationFrameId;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        const fontSize = 14;
        let columns;
        let drops;

        const resizeCanvas = () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            columns = Math.floor(matrixCanvas.width / fontSize);
            drops = new Array(columns).fill(1);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = "#0F0";
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        return {
            start: () => {
                matrixCanvas.classList.remove('hidden');
                draw();
            },
            stop: () => {
                matrixCanvas.classList.add('hidden');
                cancelAnimationFrame(animationFrameId);
            }
        };
    }
    const matrixEffect = initMatrixRain();

    // --- Terminal Logic ---
    function renderLines() {
        outputDiv.innerHTML = '';

        if (state.mode === 'pong') {
            const pre = document.createElement('pre');
            pre.className = "text-white text-xs leading-tight";
            pre.textContent = renderPongGame();
            outputDiv.appendChild(pre);
            return;
        }

        state.lines.forEach(line => {
            const div = document.createElement('div');
            div.className = "mb-1";

            if (line.type === 'error') div.className += " text-red-400 font-bold";
            else if (line.type === 'system') div.className += " text-gray-500";
            else if (line.type === 'command') div.className += " text-white";
            else if (line.type === 'response') div.className += " text-gray-300 whitespace-pre-wrap";

            if (line.type === 'ascii') {
                div.innerHTML = renderNeofetch();
            } else {
                // Auto-linkify
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                if (line.text && line.text.match(urlRegex)) {
                    div.innerHTML = line.text.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-400 hover:underline">$1</a>');
                } else {
                    div.textContent = line.text;
                }
            }
            outputDiv.appendChild(div);
        });
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function renderNeofetch() {
        const textArt = ` __                 ___
 / /____  __  __ ___/ _/__  __
/ __/ _ \\/ / / / _ \\ / / / / /
\\__/\\___/\\__,_/_//__/_/\\_,_/`;

        const faceArt = `
⣿⠿⠿⠛⠛⠛⠟⠿⠻⣿⣿⡿⠿⠿⠛⠛⠛⠛⠿⢿
⣷⣴⣾⠿⠿⠿⣷⢶⢾⣿⣿⡿⢶⡶⠿⠻⠛⣿⣶⣽
⣿⣿⣏⠶⠀⠀⠭⢺⣺⣿⣿⣧⣺⠧⠄⠀⡰⢛⣽⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⢏⣾⣿
⣿⣿⣿⣿⣿⠻⠿⠿⠿⠿⠿⠿⢛⣛⣭⣾⣿⣸⣿⣿
⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿`;

        const info = [
            "user@toufu",
            "-------------",
            "OS: Arch Linux x86_64",
            "Host: ASUS TUF Gaming A15 FA507RC",
            "Kernel: 6.6.1-kanseidorifto31-69",
            `Time: <span id="dynamic-time">${new Date().toLocaleTimeString()}</span>`,
            "Shell: zsh 5.9",
            "Resolution: 1920x1080",
            "DE: Hyprland",
            "CPU: AMD Ryzen 7 6800H (16) @ 4.7GHz",
            "GPU: NVIDIA GeForce RTX 3050 Mobile",
            `Memory: <span id="dynamic-memory">2.4GB</span> / 16GB`
        ];

        return `
        <div class="flex gap-6 flex-col md:flex-row">
            <div class="flex flex-col">
                <div class="whitespace-pre text-blue-400 font-bold leading-tight">${textArt}</div>
                <div class="whitespace-pre text-white font-bold leading-tight">${faceArt}</div>
            </div>
            <div class="flex flex-col justify-center text-white/90">
                ${info.map(line => `<div class="leading-tight">${line}</div>`).join('')}
            </div>
        </div>`;
    }

    // Dynamic Info Updates
    setInterval(() => {
        const timeEl = document.getElementById('dynamic-time');
        const memEl = document.getElementById('dynamic-memory');
        if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
        if (memEl) memEl.textContent = (2.4 + Math.random() * 3).toFixed(1) + 'GB';
    }, 1000);

    function handleCommand(cmd) {
        const cleanCmd = cmd.toLowerCase().trim();
        if (cleanCmd) {
            state.lines.push({ text: `> ${cmd}`, type: "command" });
            state.commandHistory.push(cmd);
            state.historyIndex = state.commandHistory.length;
        }

        switch (cleanCmd) {
            case 'help':
                state.lines.push(
                    { text: "Available commands:", type: "response" },
                    { text: "", type: "response" },
                    { text: "  about      - Learn about me", type: "response" },
                    { text: "  projects   - View my projects", type: "response" },
                    { text: "  contact    - Get my contact info", type: "response" },
                    { text: "  social     - Find me on social platforms", type: "response" },
                    { text: "  whoami     - Who knows? 🤔", type: "response" },
                    { text: "  pong       - Play a game of Pong 🏓", type: "response" },
                    { text: "  matrix     - Enter the Matrix 👁️", type: "response" },
                    { text: "  clear      - Clear the terminal", type: "response" }
                );
                break;
            case 'about':
                state.lines.push(
                    { text: "I’m a passionate graphic designer with a strong interest in web development and creating engaging user experiences.", type: "response" },
                    { text: "", type: "response" }
                );
                break;
            case 'projects':
                state.lines.push(
                    { text: "1. Portfolio (This site)", type: "response" },
                    { text: "2. More coming soon...", type: "response" }
                );
                break;
            case 'contact':
                state.lines.push({ text: "Email: ata.fb37@gmail.com", type: "response" });
                break;
            case 'social':
                state.lines.push(
                    { text: "Find me on:", type: "response" },
                    { text: "", type: "response" },
                    { text: "  GitHub      : https://github.com/toufudealer", type: "response" },
                    { text: "  Steam       : https://steamcommunity.com/id/toufudealer", type: "response" },
                    { text: "  MyAnimeList : https://myanimelist.net/profile/toufudealer", type: "response" },
                    { text: "  Spotify     : https://open.spotify.com/user/ralcqz0nk2sazx60hctyacype?nd=1&dlsi=d2114e6207eb4647", type: "response" }
                );
                break;
            case 'whoami':
                state.lines.push({ text: "toufudealer", type: "response" });
                break;
            case 'clear':
                state.lines = [];
                break;
            case 'matrix':
                state.lines.push({ text: "Entering the Matrix...", type: "response" });
                state.mode = 'matrix';
                matrixEffect.start();
                break;
            case 'pong':
                state.mode = 'pong';
                startPongGame();
                break;
            default:
                if (cleanCmd) state.lines.push({ text: `Command not found: ${cmd}`, type: "error" });
        }
        renderLines();
    }

    // --- Input Handling ---
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleCommand(inputField.value);
            inputField.value = '';
        } else if (e.key === 'ArrowUp') {
            if (state.historyIndex > 0) {
                state.historyIndex--;
                inputField.value = state.commandHistory[state.historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (state.historyIndex < state.commandHistory.length - 1) {
                state.historyIndex++;
                inputField.value = state.commandHistory[state.historyIndex];
            } else {
                state.historyIndex = state.commandHistory.length;
                inputField.value = '';
            }
            e.preventDefault();
        }
    });

    // Global Key Listener
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.mode === 'matrix') {
                state.mode = 'terminal';
                matrixEffect.stop();
                renderLines();
            } else if (state.mode === 'pong') {
                state.mode = 'terminal';
                stopPongGame();
                renderLines();
            }
        }

        // Pong Controls
        if (state.mode === 'pong') {
            const PADDLE_HEIGHT = 4;
            const FIELD_HEIGHT = 20;
            if (e.key === 'w' || e.key === 'W') {
                state.pong.leftPaddle = Math.max(0, state.pong.leftPaddle - 1);
            } else if (e.key === 's' || e.key === 'S') {
                state.pong.leftPaddle = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, state.pong.leftPaddle + 1);
            }
        } else {
            // Auto-focus input
            if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
                inputField.focus();
            }
        }
    });

    // --- Pong Game Logic ---
    function startPongGame() {
        state.pong = {
            gameInterval: null,
            ball: { x: 30, y: 10, dx: 1, dy: 1 },
            leftPaddle: 8,
            rightPaddle: 8,
            leftScore: 0,
            rightScore: 0,
            gameOver: false,
            winner: null
        };

        state.pong.gameInterval = setInterval(() => {
            if (state.pong.gameOver) return;

            const { ball, leftPaddle, rightPaddle } = state.pong;
            const FIELD_WIDTH = 60;
            const FIELD_HEIGHT = 20;
            const PADDLE_HEIGHT = 4;

            // Move Ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall Collisions (Top/Bottom)
            if (ball.y <= 0 || ball.y >= FIELD_HEIGHT - 1) ball.dy *= -1;

            // Paddle Collisions
            // Left Paddle
            if (Math.floor(ball.x) === 1 && ball.y >= leftPaddle && ball.y < leftPaddle + PADDLE_HEIGHT) {
                ball.dx *= -1;
            }
            // Right Paddle
            if (Math.floor(ball.x) === FIELD_WIDTH - 2 && ball.y >= rightPaddle && ball.y < rightPaddle + PADDLE_HEIGHT) {
                ball.dx *= -1;
            }

            // Scoring
            if (ball.x < 0) {
                state.pong.rightScore++;
                resetBall();
            } else if (ball.x > FIELD_WIDTH) {
                state.pong.leftScore++;
                resetBall();
            }

            // AI Movement
            if (ball.y > rightPaddle + PADDLE_HEIGHT / 2) {
                state.pong.rightPaddle = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, rightPaddle + 0.8); // Speed 0.8
            } else {
                state.pong.rightPaddle = Math.max(0, rightPaddle - 0.8);
            }

            // Check Win
            if (state.pong.leftScore >= 5) {
                state.pong.gameOver = true;
                state.pong.winner = 'You';
            } else if (state.pong.rightScore >= 5) {
                state.pong.gameOver = true;
                state.pong.winner = 'AI';
            }

            renderLines(); // Re-render game frame
        }, 100);
    }

    function stopPongGame() {
        clearInterval(state.pong.gameInterval);
    }

    function resetBall() {
        state.pong.ball = { x: 30, y: 10, dx: (Math.random() > 0.5 ? 1 : -1), dy: (Math.random() > 0.5 ? 1 : -1) };
    }

    function renderPongGame() {
        const FIELD_WIDTH = 60;
        const FIELD_HEIGHT = 20;
        const PADDLE_HEIGHT = 4;
        let display = [];

        display.push('┌' + '─'.repeat(FIELD_WIDTH) + '┐');

        for (let y = 0; y < FIELD_HEIGHT; y++) {
            let line = '│';
            for (let x = 0; x < FIELD_WIDTH; x++) {
                if (x === 1 && y >= state.pong.leftPaddle && y < state.pong.leftPaddle + PADDLE_HEIGHT) line += '█';
                else if (x === FIELD_WIDTH - 2 && y >= state.pong.rightPaddle && y < state.pong.rightPaddle + PADDLE_HEIGHT) line += '█';
                else if (Math.floor(state.pong.ball.x) === x && Math.floor(state.pong.ball.y) === y) line += '●';
                else if (x === Math.floor(FIELD_WIDTH / 2)) line += '┊';
                else line += ' ';
            }
            line += '│';
            display.push(line);
        }

        display.push('└' + '─'.repeat(FIELD_WIDTH) + '┘');
        display.push('');
        display.push(`  You: ${state.pong.leftScore}  ${' '.repeat(FIELD_WIDTH - 20)}  AI: ${state.pong.rightScore}`);
        display.push('');
        if (state.pong.gameOver) {
            display.push(`  🎉 ${state.pong.winner} WIN${state.pong.winner === 'You' ? '' : 'S'}! 🎉`);
            display.push(`  Press ESC to exit`);
        } else {
            display.push(`  Controls: W/S to move | ESC to quit`);
        }

        return display.join('\n');
    }

    // Initial Render
    renderLines();
});
