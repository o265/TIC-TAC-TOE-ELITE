// Game state variables
let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isComputerGame = false;
let computerDifficulty = 'medium';
let computerStarts = false;

// DOM elements
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const settingsContainer = document.getElementById('settingsContainer');
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('[data-cell]');
const restartButton = document.getElementById('restartButton');
const backToMenu = document.getElementById('backToMenu');
const playBtn = document.getElementById('playBtn');
const computerBtn = document.getElementById('computerBtn');
const settingsBtn = document.getElementById('settingsBtn');
const saveSettings = document.getElementById('saveSettings');
const backToMenuFromSettings = document.getElementById('backToMenuFromSettings');
const difficultySelect = document.getElementById('difficulty');
const startingPlayerSelect = document.getElementById('startingPlayer');
const themeButtons = document.querySelectorAll('.theme-btn');
const board = document.getElementById('board');

// Theme switching
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        // Save theme preference
        localStorage.setItem('selectedTheme', theme);
    });
});

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'sunset';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set the active state for the saved theme button
    themeButtons.forEach(button => {
        if (button.getAttribute('data-theme') === savedTheme) {
            button.classList.add('active');
        }
    });
});

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Messages
const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `Player ${currentPlayer}'s turn`;

// Menu navigation
playBtn.addEventListener('click', () => {
    isComputerGame = false;
    startGame();
});

computerBtn.addEventListener('click', () => {
    isComputerGame = true;
    startGame();
});

settingsBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    settingsContainer.style.display = 'block';
});

backToMenu.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    menu.style.display = 'flex';
    removeWinningLine();
});

backToMenuFromSettings.addEventListener('click', () => {
    settingsContainer.style.display = 'none';
    menu.style.display = 'flex';
});

saveSettings.addEventListener('click', () => {
    computerDifficulty = difficultySelect.value;
    computerStarts = startingPlayerSelect.value === 'computer';
    settingsContainer.style.display = 'none';
    menu.style.display = 'flex';
});

// Initialize game
function startGame() {
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    resetGame();
    if (isComputerGame && computerStarts) {
        makeComputerMove();
    }
}

// Handle cell click
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell'));

    // Check if cell is already played or game is not active
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Update game state and UI
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    // If playing against computer and game is still active, make computer move
    if (isComputerGame && gameActive) {
        setTimeout(makeComputerMove, 500);
    }
}

// Computer move logic
function makeComputerMove() {
    if (!gameActive) return;

    let move;
    switch (computerDifficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }

    if (move !== null) {
        const cell = document.querySelector(`[data-cell="${move}"]`);
        handleCellPlayed(cell, move);
        handleResultValidation();
    }
}

// Helper functions for computer moves
function getRandomMove() {
    const availableMoves = gameState.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : null;
}

function getMediumMove() {
    // Try to win
    let move = findWinningMove('O');
    if (move !== null) return move;
    
    // Block player's winning move
    move = findWinningMove('X');
    if (move !== null) return move;
    
    // Take center if available
    if (gameState[4] === '') return 4;
    
    // Take random move
    return getRandomMove();
}

function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const condition = gameState[a] === player && gameState[b] === player && gameState[c] === '';
        if (condition) return c;
        const condition2 = gameState[a] === player && gameState[c] === player && gameState[b] === '';
        if (condition2) return b;
        const condition3 = gameState[b] === player && gameState[c] === player && gameState[a] === '';
        if (condition3) return a;
    }
    return null;
}

function getBestMove() {
    // Try to win
    let move = findWinningMove('O');
    if (move !== null) return move;
    
    // Block player's winning move
    move = findWinningMove('X');
    if (move !== null) return move;
    
    // Take center if available
    if (gameState[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => gameState[index] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available move
    return getRandomMove();
}

// Update game state and UI after a cell is played
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

// Check if current player has won
function handleResultValidation() {
    let roundWon = false;
    let winningCombination = null;
    
    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const condition = gameState[a] && 
                         gameState[a] === gameState[b] && 
                         gameState[a] === gameState[c];
        
        if (condition) {
            roundWon = true;
            winningCombination = winningConditions[i];
            break;
        }
    }

    // Handle win or draw
    if (roundWon) {
        statusDisplay.textContent = winningMessage();
        gameActive = false;
        showWinningLine(winningCombination);
        return;
    }

    // Check for draw
    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        statusDisplay.textContent = drawMessage();
        gameActive = false;
        return;
    }

    // Switch player
    handlePlayerChange();
}

