const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snakeSize = 20;
let snake = [
    { x: 100, y: 100 },
    { x: 80, y: 100 },
    { x: 60, y: 100 },
];

let food = { x: 0, y: 0 };
let direction = "RIGHT";
let score = 0;
let gameOver = false;

// Set the canvas size based on the window dimensions
function resizeCanvas() {
    const gameWidth = window.innerWidth * 0.9; // 90% of screen width
    const gameHeight = window.innerHeight * 0.7; // 70% of screen height
    canvas.width = Math.floor(gameWidth / snakeSize) * snakeSize; // Make width a multiple of snakeSize
    canvas.height = Math.floor(gameHeight / snakeSize) * snakeSize; // Make height a multiple of snakeSize
}

// Listen for arrow key inputs (for desktop)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && direction !== "DOWN") {
        direction = "UP";
    } else if (event.key === "ArrowDown" && direction !== "UP") {
        direction = "DOWN";
    } else if (event.key === "ArrowLeft" && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (event.key === "ArrowRight" && direction !== "LEFT") {
        direction = "RIGHT";
    }
});

// Touch event listeners (for mobile)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Detect swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== "LEFT") {
            direction = "RIGHT";
        } else if (deltaX < 0 && direction !== "RIGHT") {
            direction = "LEFT";
        }
    } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== "UP") {
            direction = "DOWN";
        } else if (deltaY < 0 && direction !== "DOWN") {
            direction = "UP";
        }
    }
});

// Game logic to move the snake
function moveSnake() {
    let head = { ...snake[0] };

    if (direction === "UP") head.y -= snakeSize;
    if (direction === "DOWN") head.y += snakeSize;
    if (direction === "LEFT") head.x -= snakeSize;
    if (direction === "RIGHT") head.x += snakeSize;

    snake.unshift(head); // Add new head to snake array

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood(); // Generate new food after eating
    } else {
        snake.pop(); // Remove the last part of the snake if no food is eaten
    }

    checkCollisions();
}

// Check if the snake collides with itself or the walls
function checkCollisions() {
    const head = snake[0];

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver = true;
    }

    // Check self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }
}

// Draw everything (snake, food, score)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "green" : "lightgreen";
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    });

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);

    // Draw score
    document.getElementById("score").textContent = `Score: ${score}`;

    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Game Over", canvas.width / 2 - 90, canvas.height / 2);
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 100, canvas.height / 2 + 40);
        clearInterval(gameLoop);
    }
}

// Generate random position for the food
function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
    food.y = Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize;
}

// Main game loop
function gameLoop() {
    if (!gameOver) {
        moveSnake();
        draw();
    }
}

// Start the game
resizeCanvas();
generateFood();
let gameInterval = setInterval(gameLoop, 100);

// Ensure the canvas resizes dynamically when the window is resized
window.addEventListener("resize", resizeCanvas);
