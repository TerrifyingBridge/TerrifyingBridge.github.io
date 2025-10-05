let canvasWidth = 800;
let canvasHeight = 650;
let boxWidth = 750;
let boxHeight = 500;

let numPoints = 5;

let points = [];
let allPaths = [];
let optimalPath = [];
let userMap = new Map();
let userPath = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = 16;
        this.currentlyClicked = false;
        this.attactedLines = 0;
    }
    drawPoint() {
        const ctx = gameCanvas.context;
        if (this.currentlyClicked) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "black";
        }
        ctx.fillRect(this.x - this.length / 2, this.y - this.length / 2, this.length, this.length);
    }
    isClicked(mouseX, mouseY) {
        const rad = this.length / 2;
        if (mouseX >= this.x - rad && mouseX <= this.x + rad && mouseY >= this.y - rad && mouseY <= this.y + rad && this.attactedLines < 2) {
            this.changeClickStatus();
            return true;
        } else {
            return false;
        }
    }
    changeClickStatus() {
        if (this.currentlyClicked) {
            this.currentlyClicked = false;
        } else {
            this.currentlyClicked = true;
        }
    }
}

let gameCanvas = {
    //canvas: document.createElement("canvas"),
    canvas: document.getElementById("gameCanvas"),
    start: function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
    },
    drawBox() {
        const ctx = this.context;
        ctx.fillStyle = "black";
        ctx.fillRect(20, 20, boxWidth + 10, boxHeight + 10);
        ctx.fillStyle = "pink";
        ctx.fillRect(25, 25, boxWidth, boxHeight);
    },
    drawUI() {
        this.drawBox();
        const ctx = this.context;
        ctx.fillStyle = "black";
        ctx.fillRect(20, 25 + boxHeight + 10, 200, 75);
        ctx.fillRect(canvasWidth - 20 - 200, 25 + boxHeight + 10, 200, 75);
        ctx.fillRect(250, 25 + boxHeight + 10, canvasWidth - 500, 75);
        ctx.font = "35px Impact";
        ctx.fillStyle = "red";
        ctx.fillText("Reset Lines", 35, 85 + boxHeight);
        ctx.fillText("Reset Points", canvasWidth - 20 - 200 + 10, 85 + boxHeight);
        ctx.font = "25px Impact";
        ctx.fillText("Points", 365, 560);
        ctx.font = "30px Impact";
        ctx.fillText(numPoints, 390, 595);

        this.drawTriangle(325, 540, 325, 600, 270, 570);
        this.drawTriangle(480, 540, 480, 600, 530, 570);
    },
    drawLine(p1, p2, color, width) {
        const ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        drawPoints();
    },
    drawTriangle(x1, y1, x2, y2, x3, y3) {
        const ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fillStyle = "yellow";
        ctx.fill();
    },
    checkLineReset(mX, mY) {
        if (mX > 20 && mX < 20 + 200 && mY > 35 + boxHeight && mY < 110 + boxHeight) {
            this.drawUI();
            for (let i = 0; i < points.length; i++) {
                points[i].attactedLines = 0;
                points[i].currentlyClicked = false;
            }
            drawPoints();
        }
    },
    checkPointReset(mX, mY) {
        if (mX > canvasWidth - 20 - 200 && mX < canvasWidth - 20 && mY > 35 + boxHeight && mY < 110 + boxHeight) {
            this.drawUI();
            points = [];
            allPaths = [];
            optimalPath = [];
            userMap = new Map();
            userPath = [];
            generatePoints();
        }
    },
    checkPointCountReset(mX, mY) {
        if (mX >= 480 && mX <= 530 && mY >= 540 && mY <= 600) {
            numPoints += 1
            if (numPoints > 10) {
                numPoints = 10;
            }
            this.drawUI();
            points = [];
            allPaths = [];
            optimalPath = [];
            userMap = new Map();
            userPath = [];
            generatePoints();
        } else if (mX >= 270 && mX <= 325 && mY >= 540 && mY <= 600) {
            numPoints -= 1
            if (numPoints < 0) {
                numPoints = 0;
            }
            this.drawUI();
            points = [];
            allPaths = [];
            optimalPath = [];
            userMap = new Map();
            userPath = [];
            generatePoints();
        }
    }
}

function drawPoints() {
    for (let i = 0; i < points.length; i++) {
        points[i].drawPoint();
    }
}