// Show winning line animation
function showWinningLine(combination) {
    const [a, b, c] = combination;
    const cellA = document.querySelector(`[data-cell="${a}"]`);
    const cellB = document.querySelector(`[data-cell="${b}"]`);
    const cellC = document.querySelector(`[data-cell="${c}"]`);
    
    // Add winner class to winning cells
    cellA.classList.add('winner');
    cellB.classList.add('winner');
    cellC.classList.add('winner');

    // Create and position winning line
    const line = document.createElement('div');
    line.className = 'winning-line';
    
    // Determine line type and position
    if (a % 3 === 0 && b % 3 === 1 && c % 3 === 2) {
        line.classList.add('horizontal');
        line.style.top = `${cellA.offsetTop + cellA.offsetHeight / 2}px`;
        line.style.left = `${cellA.offsetLeft}px`;
        line.style.width = `${cellC.offsetLeft + cellC.offsetWidth - cellA.offsetLeft}px`;
    } else if (a < 3 && b < 6 && c < 9) {
        line.classList.add('vertical');
        line.style.left = `${cellA.offsetLeft + cellA.offsetWidth / 2}px`;
        line.style.top = `${cellA.offsetTop}px`;
        line.style.width = `${cellC.offsetTop + cellC.offsetHeight - cellA.offsetTop}px`;
    } else if (a === 0 && b === 4 && c === 8) {
        line.classList.add('diagonal-1');
        line.style.left = `${cellA.offsetLeft}px`;
        line.style.top = `${cellA.offsetTop}px`;
        line.style.width = `${Math.sqrt(2) * (cellC.offsetLeft + cellC.offsetWidth - cellA.offsetLeft)}px`;
    } else {
        line.classList.add('diagonal-2');
        line.style.left = `${cellA.offsetLeft + cellA.offsetWidth}px`;
        line.style.top = `${cellA.offsetTop}px`;
        line.style.width = `${Math.sqrt(2) * (cellC.offsetLeft + cellC.offsetWidth - cellA.offsetLeft)}px`;
    }

    board.appendChild(line);
    setTimeout(() => {
        line.style.width = '100%';
    }, 10);
}

// Remove winning line
function removeWinningLine() {
    const line = document.querySelector('.winning-line');
    if (line) {
        line.remove();
    }
    cells.forEach(cell => cell.classList.remove('winner'));
}

// Switch between players
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = currentPlayerTurn();
}

// Reset game
function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    statusDisplay.textContent = currentPlayerTurn();
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
    removeWinningLine();
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', resetGame);

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            // Add winning animation
            const cells = document.querySelectorAll('.cell');
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');

            // Add winning line
            const boardElement = document.getElementById('board');
            const winningLine = document.createElement('div');
            winningLine.className = 'winning-line';
            
            // Determine line position and orientation
            if (combination[0] === 0 && combination[1] === 1 && combination[2] === 2) {
                winningLine.classList.add('horizontal');
                winningLine.style.top = '33.33%';
            } else if (combination[0] === 3 && combination[1] === 4 && combination[2] === 5) {
                winningLine.classList.add('horizontal');
                winningLine.style.top = '66.66%';
            } else if (combination[0] === 6 && combination[1] === 7 && combination[2] === 8) {
                winningLine.classList.add('horizontal');
                winningLine.style.top = '100%';
            } else if (combination[0] === 0 && combination[1] === 3 && combination[2] === 6) {
                winningLine.classList.add('vertical');
                winningLine.style.left = '16.66%';
            } else if (combination[0] === 1 && combination[1] === 4 && combination[2] === 7) {
                winningLine.classList.add('vertical');
                winningLine.style.left = '50%';
            } else if (combination[0] === 2 && combination[1] === 5 && combination[2] === 8) {
                winningLine.classList.add('vertical');
                winningLine.style.left = '83.33%';
            } else if (combination[0] === 0 && combination[1] === 4 && combination[2] === 8) {
                winningLine.classList.add('diagonal-1');
            } else if (combination[0] === 2 && combination[1] === 4 && combination[2] === 6) {
                winningLine.classList.add('diagonal-2');
            }

            boardElement.appendChild(winningLine);
            setTimeout(() => {
                winningLine.style.width = '100%';
            }, 100);

            return gameState[a];
        }
    }

    if (gameState.every(cell => cell)) {
        return 'draw';
    }

    return null;
}

resetGame(); 