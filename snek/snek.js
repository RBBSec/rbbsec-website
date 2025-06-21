// DOM Elements
const board = document.getElementById('game-board');
const splashScreen = document.getElementById('splash-screen');
const logo = document.getElementById('logo');
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
    splashScreen.style.display = 'none'; // Single element hides the full splash
    logo.style.display = 'none';

    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Main game loop
function gameLoop() {
    moveSnake();
    if (checkCollision()) endGame();
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

    if (head.x === food.x && head.y === food.y) {
        increaseSpeed();
        // Don't pop — this makes the snake grow
    } else {
        snake.pop();
    }
}

// Draw the game elements
function draw() {
    board.innerHTML = '';

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            createImageElement('snake-head', segment, 'snake_pix.png');
        } else {
            createElement('snake', segment);
        }
    });

    // 🟢 Ensure food doesn't overlap snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = generateFood();
    }

    // Draw food
    createImageElement('food', food, 'food.png');

    updateScore();
}

function createImageElement(className, position, imagePath) {
    const img = document.createElement('img');
    img.src = imagePath;
    img.className = className;
    img.style.gridColumn = position.x;
    img.style.gridRow = position.y;
    img.alt = 'Food';
    board.appendChild(img);
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
    splashScreen.style.display = 'flex';
    logo.style.display = 'block';
}


// Gradually increase snake speed after eating food
function increaseSpeed() {
    if (gameSpeed > 50) gameSpeed -= 5;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function endGame() {
    clearInterval(gameInterval);
    gameRunning = false;

    const form = document.getElementById("score-form");
    const submitBtn = document.getElementById("submitScoreForm");

    // Show the form
    form.style.display = "block";

    // Clear previous event listeners
    submitBtn.onsubmit = null;

    submitBtn.onsubmit = function (e) {
        e.preventDefault();

        const name = document.getElementById("playerName").value.trim();
        const email = document.getElementById("playerEmail").value.trim();
        const score = snake.length - 1;

        if (!name || score <= 0) {
            alert("Please enter your name and earn a score!");
            return;
        }

        // Prevent duplicate name + score
        const leaderboard = JSON.parse(localStorage.getItem("submittedScores") || "[]");
        const exists = leaderboard.find(entry => entry.name === name && entry.score === score);
        if (exists) {
            alert("Score already submitted!");
            return;
        }

        const createdAt = new Date().toISOString();

        fetch("https://685609b41789e182b37cefd6.mockapi.io/leaderboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, score, createdAt })
        })
            .then(res => res.json())
            .then(data => {
                leaderboard.push({ name, score });
                localStorage.setItem("submittedScores", JSON.stringify(leaderboard));

                form.style.display = "none";
                document.getElementById("playerName").value = "";
                document.getElementById("playerEmail").value = "";
                loadLeaderboard();
            })
            .catch(err => {
                alert("Error submitting score!");
                console.error(err);
            });
    };
}
 
  
function loadLeaderboard() {
    fetch("https://685609b41789e182b37cefd6.mockapi.io/leaderboard?sortBy=score&order=desc")
        .then(res => res.json())
        .then(data => {
            const leaderboardElement = document.getElementById('leaderboard');
            leaderboardElement.innerHTML = data.slice(0, 10).map((entry, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${entry.name.toUpperCase()}</td>
                    <td>${entry.score}</td>
                </tr>
            `).join('');
        })
        .catch(err => console.error("Error loading leaderboard:", err));
}
  
  
  