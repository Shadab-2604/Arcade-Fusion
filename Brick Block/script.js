import SessionManager from './sessionManager.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const menuDiv = document.getElementById('menu');
const gameContainerDiv = document.getElementById('game-container');
const controlsDiv = document.getElementById('controls');

const sessionManager = new SessionManager();
let gameLoop;
let ball, paddle, bricks;
let score = 0, lives = 3;

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 5;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

canvas.width = 400;
canvas.height = 400;

class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball extends GameObject {
    constructor(x, y, radius, color) {
        super(x, y, radius * 2, radius * 2, color);
        this.radius = radius;
        this.dx = 2;
        this.dy = -2;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }

        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

function createBricks() {
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = new GameObject(
                col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
                row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 30,
                BRICK_WIDTH,
                BRICK_HEIGHT,
                `hsl(${Math.random() * 360}, 50%, 50%)`
            );
            bricks.push(brick);
        }
    }
    return bricks;
}

function initGame() {
    ball = new Ball(canvas.width / 2, canvas.height - 30, BALL_RADIUS, '#FFF');
    paddle = new GameObject(canvas.width / 2 - PADDLE_WIDTH / 2, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, '#0095DD');
    bricks = createBricks();
    score = 0;
    lives = 3;
    updateScoreAndLives();
}

function updateScoreAndLives() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    const stats = sessionManager.getStats();
    document.getElementById('high-score').textContent = stats.highScore;
    sessionManager.updateScore(score);
}

function collisionDetection() {
    for (let i = bricks.length - 1; i >= 0; i--) {
        const brick = bricks[i];
        if (ball.x > brick.x && ball.x < brick.x + brick.width &&
            ball.y > brick.y && ball.y < brick.y + brick.height) {
            ball.dy = -ball.dy;
            bricks.splice(i, 1);
            score++;
            updateScoreAndLives();
        }
    }

    if (ball.y + ball.radius > paddle.y && ball.y + ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.draw();
    paddle.draw();
    bricks.forEach(brick => brick.draw());
}

function gameOver() {
    cancelAnimationFrame(gameLoop);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 2, canvas.height / 2);
    const stats = sessionManager.getStats();
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${stats.highScore}`, canvas.width / 2, canvas.height / 2 + 40);
    startButton.textContent = 'Play Again';
    menuDiv.classList.remove('hidden');
    sessionManager.incrementGamesPlayed();
}

function update() {
    ball.move();
    collisionDetection();

    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives === 0) {
            gameOver();
            return;
        }
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 30;
        ball.dx = 2;
        ball.dy = -2;
    }

    updateScoreAndLives();
    drawGame();
    gameLoop = requestAnimationFrame(update);
}

function startGame() {
    menuDiv.classList.add('hidden');
    gameContainerDiv.classList.remove('hidden');
    controlsDiv.classList.remove('hidden');
    sessionManager.resetCurrentScore();
    initGame();
    update();
}

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && paddle.x > 0) {
        paddle.x -= 7;
    } else if (e.key === 'ArrowRight' && paddle.x + paddle.width < canvas.width) {
        paddle.x += 7;
    }
});

// Touch and mouse controls
let isDragging = false;

function handleStart(e) {
    isDragging = true;
    handleMove(e);
}

function handleMove(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        paddle.x = Math.max(0, Math.min(x - paddle.width / 2, canvas.width - paddle.width));
    }
}

function handleEnd() {
    isDragging = false;
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);