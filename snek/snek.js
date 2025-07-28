// DOM Elements
const board = document.getElementById('game-board');
const splashScreen = document.getElementById('splash-screen');
const logo = document.getElementById('logo');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById("game-over-screen");
const submitBtn = document.getElementById("submitScoreForm");
const bgMusic = new Audio("assets/sounds/bg_music.mp3");
bgMusic.loop = true;

const eatSound = new Audio("assets/sounds/eat.mp3");
const gameOverSound = new Audio("assets/sounds/gameover.mp3");

let soundEnabled = true;

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
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent arrow keys from scrolling the page
        setDirection(e.key);
    }
});

let finalScore = 0;

// Start the game
function startGame() {
    gameRunning = true;
    splashScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameInterval = setInterval(gameLoop, gameSpeed);

    // Scroll game container into view (use smooth scroll)
    document.querySelector('.game-container').scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (soundEnabled) bgMusic.play();
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

function setDirection(input) {
    const directions = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'UP': 'UP',
        'DOWN': 'DOWN',
        'LEFT': 'LEFT',
        'RIGHT': 'RIGHT'
    };

    if (directions[input]) {
        direction = directions[input];
    }
}

function moveSnake() {
    const head = { ...snake[0] };
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        if (soundEnabled) eatSound.play();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function draw() {
    board.innerHTML = '';

    snake.forEach((segment, index) => {
        if (index === 0) {
            createImageElement('snake-head', segment, 'assets/snake_pix.png');
        } else {
            createElement('snake', segment);
        }
    });

    if (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
        food = generateFood();
    }
    createImageElement('food', food, 'assets/food.png');
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

    if (soundEnabled) {
        gameOverSound.play();
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    const form = document.getElementById("submitScoreForm");

    form.onsubmit = async function (e) {
        e.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const leaderboardName = document.getElementById("leaderboardName").value.trim();
        const playerEmail = document.getElementById("playerEmail").value.trim();
        const consentCheckbox = document.getElementById("consentCheckbox").checked;
        const score = finalScore;

        if (!fullName || !leaderboardName || score <= 0 || !consentCheckbox) {
            alert("Please fill in all required fields, earn a score, and consent to enter the competition!");
            return;
        }

        try {
            const response = await fetch("https://snek-api-huhkdfbbcrbwcvhf.australiaeast-01.azurewebsites.net/api/submitScore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: fullName,
                    leaderboardName: leaderboardName,
                    playerEmail: playerEmail,
                    score: score,
                    consentCheckbox: consentCheckbox,
                    createdAt: new Date().toISOString() // Send as ISO string
                }),
            });

            if (response.ok) {
                alert("Score submitted!");
                loadLeaderboard(); // refresh with latest data
            } else {
                const errorText = await response.text();
                console.error("Azure Function submission error:", response.status, errorText);
                alert("Error submitting score! " + errorText);
            }
        } catch (err) {
            console.error("Network or other submission error:", err);
            alert("Error submitting score!");
        }
    };
}

document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("game-over-screen").style.display = "none";
    resetGame();
    startGame();
});

async function loadLeaderboard() {
    try {
        const q = window.firebase.query(
            window.firebase.scoresRef,
            window.firebase.orderBy("score", "desc"),
            window.firebase.limit(10)
        );

        const snapshot = await window.firebase.getDocs(q);

        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = "";

        let rank = 1;
        snapshot.forEach(doc => {
            const entry = doc.data();
            const nameColor = rank <= 3 ? 'style="color: orange;"' : '';
            leaderboardElement.innerHTML += `
                <tr>
                    <td>${rank++}</td>
                    <td ${nameColor}>${entry.name.toUpperCase()}</td>
                    <td>${entry.score}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadLeaderboard();

    // Prevent spacebar from scrolling the page
    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.keyCode === 32) {
            e.preventDefault();
        }
    });

    splashScreen.addEventListener("click", () => {
        if (!gameRunning) startGame();
    });

    document.querySelectorAll(".mobile-controls .arrow").forEach(button => {
        button.addEventListener("click", () => {
            const direction = button.getAttribute("data-direction");
            setDirection(direction);
        });
    });

    document.getElementById("toggle-sound").addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        const btn = document.getElementById("toggle-sound");
        btn.textContent = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";

        if (!soundEnabled) {
            bgMusic.pause();
        } else if (gameRunning) {
            bgMusic.play();
        }
    });

    // Swipe Controls for Mobile
    let touchStartX = 0;
    let touchStartY = 0;

    const gameBoard = document.getElementById("game-board");

    gameBoard.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });

    gameBoard.addEventListener("touchmove", (e) => {
        e.preventDefault();
    }, { passive: false });

    gameBoard.addEventListener("touchend", (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 20) setDirection("RIGHT");
            else if (deltaX < -20) setDirection("LEFT");
        } else {
            if (deltaY > 20) setDirection("DOWN");
            else if (deltaY < -20) setDirection("UP");
        }
    }, { passive: false });
});