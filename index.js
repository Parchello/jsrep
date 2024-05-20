const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
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
    [0, 1, 1, 0],
  ],
];

let speed = 1000;
let speedLevel = 1;
const speedUpThreshold = 10;
let gameOver = false;

let board = [];
const rows = 20;
const cols = 10;
let score = 0;
let level = 1;
scoreText.innerText = score;
levelText.innerText = level;
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
        context.fillStyle = "cyan";
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
        context.fillStyle = "red";
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
    // Множники для різної кількості очищених ліній
    const scoreMultipliers = [0, 10, 30, 60, 100];
    score += scoreMultipliers[linesCleared];
    scoreText.innerText = score;
    if (score >= speedUpThreshold * speedLevel) {
      speedLevel++;
      speed = Math.max(100, speed - 100);
      level += 1;
      levelText.innerText = level;
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

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveTetromino(-1, 0);
  if (event.key === "ArrowRight") moveTetromino(1, 0);
  if (event.key === "ArrowDown") moveTetromino(0, 1);
  if (event.key === "ArrowUp") rotateTetromino();
});

function endGame() {
  gameOver = true;
  alert("Game Over! Your score: " + score);
}

function gameLoop() {
  if (!gameOver) {
    moveTetromino(0, 1);
    setTimeout(gameLoop, speed);
  }
}

drawBoard();
gameLoop();
