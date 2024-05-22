const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const brushInput = document.getElementById('brush-input');
const colorPicker = document.getElementById('color-picker');
const penSize = document.getElementById('pen-size');
const brushSizeSlider = document.getElementById('brush-size-slider'); // Changed brush size input to a slider
const eraserBtn = document.getElementById('eraser-btn');
const penBtn = document.getElementById('pen-btn');
const brushToggle = document.getElementById('brush-toggle');
const xSlider = document.getElementById('x-slider');
const ySlider = document.getElementById('y-slider');
const widthSlider = document.getElementById('width-slider');
const heightSlider = document.getElementById('height-slider');
const bgColorPicker = document.getElementById('bg-color-picker');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let penColor = '#FFFFFF'; // Default pen color is white
colorPicker.value = penColor; // Reflect default pen color in color picker
let penWidth = penSize.value;
let isErasing = false;
let imageX = 0;
let imageY = 0;
let img;
let imgWidth = 0;
let imgHeight = 0;
let brush;
let brushWidth = 20;
let brushHeight = 20;
let brushEnabled = true;
let brushSize = 20; // Default brush size

let undoStack = [];
let redoStack = [];

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 150;


canvas.style.backgroundColor = '#000000';
bgColorPicker.value = '#000000';

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = penColor;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];

    if (brushEnabled) {
        drawBrush(e.offsetX, e.offsetY);
    }
}

function drawBrush(x, y) {
    if (!brush) return;

    ctx.drawImage(brush, x - brushWidth / 2, y - brushHeight / 2, brushWidth, brushHeight);
}

function endDrawing() {
    isDrawing = false;
    saveSnapshot();
}

function saveSnapshot() {
    undoStack.push(canvas.toDataURL());
    redoStack = [];
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const lastState = new Image();
        lastState.src = undoStack[undoStack.length - 1];
        lastState.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(lastState, 0, 0);
        }
    }
}

function redo() {
    if (redoStack.length > 0) {
        const nextState = new Image();
        nextState.src = redoStack.pop();
        nextState.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(nextState, 0, 0);
            undoStack.push(canvas.toDataURL());
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        img = new Image();
        img.onload = function () {
            imgWidth = widthSlider.value;
            imgHeight = heightSlider.value;
            redrawImage();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

function handleBrushSelect(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        brush = new Image();
        brush.onload = function () {
            // Resize the brush to the desired size
            brushWidth = brushSize; // Set brush width to brush size
            brushHeight = brushSize; // Set brush height to brush size
        }
        brush.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

function changePenColor() {
    penColor = colorPicker.value;
}

function changePenSize() {
    penWidth = penSize.value;
}

function changeBrushSize() {
    brushSize = brushSizeSlider.value;
    brushWidth = brushSize; 
    brushHeight = brushSize;
}

function toggleEraser() {
    isErasing = !isErasing;
}

function toggleBrush() {
    brushEnabled = !brushEnabled;
    if (brushEnabled) {
        penBtn.disabled = true;
    } else {
        penBtn.disabled = false; 
    }
}

function moveImage() {
    imageX = xSlider.value * (canvas.width / 100);
    imageY = ySlider.value * (canvas.height / 100);
    redrawImage();
}

function resizeImage() {
    imgWidth = widthSlider.value;
    imgHeight = heightSlider.value;
    redrawImage();
}

function changeBackgroundColor() {
    canvas.style.backgroundColor = bgColorPicker.value;
}

function redrawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) {
        ctx.drawImage(img, imageX, imageY, imgWidth, imgHeight);
    }
    saveSnapshot();
}

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'z') {
        undo();
    } else if (event.ctrlKey && event.key === 'y') {
        redo();
    }
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing);
fileInput.addEventListener('change', handleFileSelect);
brushInput.addEventListener('change', handleBrushSelect);
colorPicker.addEventListener('input', changePenColor);
penSize.addEventListener('input', changePenSize);
eraserBtn.addEventListener('click', toggleEraser);
penBtn.addEventListener('click', toggleBrush);
brushToggle.addEventListener('change', toggleBrush);
xSlider.addEventListener('input', moveImage);
ySlider.addEventListener('input', moveImage);
widthSlider.addEventListener('input', resizeImage);
heightSlider.addEventListener('input', resizeImage);
bgColorPicker.addEventListener('input', changeBackgroundColor);
brushSizeSlider.addEventListener('input', changeBrushSize); // Added event listener for brush size slider
