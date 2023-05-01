"use strict";

function matrixDot (A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
        })
    })
}

var now = [0, 0];
var thn = [0, 0];
var draggingL = false;
var draggingT = false;
var draggingS = false;
var draggingP = false;
var draggingC = false;

var line = {
    "x": 400,
    "y": 100,
    "length": 100,
    "width": 10,
    "theta": 0,
    "scale": 1,
    "points": [],
    "color": "orange",
    "mouse": false
};

var triangle = {
    "x": 100,
    "y": 400,
    "r": 100,
    "theta": 0,
    "scale": 1,
    "color": "yellow",
    "mouse": false
};

var rectangle = {
    "x": 250,
    "y": 250,
    "r": 50,
    "theta": 0,
    "scale": 1,
    "points": [],
    "color": "red",
    "mouse": false
};

var circle = {
    "x": 400,
    "y": 400,
    "xRadius": 50,
    "yRadius": 50,
    "rotation": 0,
    "scale": 1,
    "arcStart": 0,
    "arcEnd": 2*Math.PI,
    "color": "blue",
    "mouse": false
};

var polygon = {
    "x": 100,
    "y": 100,
    "dimensions": [30, 20, 70, 40],
    "theta": 0,
    "scale": 1,
    "points": [],
    "color": "pink",
    "mouse": false
};

var mouse = {
    "isDown": false,
    "isUp": true,
    "x": 0,
    "y": 0,
    "offset": [0, 0],
    "diff": [0, 0]
};

var canvas = document.getElementById("canvas");
if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
}

canvas.addEventListener("mousemove", function(e) { 
    var cRect = canvas.getBoundingClientRect();
    mouse.x = Math.round(e.clientX - cRect.left);
    mouse.y = Math.round(e.clientY - cRect.top);
});

canvas.addEventListener("mousedown", function() {
    mouse.isDown = true;
    mouse.isUp = false;
});

canvas.addEventListener("mouseup", function() {
    mouse.isDown = false;
    mouse.isUp = true;
});

function rotMatrix(theta) {
    var rotMat = [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)]
    ];
    return rotMat;
}

function scaleMatrix(scale) {
    var scaleMat = [
        [scale, 0],
        [0, scale]
    ];
    return scaleMat;
}

function movement() {
    now = [mouse.x, mouse.y];
    
    mouse.offset.x = now[0] - thn[0];
    mouse.offset.y = now[1] - thn[1];

    thn = now;
}

function drag() {
    if (line.mouse && mouse.isDown && !draggingT && !draggingS && !draggingP && !draggingC) {
        draggingL = true;

        line.x += mouse.offset.x;
        line.y += mouse.offset.y;
    } else if (triangle.mouse && mouse.isDown && !draggingS && !draggingP && !draggingC) {
        draggingT = true;

        triangle.x += mouse.offset.x;
        triangle.y += mouse.offset.y;
    } else if (rectangle.mouse && mouse.isDown && !draggingP && !draggingC) {
        draggingS = true;

        rectangle.x += mouse.offset.x;
        rectangle.y += mouse.offset.y;
    } else if (polygon.mouse && mouse.isDown && !draggingC) {
        draggingP = true;

        polygon.x += mouse.offset.x;
        polygon.y += mouse.offset.y;
    } else if (circle.mouse && mouse.isDown) {
        draggingC = true;

        circle.x += mouse.offset.x;
        circle.y += mouse.offset.y;
    } else {
        draggingL = false;
        draggingT = false;
        draggingS = false;
        draggingP = false;
        draggingC = false;
    }
}

