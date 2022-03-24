const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speedSlider");

let useNet = true;

const rect = canvas.getBoundingClientRect();

let speed = speedSlider.value;
let mousedown = false;
let swappedPixels = new Array();

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

let COLS = Math.floor((window.innerWidth - rect.left) / resolution);
let ROWS = Math.floor((window.innerHeight - rect.top) / resolution)-1;

canvas.width = resolution * COLS;
canvas.height = resolution * ROWS;

let gridH = 250
let gridW = 120
let grid = new Array(gridH).fill(null).map(() => new Array(gridW).fill(0));


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
	  mouseEventGrid = grid;
    }
  }
}


function play(grid) {
  const nextGrid = grid.map(arr => [...arr]);

  //if(grid[3][3]) console.log("3 3 is true");
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
  timerID = setInterval(async function(){
    grid = play(grid);
    await render();
  }, 100 / speed);
}

function pauseGame() {
  clearInterval(timerID);
}

async function clearGrid() {
  grid.forEach(element => element.fill(0));
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
	for (let i = 0; i < grid.length; i+=1){
		for (let j = 0; j < grid[i].length; j+=1){
			grid[i][j] = Math.floor(Math.random() * 2);
		}
	}
	await render()
}
async function swapPixels(x, y){
		grid[x][y] = + !grid[x][y];
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

function getGridData(){
  let res = ""

  grid.forEach((g) =>{
    res += + eval("0b" + g.join("")).toString(36).replace(/0000/g, "A").replace(/000/g, "B").replace(/00/g, "C") + "."
  })
  
  return res
}

let gridData = document.getElementById("gridData")
gridData.addEventListener("change", () => {
  grid = changeGrid(gridData.value)
})

function changeGrid(value = ""){
  value.split(":").forEach((v, i) =>{
    grid[i] = parseInt(v.replace(/A/g, "0000").replace(/B/g, "000").replace(/C/g, "00"), 36).toString().padStart(gridW, "0").split('').map(Number)
  })
}