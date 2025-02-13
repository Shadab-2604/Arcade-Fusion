const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const newGameButton = document.getElementById('new-game');

let board;
let score;
let highScore = parseInt(sessionStorage.getItem('highScore')) || 0;
let size = 4;

// Add high score display to HTML
const highScoreContainer = document.createElement('div');
highScoreContainer.className = 'score-container';
highScoreContainer.innerHTML = `High Score: <span id="high-score">${highScore}</span>`;
document.querySelector('.score-container').after(highScoreContainer);

// Create modal elements for game over popup
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <h2>Game Over!</h2>
        <div id="achievement-message"></div>
        <p>Score: <span id="final-score"></span></p>
        <p>High Score: <span id="final-high-score"></span></p>
        <button id="play-again">Play Again</button>
    </div>
`;
document.body.appendChild(modal);

// Add modal styles
const style = document.createElement('style');
style.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background-color: #faf8ef;
        padding: 20px;
        border-radius: 6px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .modal-content h2 {
        color: #776e65;
        margin-bottom: 20px;
    }
    .modal-content p {
        color: #776e65;
        margin: 10px 0;
        font-size: 18px;
    }
    .modal button {
        margin-top: 20px;
    }
    #achievement-message {
        margin: 15px 0;
        padding: 10px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 18px;
    }
    .new-record {
        background-color: #edc22e;
        color: #f9f6f2;
    }
    .close-to-record {
        background-color: #f67c5f;
        color: #f9f6f2;
    }
`;
document.head.appendChild(style);

function showGameOver() {
    const achievementMessage = document.getElementById('achievement-message');
    const finalScoreSpan = document.getElementById('final-score');
    const finalHighScoreSpan = document.getElementById('final-high-score');

    // Check if high score was beaten
    if (score > highScore) {
        achievementMessage.className = 'new-record';
        achievementMessage.textContent = `🏆 New High Score! You beat the previous record by ${score - highScore} points!`;
    } else {
        achievementMessage.className = '';
        achievementMessage.textContent = 'Keep practicing to beat the high score!';
    }

    finalScoreSpan.textContent = score;
    finalHighScoreSpan.textContent = highScore;
    modal.style.display = 'flex';
}

function hideGameOver() {
    modal.style.display = 'none';
}

// Add event listener for play again button
document.getElementById('play-again').addEventListener('click', () => {
    hideGameOver();
    sessionStorage.removeItem('gameState');
    initGame();
});

function initGame() {
    // Try to load saved game state from session storage
    const savedState = sessionStorage.getItem('gameState');
    if (savedState) {
        const state = JSON.parse(savedState);
        board = state.board;
        score = state.score;
    } else {
        board = Array(size).fill().map(() => Array(size).fill(0));
        score = 0;
        addNewTile();
        addNewTile();
    }
    updateBoard();
}

function saveGameState() {
    const gameState = {
        board: board,
        score: score
    };
    sessionStorage.setItem('gameState', JSON.stringify(gameState));
    
    // Update high score if current score is higher
    if (score > highScore) {
        highScore = score;
        sessionStorage.setItem('highScore', highScore);
        document.getElementById('high-score').textContent = highScore;
    }
}

function addNewTile() {
    let emptyCells = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({i, j});
            }
        }
    }
    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let tile = document.createElement('div');
            tile.className = `tile${board[i][j] !== 0 ? ' tile-' + board[i][j] : ''}`;
            tile.textContent = board[i][j] !== 0 ? board[i][j] : '';
            gameBoard.appendChild(tile);
        }
    }
    scoreElement.textContent = score;
    saveGameState();
}

function move(direction) {
    let moved = false;
    let newBoard = JSON.parse(JSON.stringify(board));

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < size; i++) {
            let row = newBoard[i];
            row = direction === 'left' ? slide(row) : slide(row.reverse()).reverse();
            newBoard[i] = row;
            if (!moved && !arraysEqual(newBoard[i], board[i])) moved = true;
        }
    } else {
        for (let j = 0; j < size; j++) {
            let column = newBoard.map(row => row[j]);
            column = direction === 'up' ? slide(column) : slide(column.reverse()).reverse();
            for (let i = 0; i < size; i++) {
                newBoard[i][j] = column[i];
            }
            if (!moved && !arraysEqual(column, board.map(row => row[j]))) moved = true;
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        updateBoard();
        
        // Check for game over after each move
        if (isGameOver()) {
            sessionStorage.removeItem('gameState'); // Clear saved game state
            showGameOver();
        }
    }
}

function slide(row) {
    let newRow = row.filter(val => val !== 0);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow.splice(i + 1, 1);
        }
    }
    while (newRow.length < size) {
        newRow.push(0);
    }
    return newRow;
}

function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function isGameOver() {
    // First check if there are any empty cells
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) return false;
        }
    }
    
    // Then check if there are any possible merges
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i < size - 1 && board[i][j] === board[i + 1][j]) return false;
            if (j < size - 1 && board[i][j] === board[i][j + 1]) return false;
        }
    }
    
    return true;
}

// Modified new game function to clear session storage and hide modal
newGameButton.addEventListener('click', () => {
    hideGameOver();
    sessionStorage.removeItem('gameState');
    initGame();
});

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
    }
});

let touchStartX, touchStartY;

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

gameBoard.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) move('right');
        else move('left');
    } else {
        if (deltaY > 0) move('down');
        else move('up');
    }

    touchStartX = null;
    touchStartY = null;
});

initGame();