function mouseInput(event) {
    const rect = gameCanvas.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    console.log(mouseX, mouseY);

    for (let i = 0; i < points.length; i++) {
        if (points[i].isClicked(mouseX, mouseY)) {
            console.log("Clicked Point");
            console.log(i);
        }
        points[i].drawPoint();
    }

    checkClickedPoints();
    gameCanvas.checkLineReset(mouseX, mouseY);
    gameCanvas.checkPointReset(mouseX, mouseY);
    gameCanvas.checkPointCountReset(mouseX, mouseY);

    if (checkEndGame()) {
        console.log("Game Over");
        let temp = findOptimalPath();
        console.log(allPaths[temp]);
        console.log(userMap);
        drawOptimalPath(allPaths[temp]);
        fillUserPath();
        console.log(userPath);
    }
}

function drawOptimalPath(path) {
    let p1 = points[path[path.length - 1]];
    let p2 = points[path[0]];
    gameCanvas.drawLine(p1, p2, "red", 5);
    for (let i = 0; i < path.length - 1; i++) {
        p1 = points[path[i]];
        p2 = points[path[i + 1]];
        gameCanvas.drawLine(p1, p2, "red", 5);
    }
}

function fillUserPath() {
    let currentKey = 0;
    while (!userPath.includes(currentKey)) {
        userPath.push(currentKey);
        let val1 = userMap.get(currentKey)[0];
        let val2 = userMap.get(currentKey)[1];
        if (!userPath.includes(val1)) {
            currentKey = val1;
        } else if (!userPath.includes(val2)) {
            currentKey = val2;
        }
    }
}

function checkClickedPoints() {
    let pointsClicked = 0;
    let tempPoints = []
    for (let i = 0; i < points.length; i++) {
        if (points[i].currentlyClicked) {
            pointsClicked++;
            tempPoints.push(i);
        }
    }

    if (pointsClicked == 2) {
        let p1 = tempPoints[0];
        let p2 = tempPoints[1];
        console.log(p1, p2);
        for (let i = 0; i < points.length; i++) {
            if (points[i].currentlyClicked) {
                points[i].changeClickStatus();
                points[i].attactedLines++;
            }
        }

        gameCanvas.drawLine(points[tempPoints[0]], points[tempPoints[1]], "blue", 10);

        userMap.get(p1).push(p2);
        userMap.get(p2).push(p1);
    }
}

function checkEndGame() {
    for (let i = 0; i < points.length; i++) {
        if (points[i].attactedLines < 2) {
            return false;
        }
    }
    return true;
}

function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
}

function permutation(result, array, index) {
    if (index == array.length) {
        result.push([...array]);
        return;
    }

    for (let i = index; i < array.length; i++) {
        swap(array, index, i);
        permutation(result, array, index+1);
        swap(array, index, i);
    }
}

function permute(array) {
    let result = []
    permutation(result, array, 0);
    return result;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

function calcPathDistance(path) {
    let p1 = points[path[path.length - 1]];
    let p2 = points[0];
    let dist = distance(p1.x, p1.y, p2.x, p2.y);
    for (let i = 0; i < path.length - 1; i++) {
        p1 = points[path[i]];
        p2 = points[path[i+1]];
        dist += distance(p1.x, p1.y, p2.x, p2.y);
    }
    return dist;
}

function findOptimalPath() {
    let minimumDist = 600 * 200;
    let index = -1;
    for (let i = 0; i < allPaths.length; i++) {
        let tempDist = calcPathDistance(allPaths[i]);
        if (tempDist < minimumDist) {
            minimumDist = tempDist;
            index = i;
        }
    }
    return index;
}

function generatePoints() {
    for (let i = 0; i < numPoints; i++) {
        let randX = Math.floor(Math.random() * (boxWidth - 20)) + 35;
        let randY = Math.floor(Math.random() * (boxHeight - 20)) + 35;
        let p = new Point(randX, randY);
        points.push(p);
        drawPoints();
    }

    const tempArray = [];
    for (let i = 0; i < numPoints; i++ ) {
        tempArray.push(i);
    }
    allPaths = permute(tempArray);
    
    for (let i = 0; i < numPoints; i++) {
        userMap.set(i, []);
    }
}

function run() {
    gameCanvas.start();
    gameCanvas.drawUI();

    generatePoints();

    gameCanvas.canvas.addEventListener("click", mouseInput);
}

window.onload = run;