document.addEventListener("keydown", function(event) {
    var deg = 3 * Math.PI / 180;
    var k = event.key;
    if (k == "q" && line.mouse) {
        line.theta = line.theta - deg;
    } else if (k == "w" && line.mouse) {
        line.theta = line.theta + deg;
    } else if (k == "q" && triangle.mouse) {
        triangle.theta = triangle.theta - deg;
    } else if (k == "w" && triangle.mouse) {
        triangle.theta = triangle.theta + deg;
    } else if (k == "q" && rectangle.mouse) {
        rectangle.theta = rectangle.theta - deg;
    } else if (k == "w" && rectangle.mouse) {
        rectangle.theta = rectangle.theta + deg;
    } else if (k == "q" && polygon.mouse) {
        polygon.theta = polygon.theta - deg;
    } else if (k == "w" && polygon.mouse) {
        polygon.theta = polygon.theta + deg;
    }

    if (k == "a" && line.mouse) {
        line.scale = line.scale - 0.1;
    } else if (k == "s" && line.mouse) {
        line.scale = line.scale + 0.1;
    } else if (k == "a" && triangle.mouse) {
        triangle.scale = triangle.scale - 0.1;
    } else if (k == "s" && triangle.mouse) {
        triangle.scale = triangle.scale + 0.1;
    } else if (k == "a" && rectangle.mouse) {
        rectangle.scale = rectangle.scale - 0.1;
    } else if (k == "s" && rectangle.mouse) {
        rectangle.scale = rectangle.scale + 0.1;
    } else if (k == "a" && polygon.mouse) {
        polygon.scale = polygon.scale - 0.1;
    } else if (k == "s" && polygon.mouse) {
        polygon.scale = polygon.scale + 0.1;
    } else if (k == "a" && circle.mouse) {
        circle.xRadius = circle.xRadius - 1;
        circle.yRadius = circle.yRadius - 1;
    } else if (k == "s" && circle.mouse) {
        circle.xRadius = circle.xRadius + 1;
        circle.yRadius = circle.yRadius + 1;
    } 


});

function drawLine() {
    var canvas = document.getElementById('canvas');
    var theta = line.theta;
    var scale = line.scale;

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        var rotMat = rotMatrix(theta);
        var sMat = scaleMatrix(scale);

        var p1 = [[-line.length/2], [0]];
        var p2 = [[line.length/2], [0]];

        var pr1 = matrixDot(rotMat, p1);
        var pr2 = matrixDot(rotMat, p2);

        pr1 = matrixDot(sMat, pr1);
        pr2 = matrixDot(sMat, pr2);

        line.points = [
            [Math.round(pr1[0]) + line.x, Math.round(pr1[1]) + line.y],
            [Math.round(pr2[0]) + line.x, Math.round(pr2[1]) + line.y]
        ];

        context.lineWidth = line.width;
        context.beginPath();
        context.moveTo(line.points[0][0], line.points[0][1]);
        context.lineTo(line.points[1][0], line.points[1][1]);
        context.closePath();
        context.strokeStyle = line.color;
        context.stroke();
    }
}

function drawTriangle() {
    var canvas = document.getElementById('canvas');
    var theta = triangle.theta;
    var scale = triangle.scale;

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        var rotMat = rotMatrix(theta);
        var sMat = scaleMatrix(scale);

        var p1 = [[0], [-Math.sqrt(3) * triangle.r / 3]];
        var p2 = [[-triangle.r / 2], [Math.sqrt(3) * triangle.r / 6]];
        var p3 = [[triangle.r / 2], [Math.sqrt(3) * triangle.r / 6]];

        var pr1 = matrixDot(rotMat, p1);
        var pr2 = matrixDot(rotMat, p2);
        var pr3 = matrixDot(rotMat, p3);

        pr1 = matrixDot(sMat, pr1);
        pr2 = matrixDot(sMat, pr2);
        pr3 = matrixDot(sMat, pr3);

        triangle.points = [
            [Math.round(pr1[0]) + triangle.x, Math.round(pr1[1]) + triangle.y],
            [Math.round(pr2[0]) + triangle.x, Math.round(pr2[1]) + triangle.y],
            [Math.round(pr3[0]) + triangle.x, Math.round(pr3[1]) + triangle.y]
        ];

        context.beginPath();
        context.lineTo(triangle.points[0][0], triangle.points[0][1]);
        context.lineTo(triangle.points[1][0], triangle.points[1][1]);
        context.lineTo(triangle.points[2][0], triangle.points[2][1]);
        context.closePath();
        context.fillStyle = triangle.color;
        context.fill();
    }
}

