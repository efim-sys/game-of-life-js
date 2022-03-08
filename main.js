const canvas = document.querySelector("canvas");
const playButton = document.getElementById("playButton");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 10;

const resolution = 40;
canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

let grid = new Array(COLS).fill(null).map(() => new Array(ROWS).fill(0));
let nextGrid = new Array(COLS).fill(null).map(() => new Array(ROWS).fill(0));

render();



function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y = 0; y < COLS; y++) {
    for(let x = 0; x < ROWS; x++) {
      const cell = grid[y][x];

      ctx.beginPath();
      if(cell) ctx.fillRect(y * resolution, x * resolution, resolution, resolution);
      ctx.rect(y * resolution, x * resolution, resolution, resolution);
      ctx.stroke();
    }
  }
}




function play() {
  console.log("play");
  console.log(grid);
  nextGrid = Object.assign({}, grid);
  //if(grid[3][3]) console.log("3 3 is true");
  for(let x = 0; x < COLS; x++) {
    for(let y = 0; y < ROWS; y++) {
      var around = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          const x_cell = x + i;
          const y_cell = y + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            const currentNeighbour = grid[x + i][y + j];
            around += currentNeighbour;
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
  console.log(grid);
  console.log(nextGrid);
  grid = Object.assign({}, nextGrid);
  render();
}

playButton.addEventListener("click", play);

canvas.addEventListener("click", (e) => {
  var gridX = Math.floor(e.clientX / resolution)-1;
  var gridY = Math.floor(e.clientY / resolution);
  grid[gridX][gridY] = + !grid[gridX][gridY];
  render();
});
