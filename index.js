const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const canvContainer = document.querySelector(".canv-container");
const enterContainer = document.querySelector(".entrance-container");
const grid = 32;
const tetrominoes = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1, 1],
    [0, 1],
  ], // T
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [0, 1, 1],
    [1, 1],
  ], // S
  [[1, 1, 1], [1]], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [1, 1, 1, 1],
    [0, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
  ],
  [[0, 0, 1], [1, 1, 1], [1]],
];

const gameCharacteristics = [
  "Повна шляпа",
  "Невдалець",
  "Середнього рівня",
  "Кращий за середній рівень",
  "Солідний гравець",
  "Досвідчений",
  "Майстер гри",
  "Кращий серед найкращих",
  "Винахідник стратегій",
  "Елітний гравець",
  "Майстер стратегії",
  "Геній гри",
  "Легенда гри",
  "Віртуоз гри",
  "Неодолимий",
  "Непереможний",
  "Владар гри",
  "Імператор гри",
  "Божество гри",
  "Абсолютний Бог Гри",
];

let leaderBoard = [];

enterContainer.style.display = "none";

let speed = 1000;
let speedLevel = 1;
const speedUpThreshold = 100;
let gameOver = false;
let gamePaused = false;

let board = [];
const rows = 20;
const cols = 10;
let score = 0;
scoreText.innerText = score;
levelText.innerText = speedLevel;
for (let row = 0; row < rows; row++) {
  board[row] = [];
  for (let col = 0; col < cols; col++) {
    board[row][col] = 0;
  }
}

let currentTetromino = {
  shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
  x: Math.floor(cols / 2) - 1,
  y: 0,
};

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col]) {
        context.fillStyle = "blue";
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }
  drawTetromino();
}

function drawTetromino() {
  currentTetromino.shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        let x = currentTetromino.x + colIndex;
        let y = currentTetromino.y + rowIndex;
        context.fillStyle = "orange";
        context.fillRect(x * grid, y * grid, grid - 1, grid - 1);
      }
    });
  });
}

function moveTetromino(dx, dy) {
  if (!collision(currentTetromino, dx, dy)) {
    currentTetromino.x += dx;
    currentTetromino.y += dy;
    drawBoard();
  } else if (dy === 1) {
    freezeTetromino();
    clearLines();
    if (currentTetromino.y === 0) {
      endGame();
      return;
    }
    resetTetromino();
    drawBoard();
  }
}

function collision(tetromino, dx, dy) {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let col = 0; col < tetromino.shape[row].length; col++) {
      if (tetromino.shape[row][col]) {
        let newX = tetromino.x + col + dx;
        let newY = tetromino.y + row + dy;

        if (
          newX < 0 ||
          newX >= cols ||
          newY >= rows ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function freezeTetromino() {
  currentTetromino.shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        let x = currentTetromino.x + colIndex;
        let y = currentTetromino.y + rowIndex;
        if (y >= 0) {
          board[y][x] = value;
        }
      }
    });
  });
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function clearLines() {
  let linesCleared = 0;

  for (let row = rows - 1; row >= 0; row--) {
    if (board[row].every((cell) => cell)) {
      board.splice(row, 1);
      board.unshift(new Array(cols).fill(0));
      linesCleared++;
      row++;
    }
  }

  if (linesCleared > 0) {
    const scoreMultipliers = [0, 10, 30, 50, 80];
    score += scoreMultipliers[linesCleared];
    scoreText.innerText = score;
    if (score >= speedUpThreshold * speedLevel) {
      speedLevel++;
      speed = speed -= 50;
      levelText.innerText = speedLevel;
      canvContainer.style.backgroundColor = getRandomColor();
      // generateFilledCells();
    }
  }
}

function resetTetromino() {
  currentTetromino = {
    shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
    x: Math.floor(cols / 2) - 1,
    y: 0,
  };
}

function rotateTetromino() {
  const rotatedShape = currentTetromino.shape[0].map((val, index) =>
    currentTetromino.shape.map((row) => row[index]).reverse()
  );

  const originalX = currentTetromino.x;
  const originalY = currentTetromino.y;

  let offset = 1;
  while (
    collision(
      { shape: rotatedShape, x: currentTetromino.x, y: currentTetromino.y },
      0,
      0
    )
  ) {
    currentTetromino.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > rotatedShape[0].length) {
      currentTetromino.x = originalX;
      currentTetromino.y = originalY;
      return;
    }
  }
  currentTetromino.shape = rotatedShape;
  drawBoard();
}

// function generateFilledCells() {
//   const numFilledCells = 3 + speedLevel;
//   // const maxRow = Math.floor((rows * 2) / 3) - 1;
//   clearBoard();

//   for (let i = 0; i < numFilledCells; i++) {
//     const randomRow = Math.floor(Math.random() * rows);
//     const randomCol = Math.floor(Math.random() * cols);
//     board[randomRow][randomCol] = 1;
//   }

//   drawBoard();
// }

function clearBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      board[row][col] = 0;
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveTetromino(-1, 0);
  if (event.key === "ArrowRight") moveTetromino(1, 0);
  if (event.key === "ArrowDown") moveTetromino(0, 1);
  if (event.key === "ArrowUp") rotateTetromino();
  if (event.key === " ") togglePause();
});

let endGameDisplayed = false;

function endGame() {
  gameOver = true;
  clearCanvas();
  drawEndGameMessage();
}

function clearCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawEndGameMessage() {
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = "30px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";

  const message =
    "Гру закінчено!\n Ваш рахунок: " +
    score +
    "\nВаш рівень: " +
    speedLevel +
    "\n" +
    gameCharacteristics[speedLevel - 1];

  const lines = message.split("\n");
  const lineHeight = 30;
  const startY = (canvas.height - lines.length * lineHeight) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });
}

function togglePause() {
  gamePaused = !gamePaused;
  const canvas = document.getElementById("gameCanvas");
  if (!gamePaused) {
    gameLoop();
  }
}

function gameLoop() {
  if (!gameOver && !gamePaused) {
    moveTetromino(0, 1);
    setTimeout(gameLoop, speed);
  }
}

drawBoard();
gameLoop();
