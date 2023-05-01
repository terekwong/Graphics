"use strict";

var undo_save = [];
var redo_save = []
var shape_list = [];
var selected = null;
var copy = false;
var p = false;
var undo = false;
var copied = [];
var undo_list = [];
var file;
var count = 0;

function load_json() {
    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];

    var reader = new FileReader();

    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
            file = evt.target.result;
            file = JSON.parse(file);
            clearBackground();
            for (var i = 0; i < file.shapes.length; i++) {
                shape_list.push(JSON.stringify(file.shapes[i]));
            }
        }
    };

    var blob = file.slice(0, file.size);
    reader.readAsBinaryString(blob);
}

function save_json() {
    if (shape_list.length == 0) { alert("Nothing to save."); }
    else {
        var shape, file_name;
        var temp = {
            "shapes": []
        };
        for (var i = 0; i < shape_list.length; i++) {
            shape = JSON.parse(shape_list[i]);
            temp.shapes.push(shape);
        }
        temp = JSON.stringify(temp);
        file_name = prompt("Name the file:");
        if (file_name.length == 0) {
            file_name = "save_file";
        }
        download(file_name + ".json", temp);
    }
}

var canvas = document.getElementById("canvas");
function download_img(el) {
    var image = canvas.toDataURL("image/jpg");
    el.href = image;
};

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

function clearBackground() {
    var check;
    if (shape_list.length != 0) {
        check = confirm("Do you want to save?");
    }
    if (check == true) {
        save_json();
    }
    mouse.scale = 0;
    mouse.theta = 0;
    shape_list = [];
    selected = null;
    background();
}
function matrixDot (A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
        })
    })
}

