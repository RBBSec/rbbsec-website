document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const box = 20;
  const initialSpeed = 150; // Slower snake (easier!)
  let snake, direction, food, score;
  let gameRunning = false;
  let gameLoop;

  drawSplashScreen();

  document.addEventListener("keydown", handleKeyPress);

  function handleKeyPress(e) {
    if (!gameRunning && e.code === "Space") {
      startGame();
      return;
    }

    if (!gameRunning) return;

    const key = e.keyCode;
    if (key === 37 && direction !== "RIGHT") direction = "LEFT";
    if (key === 38 && direction !== "DOWN") direction = "UP";
    if (key === 39 && direction !== "LEFT") direction = "RIGHT";
    if (key === 40 && direction !== "UP") direction = "DOWN";
  }

  function drawSplashScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🐍 Snek Game", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "18px Arial";
    ctx.fillText("Press SPACE to start", canvas.width / 2, canvas.height / 2);
  }

  function startGame() {
    gameRunning = true;
    direction = "RIGHT";
    score = 0;
    snake = [
      { x: 6 * box, y: 10 * box }, // smaller, more centered snake
      { x: 5 * box, y: 10 * box },
    ];
    food = randomFoodPosition();

    if (gameLoop) clearInterval(gameLoop);
    setTimeout(() => {
      gameLoop = setInterval(drawGame, initialSpeed);
    }, 400); // Delay start for smoother beginning
  }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.font = "20px Arial";
    ctx.textAlign = "left"; // So it aligns better
    ctx.fillText("🧑‍💻", food.x, food.y + box);


    // Draw snake with rounded segments
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "black" : "red";
      drawRoundedRect(ctx, segment.x, segment.y, box, box, 5);
    });

    // Helper function for rounded rectangles
    function drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    }



    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    // Move snake
    let newHead = { x: snake[0].x, y: snake[0].y };

    if (direction === "LEFT") newHead.x -= box;
    if (direction === "UP") newHead.y -= box;
    if (direction === "RIGHT") newHead.x += box;
    if (direction === "DOWN") newHead.y += box;

    if (
      newHead.x < 0 || newHead.x >= canvas.width ||
      newHead.y < 0 || newHead.y >= canvas.height ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      endGame();
      return;
    }

    if (newHead.x === food.x && newHead.y === food.y) {
      score++;
      food = randomFoodPosition();
    } else {
      snake.pop();
    }

    snake.unshift(newHead);
  }

  function randomFoodPosition() {
    const padding = 1;
    const gridW = canvas.width / box;
    const gridH = canvas.height / box;
    return {
      x: Math.floor(Math.random() * (gridW - padding * 2) + padding) * box,
      y: Math.floor(Math.random() * (gridH - padding * 2) + padding) * box
    };
  }

  function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀 Game Over", canvas.width / 2, canvas.height / 2 - 80);
    ctx.font = "20px Arial";
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 - 40);

    // Show form instead of popup
    const form = document.getElementById("gameOverForm");
    form.style.display = "block";

    document.getElementById("submitScoreBtn").onclick = () => {
      const nickname = document.getElementById("nickname").value;
      const email = document.getElementById("email").value;

      if (nickname && email) {
        submitScore(nickname, email, score);
        form.style.display = "none";
        document.getElementById("nickname").value = "";
        document.getElementById("email").value = "";

        ctx.font = "16px Arial";
        ctx.fillText("Score submitted! Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 40);
      } else {
        alert("Please enter both nickname and email!");
      }
    };
  }
  function submitScore(nickname, email, score) {
    fetch("https://corsproxy.io/?https://script.google.com/macros/s/AKfycbx3Jh7SvgRRkUwS4OQHpfiXxMQGmaW_ho7DUwhHnliBzFqE6tXDq4slIZETyw-sF9AS2Q/exec", {
      method: "POST",
      body: JSON.stringify({ nickname, email, score }),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.text())
      .then(result => {
        console.log("Score submitted:", result);
        loadLeaderboard(); // refresh leaderboard after submission
      })
      .catch(error => console.error("Error submitting score:", error));
  }

  function loadLeaderboard() {
    fetch("https://corsproxy.io/?https://script.google.com/macros/s/AKfycbx3Jh7SvgRRkUwS4OQHpfiXxMQGmaW_ho7DUwhHnliBzFqE6tXDq4slIZETyw-sF9AS2Q/exec")
      .then(response => response.json())
      .then(data => {
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = data.slice(0, 10)
          .map(entry => `<li>${entry.nickname}: ${entry.score}</li>`)
          .join('');
      })
      .catch(error => console.error("Error loading leaderboard:", error));
  }

  // Load leaderboard initially when page loads
  loadLeaderboard();

});  