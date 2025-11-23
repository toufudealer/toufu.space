import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Minimize, Maximize, X } from 'lucide-react';
const MemoryUsage = () => {
    const [usedMemory, setUsedMemory] = useState(2.4 + Math.random() * 3);

    useEffect(() => {
        const interval = setInterval(() => {
            // Rastgele değişim: ±0.1-0.3 GiB
            setUsedMemory(prev => {
                const change = (Math.random() - 0.5) * 0.4;
                const newValue = prev + change;
                // 2.0 - 8.0 GiB arasında tut
                return Math.max(2.0, Math.min(8.0, newValue));
            });
        }, 3000); // Her 3 saniyede bir güncelle
        return () => clearInterval(interval);
    }, []);

    return <span>Memory: {usedMemory.toFixed(1)}GiB / 16GiB</span>;
};

const CurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return <span>Current Time: {formatTime(currentTime)}</span>;
};

const Terminal = ({ setMatrixMode }) => {
    const [lines, setLines] = useState([
        {
            type: "ascii",
            textArt: ` __                 ___
 / /____  __  __ ___/ _/__  __
/ __/ _ \\/ / / / _ \\ / / / / /
\\__/\\___/\\__,_/_//__/_/\\_,_/`,
            faceArt: `
⣿⠿⠿⠛⠛⠛⠟⠿⠻⣿⣿⡿⠿⠿⠛⠛⠛⠛⠿⢿
⣷⣴⣾⠿⠿⠿⣷⢶⢾⣿⣿⡿⢶⡶⠿⠻⠛⣿⣶⣽
⣿⣿⣏⠶⠀⠀⠭⢺⣺⣿⣿⣧⣺⠧⠄⠀⡰⢛⣽⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⢏⣾⣿
⣿⣿⣿⣿⣿⠻⠿⠿⠿⠿⠿⠿⢛⣛⣭⣾⣿⣸⣿⣿
⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿`,
            info: [
                "user@toufu",
                "-------------",
                "OS: toufuOS x86_64",
                "Host: ASUS TUF Gaming A15 FA507RC",
                "Kernel: 6.6.1-kanseidorifto31-69",
                <CurrentTime key="currenttime" />,
                "Shell: zsh 5.9",
                "Resolution: 1920x1080",
                "DE: Tofuland",
                "CPU: AMD Ryzen 7 6800H (16) @ 4.7GHz",
                "GPU: NVIDIA GeForce RTX 3050 Mobile",
                <MemoryUsage key="memory" />
            ]
        },
        { text: "Welcome to my portfolio.", type: "info" },
        { text: "Type 'help' for available commands.", type: "info" },
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const terminalBodyRef = useRef(null);

    // Pong game state
    const [gameMode, setGameMode] = useState('none'); // 'none' | 'pong'
    const [pongState, setPongState] = useState({
        ball: { x: 30, y: 10, dx: 1, dy: 1 },
        leftPaddle: 8,
        rightPaddle: 8,
        leftScore: 0,
        rightScore: 0,
        gameOver: false,
        winner: null
    });

    // Global keyboard listener
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Pong game controls
            if (gameMode === 'pong') {
                if (e.key === 'Escape') {
                    setGameMode('none');
                    setLines([{ text: "Game exited. Type 'help' for commands.", type: "info" }]);
                    return;
                }
                // Handle game controls (will be processed in game loop)
                return;
            }

            // Normal terminal input focus
            if (document.activeElement !== inputRef.current &&
                !e.ctrlKey && !e.metaKey && !e.altKey &&
                e.key.length === 1) {
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [gameMode]);

    // Auto-scroll to bottom when new lines are added
    useEffect(() => {
        if (terminalBodyRef.current && gameMode === 'none') {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [lines, gameMode]);

    // Pong game loop
    useEffect(() => {
        if (gameMode !== 'pong' || pongState.gameOver) return;

        const FIELD_WIDTH = 60;
        const FIELD_HEIGHT = 20;
        const PADDLE_HEIGHT = 4;

        const gameInterval = setInterval(() => {
            setPongState(prev => {
                let newState = { ...prev };

                // Move ball
                newState.ball.x += newState.ball.dx;
                newState.ball.y += newState.ball.dy;

                // Ball collision with top/bottom
                if (newState.ball.y <= 0 || newState.ball.y >= FIELD_HEIGHT - 1) {
                    newState.ball.dy *= -1;
                }

                // Ball collision with left paddle
                if (newState.ball.x <= 2 &&
                    newState.ball.y >= newState.leftPaddle &&
                    newState.ball.y <= newState.leftPaddle + PADDLE_HEIGHT) {
                    newState.ball.dx *= -1;
                    newState.ball.x = 3;
                }

                // Ball collision with right paddle
                if (newState.ball.x >= FIELD_WIDTH - 3 &&
                    newState.ball.y >= newState.rightPaddle &&
                    newState.ball.y <= newState.rightPaddle + PADDLE_HEIGHT) {
                    newState.ball.dx *= -1;
                    newState.ball.x = FIELD_WIDTH - 4;
                }

                // Scoring
                if (newState.ball.x <= 0) {
                    newState.rightScore++;
                    newState.ball = { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2, dx: 1, dy: 1 };
                    if (newState.rightScore >= 5) {
                        newState.gameOver = true;
                        newState.winner = 'AI';
                    }
                }
                if (newState.ball.x >= FIELD_WIDTH) {
                    newState.leftScore++;
                    newState.ball = { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2, dx: -1, dy: -1 };
                    if (newState.leftScore >= 5) {
                        newState.gameOver = true;
                        newState.winner = 'You';
                    }
                }

                // Simple AI for right paddle
                if (newState.ball.y < newState.rightPaddle + PADDLE_HEIGHT / 2) {
                    newState.rightPaddle = Math.max(0, newState.rightPaddle - 1);
                } else if (newState.ball.y > newState.rightPaddle + PADDLE_HEIGHT / 2) {
                    newState.rightPaddle = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, newState.rightPaddle + 1);
                }

                return newState;
            });
        }, 100);

        // Keyboard controls for left paddle
        const handleKeyDown = (e) => {
            const PADDLE_HEIGHT = 4;
            const FIELD_HEIGHT = 20;

            setPongState(prev => {
                let newPaddle = prev.leftPaddle;
                if (e.key === 'w' || e.key === 'W') {
                    newPaddle = Math.max(0, prev.leftPaddle - 1);
                } else if (e.key === 's' || e.key === 'S') {
                    newPaddle = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, prev.leftPaddle + 1);
                }
                return { ...prev, leftPaddle: newPaddle };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(gameInterval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameMode, pongState.gameOver]);

    const handleCommand = (cmd) => {
        const newLines = [...lines, { text: `> ${cmd}`, type: "command" }];

        switch (cmd.toLowerCase().trim()) {
            case 'help':
                newLines.push({ text: "Available commands:", type: "response" });
                newLines.push({ text: "", type: "response" });
                newLines.push({ text: "  about      - Learn about me", type: "response" });
                newLines.push({ text: "  projects   - View my projects", type: "response" });
                newLines.push({ text: "  contact    - Get my contact info", type: "response" });
                newLines.push({ text: "  social     - Find me on social platforms", type: "response" });
                newLines.push({ text: "  whoami     - Who knows? 🤔", type: "response" });
                newLines.push({ text: "  pong       - Play a game of Pong 🏓", type: "response" });
                newLines.push({ text: "  matrix     - Enter the Matrix 👁️", type: "response" });
                newLines.push({ text: "  clear      - Clear the terminal", type: "response" });
                break;
            case 'about':
                newLines.push({ text: "I’m a passionate graphic designer with a strong interest in web development and creating engaging user experiences.", type: "response" });
                newLines.push({ text: "", type: "response" });
                newLines.push({ text: "", type: "response" });
                break;
            case 'projects':
                newLines.push({ text: "1. Portfolio (This site)", type: "response" });
                newLines.push({ text: "2. More coming soon...", type: "response" });
                break;
            case 'contact':
                newLines.push({ text: "Email: your@email.com", type: "response" });
                break;
            case 'social':
                newLines.push({ text: "Find me on:", type: "response" });
                newLines.push({ text: "", type: "response" });
                newLines.push({ text: "  GitHub      : https://github.com/toufudealer", type: "response" });
                newLines.push({ text: "  Steam       : https://steamcommunity.com/id/toufudealer", type: "response" });
                newLines.push({ text: "  MyAnimeList : https://myanimelist.net/profile/toufudealer", type: "response" });
                newLines.push({ text: "  Spotify     : https://open.spotify.com/user/ralcqz0nk2sazx60hctyacype?nd=1&dlsi=d2114e6207eb4647", type: "response" });
                break;
            case 'whoami':
                newLines.push({ text: "toufudealer", type: "response" });
                break;
            case 'matrix':
                newLines.push({ text: "Entering the Matrix...", type: "response" });
                setLines(newLines);
                setInput('');
                setTimeout(() => setMatrixMode(true), 500);
                return;
            case 'pong':
                setGameMode('pong');
                setPongState({
                    ball: { x: 30, y: 10, dx: 1, dy: 1 },
                    leftPaddle: 8,
                    rightPaddle: 8,
                    leftScore: 0,
                    rightScore: 0,
                    gameOver: false,
                    winner: null
                });
                setInput('');
                return;
            case 'clear':
                setLines([]);
                setInput('');
                return;
            default:
                newLines.push({ text: `Command not found: ${cmd}`, type: "error" });
        }
        setLines(newLines);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input);
        }
    };

    // Render Pong game as ASCII art
    const renderPongGame = () => {
        const FIELD_WIDTH = 60;
        const FIELD_HEIGHT = 20;
        const PADDLE_HEIGHT = 4;
        let display = [];

        // Top border
        display.push('┌' + '─'.repeat(FIELD_WIDTH) + '┐');

        // Field
        for (let y = 0; y < FIELD_HEIGHT; y++) {
            let line = '│';
            for (let x = 0; x < FIELD_WIDTH; x++) {
                // Left paddle
                if (x === 1 && y >= pongState.leftPaddle && y < pongState.leftPaddle + PADDLE_HEIGHT) {
                    line += '█';
                }
                // Right paddle
                else if (x === FIELD_WIDTH - 2 && y >= pongState.rightPaddle && y < pongState.rightPaddle + PADDLE_HEIGHT) {
                    line += '█';
                }
                // Ball
                else if (Math.floor(pongState.ball.x) === x && Math.floor(pongState.ball.y) === y) {
                    line += '●';
                }
                // Center line
                else if (x === Math.floor(FIELD_WIDTH / 2)) {
                    line += '┊';
                }
                else {
                    line += ' ';
                }
            }
            line += '│';
            display.push(line);
        }

        // Bottom border
        display.push('└' + '─'.repeat(FIELD_WIDTH) + '┘');

        // Score and controls
        display.push('');
        display.push(`  You: ${pongState.leftScore}  ${' '.repeat(FIELD_WIDTH - 20)}  AI: ${pongState.rightScore}`);
        display.push('');
        if (pongState.gameOver) {
            display.push(`  🎉 ${pongState.winner} WIN${pongState.winner === 'You' ? '' : 'S'}! 🎉`);
            display.push(`  Press ESC to exit`);
        } else {
            display.push(`  Controls: W/S to move | ESC to quit`);
        }

        return display.join('\n');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-transparent border border-white/50 rounded-lg overflow-hidden font-mono text-sm md:text-base"
        >
            {/* Header */}
            <div className="bg-transparent px-4 py-2 flex items-center justify-between border-b border-white/30">
                <div className="flex items-center gap-2 text-white">
                    <TerminalIcon size={16} />
                    <span className="font-bold glitch-text" data-text="user@toufu:~">user@toufu:~</span>
                </div>
                <div className="flex gap-2">
                    <Minimize size={14} className="text-gray-500 hover:text-white cursor-pointer" />
                    <Maximize size={14} className="text-gray-500 hover:text-white cursor-pointer" />
                    <X size={14} className="text-gray-500 hover:text-red-500 cursor-pointer" />
                </div>
            </div>

            {/* Body */}
            <div ref={terminalBodyRef} className="p-4 h-[400px] overflow-y-auto text-gray-300 custom-scrollbar">
                {gameMode === 'pong' ? (
                    <pre className="text-white text-xs leading-tight">
                        {renderPongGame()}
                    </pre>
                ) : (
                    <>
                        {lines.map((line, index) => (
                            <div key={index} className={`mb-1 ${line.type === 'error' ? 'text-white font-bold' : line.type === 'system' ? 'text-gray-500' : ''}`}>
                                {line.type === 'ascii' ? (
                                    <div className="flex gap-6">
                                        <div className="flex flex-col">
                                            <div className="whitespace-pre text-blue-400 font-bold leading-tight">
                                                {line.textArt}
                                            </div>
                                            <div className="whitespace-pre text-white font-bold leading-tight">
                                                {line.faceArt}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center text-white/90">
                                            {line.info.map((infoLine, i) => (
                                                <div key={i} className="leading-tight">
                                                    {infoLine}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    line.text
                                )}
                            </div>
                        ))}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-white">{'>'}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent border-none outline-none text-white w-full focus:ring-0"
                                autoFocus
                            />
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Terminal;
