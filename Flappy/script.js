const gameArea = document.getElementById('game-area');
const bird = document.getElementById('bird');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const homeButton = document.getElementById('home-button');
const finalScoreElement = document.getElementById('final-score');
const difficultySelect = document.getElementById('difficulty-select');
const highScoreElement = document.getElementById('high-score');

let gameLoop = null;
let birdY;
let birdVelocity;
let birdAcceleration;
let score;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let pipes = [];
let lastJumpTime;
let isGameRunning = false;

const PIPE_SPEEDS = {
    easy: 1,
    medium: 1.5,
    hard: 2
};

const PIPE_INTERVALS = {
    easy: 3000,
    medium: 2500,
    hard: 2000
};

let PIPE_SPEED = PIPE_SPEEDS.medium;
let PIPE_SPAWN_INTERVAL = PIPE_INTERVALS.medium;

const JUMP_FORCE = -8;
const GRAVITY = 0.4;
const FLAP_SPEED = 100;

function jump(event) {
    if (!isGameRunning) return;
    if (event.type === 'keydown' && event.code !== 'Space') return;
    event.preventDefault();
    
    const currentTime = Date.now();
    if (currentTime - lastJumpTime < FLAP_SPEED) return;
    
    lastJumpTime = currentTime;
    
    // Reduce jump force by 1/4 for touch/tap inputs
    if (event.type === 'touchstart' || event.type === 'click') {
        birdVelocity = JUMP_FORCE * 0.75; // 25% reduction
    } else {
        birdVelocity = JUMP_FORCE;
    }
}

function spawnPipe() {
    if (!isGameRunning) return;
    
    const gapHeight = 170;
    const gapPosition = Math.random() * (gameArea.clientHeight - gapHeight - 100) + 50;

    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');
    
    topPipe.className = 'pipe pipe-top';
    bottomPipe.className = 'pipe pipe-bottom';
    
    topPipe.style.height = `${gapPosition}px`;
    bottomPipe.style.height = `${gameArea.clientHeight - gapPosition - gapHeight}px`;
    
    topPipe.style.left = `${gameArea.clientWidth}px`;
    bottomPipe.style.left = `${gameArea.clientWidth}px`;

    gameArea.appendChild(topPipe);
    gameArea.appendChild(bottomPipe);

    pipes.push({
        topElement: topPipe,
        bottomElement: bottomPipe,
        x: gameArea.clientWidth,
        passed: false
    });

    if (isGameRunning) {
        window.pipeSpawnTimeout = setTimeout(spawnPipe, PIPE_SPAWN_INTERVAL);
    }
}

function updateGame() {
    if (!isGameRunning) return;

    birdVelocity += GRAVITY;
    birdY += birdVelocity;

    if (birdY < 0) {
        birdY = 0;
        birdVelocity = 0;
    }

    if (birdY + bird.clientHeight > gameArea.clientHeight) {
        gameOver();
        return;
    }

    bird.style.top = `${birdY}px`;
    bird.style.transform = `rotate(${Math.min(Math.max(birdVelocity * 2, -20), 90)}deg)`;

    const birdRect = bird.getBoundingClientRect();
    
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;
        pipe.topElement.style.left = `${pipe.x}px`;
        pipe.bottomElement.style.left = `${pipe.x}px`;

        if (!pipe.passed && pipe.x + 50 < birdRect.left) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
        }

        if (pipe.x < -60) {
            pipe.topElement.remove();
            pipe.bottomElement.remove();
            pipes.splice(index, 1);
        } else if (checkCollision(pipe)) {
            gameOver();
        }
    });
}

function checkCollision(pipe) {
    const birdRect = bird.getBoundingClientRect();
    const topPipeRect = pipe.topElement.getBoundingClientRect();
    const bottomPipeRect = pipe.bottomElement.getBoundingClientRect();

    return (
        birdRect.left < topPipeRect.right &&
        birdRect.right > topPipeRect.left &&
        (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top)
    );
}

function setDifficulty() {
    const difficulty = difficultySelect.value;
    PIPE_SPEED = PIPE_SPEEDS[difficulty];
    PIPE_SPAWN_INTERVAL = PIPE_INTERVALS[difficulty];
}

function initGame() {
    birdY = gameArea.clientHeight / 2 - bird.clientHeight / 2;
    birdVelocity = 0;
    birdAcceleration = GRAVITY;
    score = 0;
    pipes = [];
    lastJumpTime = 0;
    isGameRunning = false;

    const existingPipes = gameArea.querySelectorAll('.pipe');
    existingPipes.forEach(pipe => pipe.remove());

    bird.style.top = `${birdY}px`;
    bird.style.transform = 'rotate(0deg)';
    scoreElement.textContent = `Score: ${score}`;
    highScoreElement.textContent = `High Score: ${highScore}`;
}

function startGame() {
    if (isGameRunning) return;
    
    initGame();
    setDifficulty();
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    isGameRunning = true;
    gameLoop = setInterval(updateGame, 1000 / 60);
    spawnPipe();

    document.addEventListener('keydown', jump);
    document.addEventListener('touchstart', jump);
    gameArea.addEventListener('click', jump);
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    clearTimeout(window.pipeSpawnTimeout);
    
    document.removeEventListener('keydown', jump);
    document.removeEventListener('touchstart', jump);
    gameArea.removeEventListener('click', jump);
    
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

function goHome() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    initGame();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
homeButton.addEventListener('click', goHome);

// Initialize the game on load
initGame();