function drawSquare() {
    var canvas = document.getElementById('canvas');
    var theta = rectangle.theta;
    var scale = rectangle.scale;

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        var rotMat = rotMatrix(theta);
        var sMat = scaleMatrix(scale);

        var p1 = [[rectangle.r/2], [rectangle.r]];
        var p2 = [[rectangle.r/2], [-rectangle.r]];
        var p3 = [[-rectangle.r/2], [-rectangle.r]];
        var p4 = [[-rectangle.r/2], [rectangle.r]];

        var pr1 = matrixDot(rotMat, p1);
        var pr2 = matrixDot(rotMat, p2);
        var pr3 = matrixDot(rotMat, p3);
        var pr4 = matrixDot(rotMat, p4);

        pr1 = matrixDot(sMat, pr1);
        pr2 = matrixDot(sMat, pr2);
        pr3 = matrixDot(sMat, pr3);
        pr4 = matrixDot(sMat, pr4);

        rectangle.points = [
            [Math.round(pr1[0]) + rectangle.x, Math.round(pr1[1]) + rectangle.y],
            [Math.round(pr2[0]) + rectangle.x, Math.round(pr2[1]) + rectangle.y],
            [Math.round(pr3[0]) + rectangle.x, Math.round(pr3[1]) + rectangle.y],
            [Math.round(pr4[0]) + rectangle.x, Math.round(pr4[1]) + rectangle.y]
        ];

        context.beginPath();
        context.moveTo(rectangle.points[0][0], rectangle.points[0][1]);
        context.lineTo(rectangle.points[1][0], rectangle.points[1][1]);
        context.lineTo(rectangle.points[2][0], rectangle.points[2][1]);
        context.lineTo(rectangle.points[3][0], rectangle.points[3][1]);
        context.closePath();
        context.fillStyle = rectangle.color;
        context.fill();
    }
}

function drawPoly() {
    var canvas = document.getElementById('canvas');
    var theta = polygon.theta;
    var scale = polygon.scale;

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        var rotMat = rotMatrix(theta);
        var sMat = scaleMatrix(scale);

        var p1 = [[polygon.dimensions[2]], [polygon.dimensions[3]]];
        var p2 = [[-polygon.dimensions[2]], [polygon.dimensions[3]]];
        var p3 = [[-polygon.dimensions[0]], [-polygon.dimensions[1]]];
        var p4 = [[polygon.dimensions[0]], [-polygon.dimensions[1]]];

        var pr1 = matrixDot(rotMat, p1);
        var pr2 = matrixDot(rotMat, p2);
        var pr3 = matrixDot(rotMat, p3);
        var pr4 = matrixDot(rotMat, p4);

        pr1 = matrixDot(sMat, pr1);
        pr2 = matrixDot(sMat, pr2);
        pr3 = matrixDot(sMat, pr3);
        pr4 = matrixDot(sMat, pr4);

        polygon.points = [
            [Math.round(pr1[0]) + polygon.x, Math.round(pr1[1]) + polygon.y],
            [Math.round(pr2[0]) + polygon.x, Math.round(pr2[1]) + polygon.y],
            [Math.round(pr3[0]) + polygon.x, Math.round(pr3[1]) + polygon.y],
            [Math.round(pr4[0]) + polygon.x, Math.round(pr4[1]) + polygon.y]
        ];

        context.beginPath();
        context.moveTo(polygon.points[0][0], polygon.points[0][1]);
        context.lineTo(polygon.points[1][0], polygon.points[1][1]);
        context.lineTo(polygon.points[2][0], polygon.points[2][1]);
        context.lineTo(polygon.points[3][0], polygon.points[3][1]);
        context.closePath();
        context.fillStyle = polygon.color;
        context.fill();
    }
}