function openEdit(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

function save() {
    if (undo_save.length < 1) {
        undo_save.push(shape_list[0]);
    } else if (undo_save[undo_save.length - 1] != shape_list[0]) {
        undo_save.push(shape_list[0]);
    }
}

function redo() {
    shape_list = redo_save.pop()
}

var now = [0, 0];
var thn = [0, 0];

var mouse = {
    "isDown": false,
    "isUp": true,
    "x": 0,
    "y": 0,
    "rotateR": false,
    "rotateL": false,
    "enlarge": false,
    "shrink": false,
    "offset": {
        "x": 0,
        "y": 0
    }
};

function insert_shape(shape) {
    var shape_data;
    switch(shape) {
        case 0:
            var line = {
                "obj": "line",
                "x": 256,
                "y": 256,
                "length": 0,
                "width": 5,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            };

            line.length = parseInt(document.getElementById("ll").value);
            line.width = 10;
            line.color = document.getElementById('colorpicker').value;

            if (line.length != 0) {
                line = set_points(line);
                shape_data = JSON.stringify(line);
                shape_list.push(shape_data);
            }
            break;
        case 1:
            var triangle = {
                "obj": "triangle",
                "x": 256,
                "y": 256,
                "r": 0,
                "theta": 0,
                "scale": 1,
                "color": ""
            };

            triangle.r = parseInt(document.getElementById("trir").value);
            triangle.color = document.getElementById('colorpicker').value;

            if (triangle.r != 0) {
                triangle = set_points(triangle);
                shape_data = JSON.stringify(triangle);
                shape_list.push(shape_data);
            }
            break;
        case 2: 
            var square = {
                "obj": "square",
                "x": 256,
                "y": 256,
                "r": 0,
                "theta": 45 * Math.PI / 180,
                "scale": 1,
                "points": [],
                "color": ""
            };

            square.r = parseInt(document.getElementById("sr").value);
            square.color = document.getElementById('colorpicker').value;

            if (square.r != 0) {
                square = set_points(square);
                shape_data = JSON.stringify(square);
                shape_list.push(shape_data);
            }
            break;
        case 3:
            var rectangle = {
                "obj": "rectangle",
                "x": 256,
                "y": 256,
                "h": 0,
                "w": 0,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            }

            rectangle.w = parseInt(document.getElementById("rw").value);
            rectangle.h = parseInt(document.getElementById("rh").value);
            rectangle.color = document.getElementById('colorpicker').value;

            if (rectangle.w != 0 && rectangle.h != 0) {
                rectangle = set_points(rectangle);
                shape_data = JSON.stringify(rectangle);
                shape_list.push(shape_data);
            }
            break;
        case 4:
            var circle = {
                "obj": "circle",
                "x": 256,
                "y": 256,
                "xRadius": 0,
                "yRadius": 0,
                "rotation": 0,
                "scale": 1,
                "arcStart": 0,
                "arcEnd": 2*Math.PI,
                "color": ""
            };

            circle.xRadius = parseInt(document.getElementById("cr").value);
            circle.yRadius = circle.xRadius;
            circle.color = document.getElementById('colorpicker').value;

            if (circle.r != 0) {
                shape_data = JSON.stringify(circle);
                shape_list.push(shape_data);
            }
            break;
        case 5:
            var ellipse = {
                "obj": "ellipse",
                "x": 256,
                "y": 256,
                "xRadius": 0,
                "yRadius": 0,
                "rotation": 0,
                "scale": 1,
                "arcStart": 0,
                "arcEnd": 2*Math.PI,
                "color": ""
            }

            ellipse.xRadius = parseInt(document.getElementById("exr").value);
            ellipse.yRadius = parseInt(document.getElementById("eyr").value);
            ellipse.color = document.getElementById('colorpicker').value;

            if (ellipse.xRadius != 0 && ellipse.yRadius != 0) {
                shape_data = JSON.stringify(ellipse);
                shape_list.push(shape_data);
            }
            break;
        case 6:
            var curve = {
                "obj": "curve",
                "x": 256,
                "y": 256,
                "theta": 0,
                "scale": 1,
                "width": 5,
                "p1": {
                    "x": 0,
                    "y": 0
                },
                "p2": {
                    "x": 0,
                    "y": 0
                },
                "p3": {
                    "x": 0,
                    "y": 0
                },
                "p4": {
                    "x": 0,
                    "y": 0
                },
                "points": [],
                "color": ""
            };

            curve.p1.x = parseInt(document.getElementById("bx0").value);
            curve.p1.y = parseInt(document.getElementById("by0").value);
            curve.p2.x = parseInt(document.getElementById("bx1").value);
            curve.p2.y = parseInt(document.getElementById("by1").value);
            curve.p3.x = parseInt(document.getElementById("bx2").value);
            curve.p3.y = parseInt(document.getElementById("by2").value);
            curve.p4.x = parseInt(document.getElementById("bx3").value);
            curve.p4.y = parseInt(document.getElementById("by3").value);
            curve.color = document.getElementById('colorpicker').value;

            if (curve.p1.x != curve.p2.x || curve.p1.x != curve.p3.x ||
                curve.p1.x != curve.p4.x || curve.p2.x != curve.p3.x ||
                curve.p2.x != curve.p4.x || curve.p3.x != curve.p4.x ||
                curve.p1.y != curve.p2.y || curve.p1.y != curve.p3.y ||
                curve.p1.y != curve.p4.y || curve.p2.y != curve.p3.y ||
                curve.p2.y != curve.p4.y || curve.p3.y != curve.p4.y)
            {
                curve = set_points(curve);
                shape_data = JSON.stringify(curve);
                shape_list.push(shape_data);
            }
            break;
        case 7:
            var validate = document.getElementById("validator");
            validate.innerHTML = " ";
            var poly_line = {
                "obj": "poly-line",
                "x": 256,
                "y": 256,
                "theta": 0,
                "scale": 0,
                "width": 5,
                "points": [],
                "color": ""
            };

            var invalidChar = /[^\d, \n]/;
            var pointsRegEx = /(\d+, \d+|\d+,\d+)/g;
            var linepoints = document.getElementById("polyline").value;

            if (linepoints == "") { break; }
            if (invalidChar.test(linepoints)) {
                validate.innerHTML = "Invalid characters detected, try again";
                break;
            }

            var points = linepoints.match(pointsRegEx);
            try {
                for (var i = 0; i < points.length; i++) {
                    if (points[i].includes(", ")) { 
                        poly_line.points.push([
                            parseInt(points[i].split(", ")[0]),
                            parseInt(points[i].split(", ")[1])
                        ]);
                    } else if (points[i].includes(",")) {
                        poly_line.points.push([
                            parseInt(points[i].split(",")[0]),
                            parseInt(points[i].split(",")[1])
                        ]);
                    }
                }
            } catch(err) {
                validate.innerHTML = err.message;
                break;
            }

            poly_line.color = document.getElementById('colorpicker').value;

            shape_data = JSON.stringify(poly_line);
            if (poly_line.points.length >= 2) {
                shape_list.push(shape_data);
            } else {
                validate.innerHTML = "Not enough points, add one more point";
            }
            break;
        case 8: 
            var polygon = {
                "obj": "polygon",
                "x": 256,
                "y": 256,
                "topW": 0,
                "botW": 0,
                "h": 0,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            };

            polygon.topW = parseInt(document.getElementById("ptw").value);
            polygon.botW = parseInt(document.getElementById("pbw").value);
            polygon.h = parseInt(document.getElementById("ph").value);
            polygon.color = document.getElementById('colorpicker').value;

            if (polygon.topW != 0 || polygon.botW != 0) {
                polygon = set_points(polygon);
                shape_data = JSON.stringify(polygon);
                shape_list.push(shape_data);
            }

            break;
        case 9:
            var line = {
                "obj": "line",
                "x": 256,
                "y": 256,
                "length": 0,
                "width": 5,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            };

            line.length = Math.random()*512;
            line.width = 10;
            line.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (line.length != 0) {
                line = set_points(line);
                shape_data = JSON.stringify(line);
                shape_list.push(shape_data);
            }
            break;
        case 10:
            var triangle = {
                "obj": "triangle",
                "x": 256,
                "y": 256,
                "r": 0,
                "theta": 0,
                "scale": 1,
                "color": ""
            };

            triangle.r = Math.random()*512;
            triangle.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (triangle.r != 0) {
                triangle = set_points(triangle);
                shape_data = JSON.stringify(triangle);
                shape_list.push(shape_data);
            }
            break;
        case 11:
            var square = {
                "obj": "square",
                "x": 256,
                "y": 256,
                "r": 0,
                "theta": 45 * Math.PI / 180,
                "scale": 1,
                "points": [],
                "color": ""
            };

            square.r = Math.random()*512;
            square.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (square.r != 0) {
                square = set_points(square);
                shape_data = JSON.stringify(square);
                shape_list.push(shape_data);
            }
            break;
        case 12: 
            var rectangle = {
                "obj": "rectangle",
                "x": 256,
                "y": 256,
                "h": 0,
                "w": 0,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            }

            rectangle.w = Math.random()*512;
            rectangle.h = Math.random()*512;
            rectangle.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (rectangle.w != 0 && rectangle.h != 0) {
                rectangle = set_points(rectangle);
                shape_data = JSON.stringify(rectangle);
                shape_list.push(shape_data);
            }
            break;
        case 13:
            var circle = {
                "obj": "circle",
                "x": 256,
                "y": 256,
                "xRadius": 0,
                "yRadius": 0,
                "rotation": 0,
                "scale": 1,
                "arcStart": 0,
                "arcEnd": 2*Math.PI,
                "color": ""
            };

            circle.xRadius = Math.random()*512;
            circle.yRadius = circle.xRadius;
            circle.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (circle.r != 0) {
                shape_data = JSON.stringify(circle);
                shape_list.push(shape_data);
            }
            break;
        case 14:
            var ellipse = {
                "obj": "ellipse",
                "x": 256,
                "y": 256,
                "xRadius": 0,
                "yRadius": 0,
                "rotation": 0,
                "scale": 1,
                "arcStart": 0,
                "arcEnd": 2*Math.PI,
                "color": ""
            }

            ellipse.xRadius = Math.random()*512;
            ellipse.yRadius = Math.random()*512;
            ellipse.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (ellipse.xRadius != 0 && ellipse.yRadius != 0) {
                shape_data = JSON.stringify(ellipse);
                shape_list.push(shape_data);
            }
            break;
        case 15:
            var curve = {
                "obj": "curve",
                "x": 256,
                "y": 256,
                "theta": 0,
                "scale": 1,
                "width": 5,
                "p1": {
                    "x": 0,
                    "y": 0
                },
                "p2": {
                    "x": 0,
                    "y": 0
                },
                "p3": {
                    "x": 0,
                    "y": 0
                },
                "p4": {
                    "x": 0,
                    "y": 0
                },
                "points": [],
                "color": ""
            };

            curve.p1.x = Math.random()*512;
            curve.p1.y = Math.random()*512;
            curve.p2.x = Math.random()*512;
            curve.p2.y = Math.random()*512;
            curve.p3.x = Math.random()*512;
            curve.p3.y = Math.random()*512;
            curve.p4.x = Math.random()*512;
            curve.p4.y = Math.random()*512;
            curve.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (curve.p1.x != curve.p2.x || curve.p1.x != curve.p3.x ||
                curve.p1.x != curve.p4.x || curve.p2.x != curve.p3.x ||
                curve.p2.x != curve.p4.x || curve.p3.x != curve.p4.x ||
                curve.p1.y != curve.p2.y || curve.p1.y != curve.p3.y ||
                curve.p1.y != curve.p4.y || curve.p2.y != curve.p3.y ||
                curve.p2.y != curve.p4.y || curve.p3.y != curve.p4.y)
            {
                curve = set_points(curve);
                shape_data = JSON.stringify(curve);
                shape_list.push(shape_data);
            }
            break;
        case 16:
            console.log("random poly line")
            var validate = document.getElementById("validator");
            validate.innerHTML = " ";
            var poly_line = {
                "obj": "poly-line",
                "x": 256,
                "y": 256,
                "theta": 0,
                "scale": 0,
                "width": 5,
                "points": [],
                "color": ""
            };

            var points = Math.random()*7+3;
            try {
                for (var i = 0; i < points; i++) {
                    poly_line.points.push([
                        Math.random()*512,
                        Math.random()*512
                    ]);
                }
            } catch(err) {
                validate.innerHTML = err.message;
                console.log(err.message);
                break;
            }

            poly_line.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            shape_data = JSON.stringify(poly_line);
            if (poly_line.points.length >= 2) {
                shape_list.push(shape_data);
            } else {
                validate.innerHTML = "Not enough points, add one more point";
            }
            break;
        case 17:
            var polygon = {
                "obj": "polygon",
                "x": 256,
                "y": 256,
                "topW": 0,
                "botW": 0,
                "h": 0,
                "theta": 0,
                "scale": 1,
                "points": [],
                "color": ""
            };

            polygon.topW = Math.random()*512;
            polygon.botW = Math.random()*512;
            polygon.h = Math.random()*512;
            polygon.color = "#" + Math.floor(Math.random()*16777215).toString(16);

            if (polygon.topW != 0 || polygon.botW != 0) {
                polygon = set_points(polygon);
                shape_data = JSON.stringify(polygon);
                shape_list.push(shape_data);
            }
            break;
    }
}

var canvas = document.getElementById("canvas");

canvas.addEventListener("mousemove", function(e) { 
    var cRect = canvas.getBoundingClientRect();
    mouse.x = Math.round(e.clientX - cRect.left);
    mouse.y = Math.round(e.clientY - cRect.top);
    mouse.scale = 0;
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

canvas.addEventListener("wheel", function(event) {
    var y = event.deltaY;
    if (y < 0) {
        mouse.shrink = true;
    }
    if (y > 0) {
        mouse.enlarge = true;
    }
});

var cp = {};
document.addEventListener("keydown", function(event) {
    var k = event.key;
    if (k == "r") {
        mouse.rotateR = true;
    }
    if (k == "e") {
        mouse.rotateL = true;
    }
    cp[event.key] = true;

    if (cp['Control'] && event.key == "c") {
        copy = true;
    }
    if (cp['Control'] && event.key == "v") {
        p = true;
    }
    if (cp['Control'] && event.key == "z") {
        undo = true;
    }
});

document.addEventListener('keyup', (event) => {
    delete this.cp[event.key];
    copy = false;
    p = false;
    mouse.rotateR = false;
    mouse.rotateL = false;
});

function draw_shape(shape_data) {
    if (typeof shape_data === typeof "") {
        shape_data = JSON.parse(shape_data);
    }
    var canvas = document.getElementById('canvas');
    if (shape_data == null) {
        return;
    }

    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        if (shape_data.obj.includes("line") || shape_data.obj == "curve") {
            context.lineWidth = shape_data.width;
        }
        if (shape_data.obj == "circle" || shape_data.obj == "ellipse") {
            var circle = shape_data;
            var scale = circle.scale;

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
        } else if (shape_data.obj == "curve") {
            var curve = shape_data;
            
            context.lineWidth = curve.width;
            context.beginPath();
            context.moveTo(curve.p1.x, curve.p1.y);
            context.bezierCurveTo(
                curve.p2.x, curve.p2.y,
                curve.p3.x, curve.p3.y,
                curve.p4.x, curve.p4.y
            );
            context.strokeStyle = curve.color;
            context.stroke();
        } else {
            context.beginPath();
            context.moveTo(shape_data.points[0][0], shape_data.points[0][1]);
            for (var i = 0; i < shape_data.points.length; i++) {
                context.lineTo(
                    shape_data.points[i][0],
                    shape_data.points[i][1]
                );
            }
            if (shape_data.obj.includes("line") || shape_data.obj == "curve") {
                context.strokeStyle = shape_data.color;
                context.stroke();
            } else {
                context.fillStyle = shape_data.color;
                context.fill();
            }
            
        }
    }
}

function set_points(shape_json) {
    if (typeof shape_json === typeof "") {
        shape_json = JSON.parse(shape_json);
    }

    if (shape_json.obj == "circle" || shape_json.obj == "ellipse") {
        return shape_json;
    }
    switch (shape_json.obj) {
        case "line":
            var line = shape_json;

            var theta = line.theta;
            var scale = line.scale;
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

            return line;
        case "triangle":
            var triangle = shape_json;

            var theta = triangle.theta;
            var scale = triangle.scale;

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
                [Math.round(pr3[0]) + triangle.x, Math.round(pr3[1]) + triangle.y],
                [Math.round(pr1[0]) + triangle.x, Math.round(pr1[1]) + triangle.y]
            ];

            return triangle;
        case "square":
            var square = shape_json;
    
            var theta = square.theta;
            var scale = square.scale;

            var rotMat = rotMatrix(theta);
            var sMat = scaleMatrix(scale);

            var p1 = [[0], [square.r*Math.sqrt(2)/2]];
            var p2 = [[square.r*Math.sqrt(2)/2], [0]];
            var p3 = [[0], [-square.r*Math.sqrt(2)/2]];
            var p4 = [[-square.r*Math.sqrt(2)/2], [0]];

            var pr1 = matrixDot(rotMat, p1);
            var pr2 = matrixDot(rotMat, p2);
            var pr3 = matrixDot(rotMat, p3);
            var pr4 = matrixDot(rotMat, p4);

            pr1 = matrixDot(sMat, pr1);
            pr2 = matrixDot(sMat, pr2);
            pr3 = matrixDot(sMat, pr3);
            pr4 = matrixDot(sMat, pr4);

            square.points = [
                [Math.round(pr1[0]) + square.x, Math.round(pr1[1]) + square.y],
                [Math.round(pr2[0]) + square.x, Math.round(pr2[1]) + square.y],
                [Math.round(pr3[0]) + square.x, Math.round(pr3[1]) + square.y],
                [Math.round(pr4[0]) + square.x, Math.round(pr4[1]) + square.y],
                [Math.round(pr1[0]) + square.x, Math.round(pr1[1]) + square.y]
            ];

            return square;
        case "rectangle":
            var rectangle = shape_json;

            var theta = rectangle.theta;
            var scale = rectangle.scale;

            var rotMat = rotMatrix(theta);
            var sMat = scaleMatrix(scale);

            var p1 = [[rectangle.w/2], [rectangle.h/2]];
            var p2 = [[rectangle.w/2], [-rectangle.h/2]];
            var p3 = [[-rectangle.w/2], [-rectangle.h/2]];
            var p4 = [[-rectangle.w/2], [rectangle.h/2]];

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
                [Math.round(pr4[0]) + rectangle.x, Math.round(pr4[1]) + rectangle.y],
                [Math.round(pr1[0]) + rectangle.x, Math.round(pr1[1]) + rectangle.y]
            ];

            return rectangle;
        case "curve":
            var curve = shape_json;

            var theta = curve.theta;
            var scale = curve.scale;

            var rotMat = rotMatrix(theta);
            var sMat = scaleMatrix(scale);

            curve.x = Math.round((
                curve.p1.x + 
                curve.p2.x + 
                curve.p3.x + 
                curve.p4.x) / 4
            );
            curve.y = Math.round((
                curve.p1.y + 
                curve.p2.y + 
                curve.p3.y + 
                curve.p4.y) / 4
            );

            var p1 = [[curve.p1.x - curve.x], [curve.p1.y - curve.y]];
            var p2 = [[curve.p2.x - curve.x], [curve.p2.y - curve.y]];
            var p3 = [[curve.p3.x - curve.x], [curve.p3.y - curve.y]];
            var p4 = [[curve.p4.x - curve.x], [curve.p4.y - curve.y]];

            var pr1 = matrixDot(rotMat, p1);
            var pr2 = matrixDot(rotMat, p2);
            var pr3 = matrixDot(rotMat, p3);
            var pr4 = matrixDot(rotMat, p4);

            pr1 = matrixDot(sMat, pr1);
            pr2 = matrixDot(sMat, pr2);
            pr3 = matrixDot(sMat, pr3);
            pr4 = matrixDot(sMat, pr4);

            curve.p1.x = pr1[0][0] + curve.x;
            curve.p1.y = pr1[1][0] + curve.y;
            curve.p2.x = pr2[0][0] + curve.x;
            curve.p2.y = pr2[1][0] + curve.y;
            curve.p3.x = pr3[0][0] + curve.x;
            curve.p3.y = pr3[1][0] + curve.y;
            curve.p4.x = pr4[0][0] + curve.x;
            curve.p4.y = pr4[1][0] + curve.y;

            curve.points = [
                [curve.p1.x, curve.p1.y],
                [curve.p2.x, curve.p2.y],
                [curve.p3.x, curve.p3.y],
                [curve.p4.x, curve.p4.y]
            ];

            return curve;
        case "polygon":
            var polygon = shape_json;

            var theta = polygon.theta;
            var scale = polygon.scale;

            var rotMat = rotMatrix(theta);
            var sMat = scaleMatrix(scale);

            var p1 = [[-polygon.topW/2], [-polygon.h/2]];
            var p2 = [[polygon.topW/2], [-polygon.h/2]];
            var p3 = [[polygon.botW/2], [polygon.h/2]];
            var p4 = [[-polygon.botW/2], [polygon.h/2]];

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
                [Math.round(pr4[0]) + polygon.x, Math.round(pr4[1]) + polygon.y],
                [Math.round(pr1[0]) + polygon.x, Math.round(pr1[1]) + polygon.y]
            ];

            return polygon;
        case "poly-line":
            
            return poly_line;
    }
    return shape_json;
}

