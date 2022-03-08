const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speedSlider");

var useNet = true;

const rect = canvas.getBoundingClientRect();

var speed = speedSlider.value;

var resolution = 40;
const glider = [
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1]
];

const glider_factory = [
  [0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0]
];

var COLS = Math.floor((window.innerWidth - rect.left) / resolution);
var ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;

canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

let grid = new Array(310).fill(null).map(() => new Array(200).fill(0));

function spawnObject(data) {
  for(let i = 0; i < data.length; i++) {
    for(let j = 0; j < data[i].length; j++){
      grid[i][j] = data[i][j];
    }
  }
}

let pause = false;

render();

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y = 0; y < COLS; y++) {
    for(let x = 0; x < ROWS; x++) {
      const cell = grid[y][x];

      ctx.beginPath();
      ctx.fillStyle = "#b5ff00";
      if(cell) ctx.fillRect(y * resolution, x * resolution, resolution, resolution);
      if(useNet) ctx.strokeStyle = "#1a1a1a";
      else ctx.strokeStyle = "black";
      ctx.rect(y * resolution, x * resolution, resolution, resolution);
      ctx.stroke();
    }
  }
}


function play(grid) {
  const nextGrid = grid.map(arr => [...arr]);

  //if(grid[3][3]) console.log("3 3 is true");
  for(let x = 0; x < COLS; x++) {
    for(let y = 0; y < ROWS; y++) {
      var around = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          var x_cell = x + i;
          var y_cell = y + j;
          if(x_cell < 0) x_cell = COLS - 1;
          if(x_cell >= COLS) x_cell = 0;
          if(y_cell < 1) y_cell = ROWS;
          if(y_cell >= ROWS) y_cell = 0;
          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            around += grid[x_cell][y_cell];
          }
        }
      }

      if (grid[x][y] === 1 && around < 2) {
        nextGrid[x][y] = 0;
      } else if (grid[x][y] === 1 && around > 3) {
        nextGrid[x][y] = 0;
      } else if (grid[x][y] === 0 && around === 3) {
        nextGrid[x][y] = 1;
      }

    }
  }
  return nextGrid;
}

let timerID;

function playGame() {
  timerID = setInterval(function(){
    grid = play(grid);
    render();
  }, 100 / speed);
}

function pauseGame() {
  clearInterval(timerID);
}

function clearGrid() {
  grid.forEach(element => element.fill(0));
  render();
}
function zoomIn() {
  resolution += 1;
  COLS = Math.floor((window.innerWidth - rect.left) / resolution);
  ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;
  render();
}

function zoomOut() {
  if (resolution >= 7) resolution -= 1;
  COLS = Math.floor((window.innerWidth - rect.left) / resolution);
  ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;
  render();
}

function changeSpeed() {
  speed = speedSlider.value;
  pauseGame();
  playGame();
}


canvas.addEventListener("mousedown", (e) => {
  var gridX = Math.floor((e.clientX - rect.left) / resolution);
  var gridY = Math.floor((e.clientY - rect.top) / resolution);
  grid[gridX][gridY] = + !grid[gridX][gridY];
  render();
});
