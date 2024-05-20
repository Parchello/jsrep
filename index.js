const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
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
];

let board = [];
const rows = 20;
const cols = 10;
let score = 0;
scoreText.innerText = score;

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
  for (let row = rows - 1; row >= 0; row--) {
    if (board[row].every((cell) => cell)) {
      board.splice(row, 1);
      board.unshift(new Array(cols).fill(0));
      row++;
      score += 10;
      scoreText.innerText = score;
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

function gameLoop() {
  moveTetromino(0, 1);
  setTimeout(gameLoop, 1000);
}

drawBoard();
gameLoop();
