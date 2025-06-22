// DOM Elements
const board = document.getElementById('game-board');
const splashScreen = document.getElementById('splash-screen');
const logo = document.getElementById('logo');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById("game-over-screen");
const submitBtn = document.getElementById("submitScoreForm");

// Game settings
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = 'RIGHT';
let gameInterval, gameSpeed = 150;
let gameRunning = false, highScore = 0;

// Initial render
draw();

// Keyboard listener
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
    splashScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Game loop
function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }
    draw();
}

function setDirection(key) {
    const directions = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT'
    };
    if (directions[key]) direction = directions[key];
}

function moveSnake() {
    const head = { ...snake[0] };
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function draw() {
    board.innerHTML = '';

    snake.forEach((segment, index) => {
        if (index === 0) {
            createImageElement('snake-head', segment, 'snake_pix.png');
        } else {
            createElement('snake', segment);
        }
    });

    if (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
        food = generateFood();
    }
    createImageElement('food', food, 'food.png');
    updateScore();
}

function createImageElement(className, position, imagePath) {
    const img = document.createElement('img');
    img.src = imagePath;
    img.className = className;
    img.style.gridColumn = position.x;
    img.style.gridRow = position.y;
    board.appendChild(img);
}

function createElement(className, position) {
    const element = document.createElement('div');
    element.className = className;
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
    board.appendChild(element);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * gridSize) + 1,
        y: Math.floor(Math.random() * gridSize) + 1
    };
}

function checkCollision() {
    const head = snake[0];
    const hitWall = head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize;
    const hitSelf = snake.slice(1).some(s => s.x === head.x && s.y === head.y);
    return hitWall || hitSelf;
}

function resetGame() {
    stopGame();
    updateHighScore();
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = 'RIGHT';
    gameSpeed = 150;
    updateScore();
}

function updateScore() {
    const current = snake.length - 1;
    scoreElement.textContent = current.toString().padStart(3, '0');
}

function updateHighScore() {
    const current = snake.length - 1;
    if (current > highScore) {
        highScore = current;
        highScoreElement.textContent = highScore.toString().padStart(3, '0');
    }
}

function stopGame() {
    clearInterval(gameInterval);
    gameRunning = false;
}

function increaseSpeed() {
    if (gameSpeed > 50) gameSpeed -= 5;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function endGame() {
    clearInterval(gameInterval);
    gameRunning = false;

    finalScore = snake.length - 1;
    document.getElementById("game-over-screen").style.display = "flex";

    const form = document.getElementById("submitScoreForm");

    form.onsubmit = function (e) {
        e.preventDefault();

        const name = document.getElementById("playerName").value.trim();
        const email = document.getElementById("playerEmail").value.trim();
        const score = finalScore;

        if (!name || score <= 0) {
            alert("Please enter your name and earn a score!");
            return;
        }

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
            .then(() => {
                leaderboard.push({ name, score });
                localStorage.setItem("submittedScores", JSON.stringify(leaderboard));
                loadLeaderboard();
                alert("Score submitted!");
            })
            .catch(err => {
                alert("Error submitting score!");
                console.error(err);
            });
    };
}

document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("game-over-screen").style.display = "none";
    resetGame();
    startGame();
});

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

window.addEventListener("DOMContentLoaded", loadLeaderboard);

document.querySelectorAll(".mobile-controls .arrow").forEach(button => {
    button.addEventListener("click", () => {
        const direction = button.getAttribute("data-direction");
        setDirection(direction);
    });
});