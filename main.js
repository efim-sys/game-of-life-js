const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 10;

const resolution = 40;
canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

var grid = new Array(COLS).fill(null).map(() => new Array(ROWS).fill(0));

grid[2][5] = 1;

render();

function render() {
  for(let y = 0; y < grid.length; y++) {
    for(let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];

      ctx.beginPath();
      if(cell) ctx.fillRect(y * resolution, x * resolution, resolution, resolution);
      ctx.rect(y * resolution, x * resolution, resolution, resolution);
      ctx.stroke();
    }
  }
}