function iter_shape_data() {
    if (p && copied.length != 0) {
        shape_list.push(copied[0]);
        p = false;
    }
    for (var i = 0; i < shape_list.length; i++) {
        draw_shape(shape_list[i]);
    }
}

function background() {
    mouse.scale = 0;
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var context = canvas.getContext('2d');

        context.beginPath();
        context.rect(0, 0, 512, 512);
        context.fillStyle = "#AAAAAA";
        context.fill();
    }
}


function mouse_collision(shape_json) {
    if (typeof shape_json === typeof "") {
        shape_json = JSON.parse(shape_json);
    }
    if (shape_json.obj == "circle" || shape_json.obj == "ellipse") {
        var circle = shape_json;
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
            return true;
        }
        return false;
    } else if (shape_json.obj == "line") {
        var line = shape_json;
        var lineArr = line.points;
        var d1 = Math.sqrt((mouse.x - lineArr[0][0])**2 +
                            (mouse.y - lineArr[0][1])**2);
        var d2 = Math.sqrt((mouse.x - lineArr[1][0])**2 +
                            (mouse.y - lineArr[1][1])**2);
        var buffer = 0.1 * line.width;
        if (d1 + d2 >= line.length - buffer && d1 + d2 <= line.length + buffer) {
            return true;
        }
        return false;
    } else if (shape_json.obj == "poly-line") {
        var line = shape_json;
        var lineArr = line.points;
        for (var i = 0; i < lineArr.length - 1; i++) {
            var dist = Math.sqrt(
                (lineArr[i+1][0] - lineArr[i][0])**2 +
                (lineArr[i+1][1] - lineArr[i][1])**2
            );
            var d1 = Math.sqrt((mouse.x - lineArr[i][0])**2 +
                                (mouse.y - lineArr[i][1])**2);
            var d2 = Math.sqrt((mouse.x - lineArr[i+1][0])**2 +
                                (mouse.y - lineArr[i+1][1])**2);
            var buffer = 0.1 * line.width;
            if (d1 + d2 >= dist - buffer && d1 + d2 <= dist + buffer) {
                return true;
            }
        }
        return false;
    } else {
        var polArr = shape_json.points;
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
}

