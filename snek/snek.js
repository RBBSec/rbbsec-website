// DOM Elements
const board = document.getElementById('game-board');
const instructionText = document.getElementById('instruction-text');
const logo = document.getElementById('logo');
const readyText = document.getElementById('ready-text');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

// Game settings
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = 'RIGHT';
let gameInterval, gameSpeed = 150;
let gameRunning = false, highScore = 0;

// Initial render
draw();

// Event Listener: Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code === 'Space') {
        startGame();
    } else {
        setDirection(e.key);
    }
});

// Start the game
function startGame() {
    gameRunning = true;
    instructionText.style.display = 'none';
    logo.style.display = 'none';
    readyText.style.display = 'none';

    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Main game loop
function gameLoop() {
    moveSnake();
    if (checkCollision()) resetGame();
    draw();
}

// Set snake direction
function setDirection(key) {
    const directions = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT'
    };
    if (directions[key]) direction = directions[key];
}

// Move snake based on current direction
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    snake.unshift(head);

    // Eat food or move forward
    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

// Draw the game elements
function draw() {
    board.innerHTML = '';
    snake.forEach(segment => createElement('snake', segment));
    createElement('food', food);
    updateScore();
}

// Create a snake or food element
function createElement(className, position) {
    const element = document.createElement('div');
    element.className = className;
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
    board.appendChild(element);
}

// Randomly generate food
function generateFood() {
    return {
        x: Math.floor(Math.random() * gridSize) + 1,
        y: Math.floor(Math.random() * gridSize) + 1
    };
}

// Check for collision (walls or snake itself)
function checkCollision() {
    const head = snake[0];
    const hitWall = head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize;
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    return hitWall || hitSelf;
}

// Reset the game after collision
function resetGame() {
    stopGame();
    updateHighScore();
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = 'RIGHT';
    gameSpeed = 150;
    updateScore();
}

// Update score display
function updateScore() {
    const currentScore = snake.length - 1;
    scoreElement.textContent = currentScore.toString().padStart(3, '0');
}

// Update high score display
function updateHighScore() {
    const currentScore = snake.length - 1;
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreElement.textContent = highScore.toString().padStart(3, '0');
    }
}

// Stop the game and reset visuals
function stopGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    instructionText.style.display = 'block';
    logo.style.display = 'block';
    readyText.style.display = 'block';
}

// Gradually increase snake speed after eating food
function increaseSpeed() {
    if (gameSpeed > 50) gameSpeed -= 5;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}
