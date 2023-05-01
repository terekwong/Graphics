"use strict";

var canvas;
var gl;

var numVertices  = 48;

var pointsArray = [];
var colorsArray = [];

var t = 0;
var a, b, c, d, e, f;
a = b = c = d = e = f = 0;
var x = 0;
var y = 0;
var z = 0;
var stepping = false;

var vertices = [
    vec4( 0,  0, 30),
    vec4(16,  0, 30),
    vec4(16, 10, 30),
    vec4( 8, 16, 30),
    vec4( 0, 10, 30),
    vec4( 0,  0, 54),
    vec4(16,  0, 54),
    vec4(16, 10, 54),
    vec4( 8, 16, 54),
    vec4( 0, 10, 54),
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    ];

var near = -1000;
var far = 1000;
var radius = 0.05;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -60.0;
var right = 60.0;
var ytop = 60.0;
var bottom = -60.0;

var x1 = document.getElementById("x1");
var y1 = document.getElementById("y1");
var z1 = document.getElementById("z1");

var x2 = document.getElementById("x2");
var y2 = document.getElementById("y2");
var z2 = document.getElementById("z2");

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

var at = vec3(8, 5, 42);
const up = vec3(0.0, 1.0, 0.0);

function quad(x, a, b, c) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[x]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[x]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[x]);
}

function colorCube()
{   
    //red, back
    quad(0, 0, 1, 2);
    quad(0, 0, 4, 2);
    quad(0, 3, 4, 2);
    //front
    quad(1, 7, 6, 5);
    quad(1, 7, 5, 9);
    quad(1, 7, 9, 8);
    //green, right wall
    quad(3, 2, 1, 6);
    quad(3, 2, 7, 6);
    //left wall
    quad(4, 9, 5, 0);
    quad(4, 9, 0, 4);
    //bottom
    quad(2, 5, 0, 1);
    quad(2, 5, 6, 1);
    //left roof
    quad(5, 8, 9, 4);
    quad(5, 8, 4, 3);
    //right roof
    quad(6, 7, 8, 3);
    quad(6, 3, 7, 2);
}

var phiClicked = false;
function phiToggle() {
    if (phiClicked) {
        phiClicked = false;
        document.getElementById("pBtn").innerHTML = "Off";
    } else {
        phiClicked = true;
        stepping = false;
        document.getElementById("pBtn").innerHTML = "On";
    }
}

var thetaClicked = false;
function thetaToggle() {
    if (thetaClicked) {
        thetaClicked = false;
        document.getElementById("tBtn").innerHTML = "Off";
    } else {
        thetaClicked = true;
        stepping = false;
        document.getElementById("tBtn").innerHTML = "On";
    }
}

function pStep(a, b, c, d, e, f) {
    var output = {
        "x": [],
        "y": [],
        "z": []
    }

    var dx = parseInt(a) - parseInt(d);
    var dy = parseInt(b) - parseInt(e);
    var dz = parseInt(c) - parseInt(f);
    if (a == d) { dx = 0;}
    if (b == e) { dy = 0;}
    if (c == f) { dz = 0;}
    console.log(a, b, c, d, e, f);
    console.log(dx, dy, dz);

    for (var i = 0; i <= 25; i++) {
        output.x.push(a + dx * 1 / i);
        output.y.push(b + dy * 1 / i);
        output.z.push(c + dz * 1 / i);
    }

    output.x.shift();
    output.y.shift();
    output.z.shift();

    console.log(output);
    return output;
}

function enter() {
    a = parseInt(x1.value),
    b = parseInt(y1.value),
    c = parseInt(z1.value),
    d = parseInt(x2.value),
    e = parseInt(y2.value),
    f = parseInt(z2.value);
    t = 0;
    phiClicked = false;
    thetaClicked = false;
    document.getElementById("tBtn").innerHTML = "Off";
    document.getElementById("pBtn").innerHTML = "Off";
    stepping = true;
}

window.onload = async function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// buttons to change viewing parameters
    while (true) {
        var points = pStep(a, b, c, d, e, f);
        console.log(points);
        if (phiClicked) {
            phi += 0.1;
        }
        if (thetaClicked) {
            theta += 0.1;
        }

        if (theta >= 6.2 || !thetaClicked) {theta = 0.0;}
        if (phi >= 6.2) {phi = 0.0;}
        if (t >= 25) {
            t = 0;
        }
        x = points.x[t];
        y = points.y[t];
        z = points.z[t];
        eye = vec3(x, y, z);
        if (stepping) { t++; }
        render();
        await new Promise(r => setTimeout(r, 100));
    }
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}