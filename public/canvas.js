let canvas = document.querySelector("canvas");
let pencilColorAll = document.querySelectorAll(".pencil-color");
let peniclWidthElem = document.querySelector("#pencil-width");
let eraserWidthElem = document.querySelector("#eraser-width");
let eraserCanvas = document.querySelector("#eraser");
let download = document.querySelector("#download");
let undo = document.querySelector("#undo");
let redo = document.querySelector("#redo");

let mouseDown = false;
let pencilColor = "red";
let pencilWidth = 3;
let eraserWidth = 3;
let eraserColor = "#010101";

let undoRedoTracker = []; // Data
let track = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// API
let tool = canvas.getContext("2d");
tool.strokeStyle = pencilColor;
tool.lineWidth = pencilWidth;

// mouse down -> start path , mousemove = path fill
canvas.addEventListener("mousemove", (e) => {
  if (mouseDown) {
    let data = {
      x: e.clientX,
      y: e.clientY,
      color: eraserFlag ? eraserColor : pencilColor,
      width: eraserFlag ? eraserWidth : pencilWidth,
    };
    socket.emit("drawStroke", data);
  }
});
canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;

  let data = {
    x: e.clientX,
    y: e.clientY,
  };
  socket.emit("beginPath", data);
});

canvas.addEventListener("mouseup", (e) => {
  mouseDown = false;

  let url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}
function drawStroke(strokeObj) {
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
  tool.strokeStyle = strokeObj.color;
  tool.lineWidth = strokeObj.width;
}
pencilColorAll.forEach((colorElem) => {
  colorElem.style.cursor = "pointer";
  colorElem.addEventListener("click", (e) => {
    let color = e.target.classList[0];
    pencilColor = color;
    tool.strokeStyle = pencilColor;
  });
});

peniclWidthElem.addEventListener("input", (e) => {
  pencilWidth = e.target.value;
  tool.lineWidth = pencilWidth;
});
eraserWidthElem.addEventListener("input", (e) => {
  eraserWidth = e.target.value;
  tool.lineWidth = eraserWidth;
});
eraserCanvas.addEventListener("click", (e) => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
  } else {
    tool.strokeStyle = pencilColor;
    tool.lineWidth = pencilWidth;
  }
});

download.addEventListener("click", (e) => {
  let url = canvas.toDataURL();
  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});

undo.addEventListener("click", (e) => {
  if (track > 0) track--;
  let data = {
    track,
    undoRedoTracker,
  };
  socket.emit("redoUndo", data);
});
redo.addEventListener("click", (e) => {
  if (track < undoRedoTracker.length - 1) track++;
  // action
  let data = {
    track,
    undoRedoTracker,
  };
  socket.emit("redoundo", data);
});
function undoRedoCanvas({ track, undoRedoTracker }) {
  track = track;
  let url = undoRedoTracker[track];
  let img = new Image(); // new Image
  img.src = url;
  img.onload = async (e) => {
    tool.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing the image
    await tool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

socket.on("beginPath", (data) => {
  // data -> data from server
  beginPath(data);
});
socket.on("drawStroke", (data) => {
  drawStroke(data);
});
socket.on("redoUndo", (data) => {
  undoRedoCanvas(data);
});