function drawCircle() {
    var canvas = document.getElementById('canvas');
    var scale = circle.scale;

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        
        context.beginPath();
        context.ellipse(
            circle.x,
            circle.y,
            circle.xRadius * scale,
            circle.yRadius * scale,
            circle.rotation,
            circle.arcStart,
            circle.arcEnd
        )
        context.closePath();
        context.fillStyle = circle.color;
        context.fill();
    }
}

function background() {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var context = canvas.getContext('2d');

        context.beginPath();
        context.rect(0, 0, 512, 512);
        context.fillStyle = "white";
        context.fill();
    }
}

function mouseCheck() {
    var lineArr = line.points;
    var d1 = Math.sqrt((mouse.x - lineArr[0][0])**2 +
                        (mouse.y - lineArr[0][1])**2);
    var d2 = Math.sqrt((mouse.x - lineArr[1][0])**2 +
                        (mouse.y - lineArr[1][1])**2);
    var buffer = 0.2 * line.width;
    if (d1 + d2 >= line.length - buffer && d1 + d2 <= line.length + buffer) {
        line.mouse = true;
    } else {
        if (draggingL) {
            line.mouse = true;
        } else {
            line.color = "orange";
            line.mouse = false;
        }
    }
    var triangleArr = triangle.points;
    if (checkPoly(triangleArr)) {
        triangle.mouse = true;
    } else {
        if (draggingT) {
            triangle.mouse = true;
        } else {
            triangle.color = "yellow";
            triangle.mouse = false;
        }
    }
    //detect if the mouse is on the square
    var squareArr = rectangle.points;
    if (checkPoly(squareArr)) {
        rectangle.mouse = true;
    } else {
        if (draggingS) {
            rectangle.mouse = true;
        } else {
            rectangle.color = "red";
            rectangle.mouse = false;
        }
    }
    var polArr = polygon.points;
    if (checkPoly(polArr)) {
        polygon.mouse = true;
    } else {
        if (draggingP) {
            polygon.mouse = true;
        } else {
            polygon.color = "pink";
            polygon.mouse = false;
        }
    }
    var x0 = circle.x - circle.xRadius;
    var x1 = circle.x + circle.xRadius;
    var y0 = circle.y - circle.yRadius;
    var y1 = circle.y + circle.yRadius;
    var mX = 0.5 * (x0 + x1);
    var mY = 0.5 * (y0 + y1);
    var oX = 0.5 * Math.abs(-x0 + x1);
    var oY = 0.5 * Math.abs(-y0 + y1);
    var collisionEq = ((mouse.x - mX)**2 / oX**2) + ((mouse.y - mY)**2 / oY**2)
    if (collisionEq < 1) {
        circle.mouse = true;
    } else {
        if (draggingC) {
            circle.mouse = true;
        } else {
            circle.mouse = false;
        }
    }
}

function checkPoly(polArr) {
    var polyTouch = false;
    var next = 0;
    var len = polArr.length;
    for (var i = 0; i < len; i++) {
        next =  i + 1;
        if (next == len) {
            next = 0;
        }
        var vc = polArr[i];
        var vn = polArr[next];
        if (((vc[1] >= mouse.y && vn[1]  <  mouse.y) || (vc[1] < mouse.y && vn[1] >= mouse.y)) &&
        (mouse.x < (vn[0] - vc[0]) * (mouse.y - vc[1]) / (vn[1] - vc[1]) + vc[0])) {
            polyTouch = !polyTouch;
        }
    }
    return polyTouch;
}
function draw() {
    drawCircle();
    drawPoly();
    drawSquare();
    drawTriangle();
    drawLine();
}

window.onload = async function() {
    while (true) {
        background();
        draw();
        mouseCheck();
        drag();
        movement();
        await new Promise(r => setTimeout(r, 1));
    }
}