"use strict";

var gl;
var points;
var NumPoints = 500;

//points slider
var pSlider = document.getElementById("pointValue");
var pointOutput = document.getElementById("pointValueDis");
pointOutput.innerHTML = pSlider.value;

pSlider.oninput = function() {
    pointOutput.innerHTML = this.value;
}

//size slider
var sSlider = document.getElementById("sizeSlider");
var sizeOutput = document.getElementById("sizeValue");
sizeOutput.innerHTML = sSlider.value;

sSlider.oninput = function() {
    sizeOutput.innerHTML = this.value;
}

//speed slider to adjust speed of wait function in ms
var msSlider = document.getElementById("speedSlider");
var speedOutput = document.getElementById("speedValue");
speedOutput.innerHTML = msSlider.value;

msSlider.oninput = function() {
    speedOutput.innerHTML = this.value;
}

var rValue;
var gValue;
var bValue;

//The values from the RGB text boxes
var rInVal = document.getElementById("redValue");
var gInVal = document.getElementById("greenValue")
var bInVal = document.getElementById("blueValue")

var vertex_shader = "attribute vec4 vPosition;" +
    "void main() {" +
    "gl_PointSize = 1.0;" +
    "gl_Position = vPosition;" +
    "}";

var clicked = false;

function toggle() {
    if (!clicked) {
        clicked = true;
        document.getElementById("rBtn").innerHTML = "On";
    } else {
        clicked = false;
        document.getElementById("rBtn").innerHTML = "Off";
    }
}

var animateClicked = false;

function animateToggle() {
    if (animateClicked) {
        animateClicked = false;
        document.getElementById("aBtn").innerHTML = "Play";
    } else {
        animateClicked = true;
        document.getElementById("aBtn").innerHTML = "Pause";
    }
}

function generate() {
    init();
}

var cCanvas = false

function clearCanvas() {
    cCanvas = true
    init();
    return cCanvas;
}

window.onload = async function() {
    var steps = 0;
    while (true) {
        //sleep function from stackoverflow.com
        await new Promise(r => setTimeout(r, msSlider.value));

        if (animateClicked) {
            init(steps);
            steps++;
            if (steps > 10) {
                steps = 0
            }
        }
    };
}

function init(step) {

    NumPoints = pSlider.value;

    var size;
    size = sSlider.value / 100;

    rValue = String(rInVal.value / 255);
    gValue = String(gInVal.value / 255);
    bValue = String(bInVal.value / 255);

    if (step != null) {
        rValue = 0.0 + step * 0.1;
        gValue = 1.0 - step * 0.1;
        bValue = 0.0 + step * 0.2;

        NumPoints = 5000 - step * 500;
        size = 1 - step * 0.1;
    }

    var fragment_shader = "precision mediump float;" +
        "void main() {" +
        "gl_FragColor = vec4(" + rValue + "," + gValue + "," + bValue + ", 1.0 );" +
        "}";

    //sets num points to 0 to clear the canvas if clear button is clicked
    if (cCanvas) {
        NumPoints = 0;
        cCanvas = false;
    }
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2(-size, -size),
        vec2(0, size),
        vec2(size, -size)
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = scale(0.25, add(u, v));

    // And, add our initial point into our array of points

    points = [p];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for (var i = 0; points.length < NumPoints; ++i) {
        var j = Math.floor(Math.random() * 3);
        p = add(points[i], vertices[j]);
        p = scale(0.5, p);
        points.push(p);
    }

    //
    //  Configure WebGL
    //
    gl.viewport(5, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var vertShdr = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShdr, vertex_shader);
    gl.compileShader(vertShdr);

    var fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShdr, fragment_shader);
    gl.compileShader(fragShdr);

    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);

    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);
}