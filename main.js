const canvas = document.querySelector("canvas");
const playButton = document.getElementById("playButton");
const ctx = canvas.getContext("2d");

const resolution = 40;

const COLS = Math.floor(window.innerWidth / resolution);
const ROWS = Math.floor(window.innerHeight / resolution) - 1;


canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

let grid = new Array(COLS).fill(null).map(() => new Array(ROWS).fill(0));

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
  return nextGrid;
}

playButton.addEventListener("click", function(){
  grid = play(grid);
  render();
});

canvas.addEventListener("click", (e) => {
  var gridX = Math.floor(e.clientX / resolution);
  var gridY = Math.floor(e.clientY / resolution)-1;
  grid[gridX][gridY] = + !grid[gridX][gridY];
  render();
});
