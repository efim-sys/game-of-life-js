const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speedSlider");

let useNet = true;

const rect = canvas.getBoundingClientRect();

let speed = speedSlider.value;
let mousedown = false;
let swappedPixels = new Array();

let isStarted = false;

let resolution = 40;
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


async function utob(uint8Array) {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(uint8Array);
  writer.close();
  const compressedArray = await new Response(cs.readable).arrayBuffer();
  return btoa(String.fromCharCode.apply(null, new Uint8Array(compressedArray)));
}

async function btou(base64) {
  const compressedArray = new Uint8Array(atob(base64).split('').map(char => char.charCodeAt(0)));
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(compressedArray);
  writer.close();
  const decompressedArray = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(decompressedArray);
}


let COLS = Math.floor((window.innerWidth - rect.left) / resolution);
let ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;

canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

let gridH = 250
let gridW = 120
let gridBuffer = new Uint8Array(Math.floor((gridH * gridW + 7) >>> 3));

class Grid {
  constructor(buffer) {
    this.length = gridH;
    this.buffer = buffer;
  }
  get(x, y) {
    const idx = x * gridH + y;
    return + ((this.buffer[idx >>> 3] & (1 << (idx & 7))) !== 0);
  }
  set(x, y, value) {
    const idx = x * gridH + y;
    if (value) {
      this.buffer[idx >>> 3] |= 1 << (idx & 7);
    } else {
      this.buffer[idx >>> 3] &= ~(1 << (idx & 7));
    }
  }
  map(callback) {
    const result = [];
    for (let i = 0; i < gridW; i++) {
      result[i] = [];
      for (let j = 0; j < gridH; j++) {
        result[i][j] = callback(this.get(i, j), i, j, this);
      }
    }
    return result;
  }
  clone() {
    return new Grid(this.buffer.slice())
  }
  forEach(callback) {
    for (let i = 0; i < gridW; i++) {
      for (let j = 0; j < gridH; j++) {
        callback(this.get(i, j), i, j, this);
      }
    }
  }
  length
};
let grid = new Grid(gridBuffer);
// let grid = new Array(gridH).fill(null).map(() => new Uint8Array(gridW).fill(0));


function spawnObject(data) {
  for(let i = 0; i < data.length; i++) {
    for(let j = 0; j < data[i].length; j++){
      grid.set(i, j, data[i][j]);
    }
  }
}

let pause = false;

render();

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y = 0; y < COLS; y++) {
    for(let x = 0; x < ROWS; x++) {
      const cell = grid.get(y, x);

      ctx.beginPath();
      ctx.fillStyle = "#b5ff00";
      if(cell) ctx.fillRect(y * resolution, x * resolution, resolution, resolution);
      if(useNet) ctx.strokeStyle = "#1a1a1a";
      else ctx.strokeStyle = "black";
      ctx.rect(y * resolution, x * resolution, resolution, resolution);
      ctx.stroke();
	  mouseEventGrid = grid;
    }
  }

}

async function gridButton() {
  if(!pause) {
    pause = true;
    if(isStarted) {
      clearInterval(timerID);
      isStarted = false;
    }
  }
  let s = document.getElementById("gridData").value;
  grid = new Grid(await btou(s));
  await render();
} 

function play(nextGrid) {
  var grid = nextGrid.clone();

  for(let x = 0; x < COLS; x++) {
    for(let y = 0; y < ROWS; y++) {
      let around = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          let x_cell = x + i;
          let y_cell = y + j;
          if(x_cell < 0) x_cell = COLS - 1;
          if(x_cell >= COLS) x_cell = 0;
          /*
          if(y_cell < 1) y_cell = ROWS;
          if(y_cell >= ROWS) y_cell = 0;
          */
          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            around += grid.get(x_cell, y_cell);
          }
        }
      }

      if (grid.get(x, y) === 1 && around < 2) {
        nextGrid.set(x, y, 0);
      } else if (grid.get(x, y) === 1 && around > 3) {
        nextGrid.set(x, y, 0);
      } else if (grid.get(x, y) === 0 && around === 3) {
        nextGrid.set(x, y, 1);
      }

    }
  }
}

let timerID;

function playGame() {
  if(!isStarted) {
    isStarted = true
    timerID = setInterval(async function(){
      play(grid);
      await render();
    }, 100 / speed);
  }
}

function pauseGame() {
  if(isStarted) {
    clearInterval(timerID);
    isStarted = false;
  }
  utob(grid.buffer).then(s => document.getElementById("gridData").value = s);
}

async function clearGrid() {
  grid = new Grid(new Uint8Array(Math.floor((gridH * gridW + 7) >>> 3)));
  await render();
}
async function zoomIn() {
  resolution += 1;
  COLS = Math.floor((window.innerWidth - rect.left) / resolution);
  ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;
  await render();
}

async function zoomOut() {
  if (resolution >= 7) resolution -= 1;
  COLS = Math.floor((window.innerWidth - rect.left) / resolution);
  ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;
  await render();
}

function changeSpeed() {
  speed = speedSlider.value;
  pauseGame();
  playGame();
}
async function randomiseGrid(){
	crypto.getRandomValues(grid.buffer)
	await render()
}
async function swapPixels(x, y){
		grid.set(x, y, + !grid.get(x, y));
}

canvas.addEventListener("mousedown", async (e) => {
	mousedown = true;
	let gridX = Math.floor((e.clientX - rect.left) / resolution);
	let gridY = Math.floor((e.clientY - rect.top) / resolution);
	let pix = gridX.toString() + " " + gridY.toString();
	if(swappedPixels.indexOf(pix) === -1){
		swappedPixels.push(pix);
		await swapPixels(gridX, gridY);
		await render();
	}
	
});
canvas.addEventListener("mouseup", async (e) =>{
	mousedown = false;
	swappedPixels = [];
	await render();
})
canvas.addEventListener("mousemove", async (e) =>{
	if(mousedown){
		  let gridX = Math.floor((e.clientX - rect.left) / resolution);
		  let gridY = Math.floor((e.clientY - rect.top) / resolution);
		  let pix = gridX.toString() + " " + gridY.toString();
		  if(swappedPixels.indexOf(pix) === -1){
				swappedPixels.push(pix);
				await swapPixels(gridX, gridY);
				await render();
			}
	}
})