function drag() {
    var shape, temp;
    var deg = 3 * Math.PI / 180;
    if (selected != null) {
        if (typeof selected === typeof "") {
            shape = JSON.parse(selected);
        }

        if (copy) {
            var temp = shape;
            copied.splice(0, 1, JSON.stringify(temp));
            copy = false;
        }

        if (mouse.isDown) {
            if (shape.obj == "poly-line") {
                for (var i = 0; i < shape.points.length; i++) {
                    shape.points[i][0] += mouse.offset.x;
                    shape.points[i][1] += mouse.offset.y;
                }
            } else if (shape.obj == "curve") {
                shape.p1.x += mouse.offset.x;
                shape.p2.x += mouse.offset.x;
                shape.p3.x += mouse.offset.x;
                shape.p4.x += mouse.offset.x;

                shape.p1.y += mouse.offset.y;
                shape.p2.y += mouse.offset.y;
                shape.p3.y += mouse.offset.y;
                shape.p4.y += mouse.offset.y;
                if (mouse.enlarge) {
                    shape.scale += 0.01;
                } else if (mouse.shrink) {
                    shape.scale -= 0.01;
                }
                if (mouse.rotateR) {
                    shape.theta += deg/2;
                } else if (mouse.rotateL) {
                    shape.theta -= deg/2;
                }
            } else if (shape.obj.includes("line")) {
                shape.x = mouse.x;
                shape.y = mouse.y;
            } else {
                shape.x += mouse.offset.x;
                shape.y += mouse.offset.y;
            }
            if (shape.obj == "circle" || shape.obj == "ellipse") {
                if (mouse.enlarge) {
                    shape.scale += 0.1;
                } else if (mouse.shrink) {
                    shape.scale -= 0.1;
                }
                if (mouse.rotateR) {
                    shape.rotation += deg;
                } else if (mouse.rotateL) {
                    shape.rotation -= deg;
                }
            } else if (shape.obj == "curve") {
            } else {
                if (mouse.enlarge) {
                    shape.scale += 0.1;
                } else if (mouse.shrink) {
                    shape.scale -= 0.1;
                }
                if (mouse.rotateR) {
                    shape.theta += deg;
                } else if (mouse.rotateL) {
                    shape.theta -= deg;
                }
            }
        }
        mouse.rotateR = false;
        mouse.rotateL = false;
        mouse.enlarge = false;
        mouse.shrink = false;
        shape = set_points(shape);
        draw_shape(shape);
        selected = JSON.stringify(shape);
        if (mouse.isUp || !mouse_collision(shape)) {
            selected = JSON.stringify(shape);
            shape_list.push(selected);
            selected = null;
        }
    }
}

function check_mouse() {
    var obj_data;
    mouse.shrink = false;
    mouse.enlarge = false;
    if (selected == null && shape_list.length != 0) {
        for (var i = shape_list.length - 1; i >= 0; i--) {
            obj_data = JSON.parse(shape_list[i]);
            if (mouse_collision(obj_data)) {
                if (mouse.isDown) {
                    selected = shape_list.splice(i, 1)[0];
                } 
                break;
            }
        }
    }
}

function rand() {
    var rand_shape = Math.floor(Math.random()*9+9);
    console.log(rand_shape);
    insert_shape(rand_shape);
}

window.onload = async function() {
    while (true) {
        save();
        background();
        iter_shape_data();
        check_mouse();
        movement();
        drag();
        await new Promise(r => setTimeout(r, 1));
    }
}