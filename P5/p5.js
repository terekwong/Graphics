"use strict";

function DDALine(x0, y0, x1, y1) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    var x;
    var dy = y1 - y0;
    var dx = x1 - x0;
    var m = dy / dx;
    var y = y0;

    if (x1 < x0) {
        y = y1;
        for (x = x1; x <= x0; x++) {
            output.x.push(x);
            output.y.push(Math.floor(y));
            y += m;
        }
    } else {
        for (x = x0; x <= x1; x++) {
            output.x.push(x);
            output.y.push(Math.floor(y));
            y += m;
        } 
    }

    output.length = output.x.length;

    return output;
}

function midPointLine(x0, y0, x1, y1) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };
    
    var xReflect = 1;
    var yReflect = 1;
    if ( x1 < x0 ) {
        x0 = -x0;
        x1 = -x1;
        xReflect = -1;
    }
    if ( y1 < y0 ) {
        y0 = -y0;
        y1 = -y1;
        yReflect = -1;
    }

    var dx = x1 - x0;
    var dy = y1 - y0;
    var d = 2 * dy - dx;
    var incrE = 2 * dy;
    var incrNE = 2 * (dy - dx);
    var x = x0;
    var y = y0;
    
    while (x < x1) {
        if (d <= 0) { d = d + incrE; x++; }
        else { d = d + incrNE; x++; y++; }
        output.x.push(x * xReflect);
        output.y.push(y * yReflect);
    }

    output.length = output.x.length;

    return output;
}

function midPointCircle(x, y, radius) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    var i, len;
    var x1 = 0;
    var y1 = radius;
    var d = 1.25 - radius;

    output.x.push(x1);
    output.y.push(y1);

    while (y1 > x1) {
        if (d < 0) { d += 2 * x1 + 3; }
        else { d += 2 * (x1 - y1) + 5; y1--; }
        x1++;
        output.x.push(x1);
        output.y.push(y1);
    }

    len = output.x.length;
    for (i = len - 2; i >= 0; i--) {
        output.x.push(output.y[i]);
        output.y.push(output.x[i]);
    }

    len = output.x.length;
    for (i = len - 2; i >= 0; i--) {
        output.x.push(output.x[i]);
        output.y.push(-output.y[i]);
    }

    len = output.x.length;
    for (i = len - 2; i >= 0; i--) {
        output.x.push(-output.x[i]);
        output.y.push(output.y[i]);
    }

    len = output.x.length;
    for (i = len; i >= 0; i--) {
        output.x[i] += x;
        output.y[i] += y;
    }

    output.x.pop();
    output.y.pop();

    output.length = output.x.length;

    return output;
}

function midPointEllipse(x, y, a, b) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    var d2, len, i;
    var x1 = 0;
    var y1 = b;
    var d1 = (b * b) - (a * a * b) + (0.25 * a * a);

    output.x.push(x1);
    output.y.push(y1);

    while (((a*a)*(y1-0.5)) > ((b*b)*(x1+1))) {
        if (d1 < 0) { d1 = d1 + ((b*b)*(2*x1+3)); }
        else { d1 = d1 + ((b*b)*(2*x1+3)) + ((a*a)*(-2*y1+2)); y1--; }
        x1++;
        output.x.push(x1);
        output.y.push(y1);
    }

    d2 = ((b*b)*(x1+0.5)*(x1+0.5))+((a*a)*(y1-1)*(y1-1))-(a*a*b*b);
    while (y1 > 0) {
        if (d2 < 0) { d2 = d2 + ((b*b)*(2*x1+2)) + ((a*a)*(-2*y1+3)); x1++; }
        else { d2 = d2 + ((a*a)*(-2*y1+3)); }
        y1--;
        output.x.push(x1);
        output.y.push(y1);
    }

    len = output.x.length;
    for (i = len - 2; i >= 0; i--) {
        output.x.push(output.x[i]);
        output.y.push(-output.y[i]);
    }

    len = output.x.length;
    for (i = len - 2; i >= 0; i--) {
        output.x.push(-output.x[i]);
        output.y.push(output.y[i]);
    }

    len = output.x.length;
    for (i = len; i >= 0; i--) {
        output.x[i] += x;
        output.y[i] += y;
    }

    output.x.pop();
    output.y.pop();

    output.length = output.x.length;

    return output;
}

function bezierCurve(x0, y0, x1, y1, x2, y2, x3, y3, n) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    if (n == undefined) { n = 10; }

    var i, t, x, y;
    var delta = 1.0/n;

    x = x0;
    y = y0;
    t = 0;
    
    output.x.push(x);
    output.y.push(y);

    for (i = 0; i < n; i++) {
        t += delta;
        var t2 = t * t;
        var t3 = t2 * t;
           
        var q1=(1-t);
        var q2=q1*q1;
        var q3=q2*q1;
        x = q3*x0 + (3*t*q2)*x1 + (3*t2*q1)*x2 + t3*x3;
        y = q3*y0 + (3*t*q2)*y1 + (3*t2*q1)*y2 + t3*y3;
        
        output.x.push(x);
        output.y.push(y);
    }

    output.length = output.x.length;

    return output;
}

function hermiteCurve(x0, y0, x1, y1, x2, y2, x3, y3, n) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    if (n == undefined) { var n = 10; }

    var i, t, x, y;
    var delta = 1.0/n;

    x = x0;
    y = y0;
    t = 0;

    output.x.push(x);
    output.y.push(y);

    for (i = 0; i < n; i++) {
        t += delta;
        var t2 = t * t;
        var t3 = t2 * t;

        x = ((2*t3)-(3*t2)+1)*x0 +
            ((-2*t3)+(3*t2))*x1 +
            (t3-(2*t2)+t)*x2 +
            (t3-t2)*x3;

        y = ((2*t3)-(3*t2)+1)*y0 + 
            ((-2*t3)+(3*t2))*y1 + 
            (t3-(2*t2)+t)*y2 + 
            (t3-t2)*y3;

        output.x.push(x);
        output.y.push(y);
    }

    output.length = output.x.length;

    return output;
}

function bSplineCurve(x0, y0, x1, y1, x2, y2, x3, y3, n) {
    var output = {
        "x": [],
        "y": [],
        "length": 0
    };

    if (n == undefined) { n = 100; }

    var i, t, x, y;
    var delta = 1.0/n;

    x = x0;
    y = y0;
    t = 0;

    for (i = 0; i < n; i++) {
        t += delta;
        var t2 = t * t;
        var t3 = t2 * t;

        x = (((1-t3)/6)*x0)+
            (((3*t3-6*t2+4)/6)*x1)+
            (((-3*t3+3*t2+3*t+1)/6)*x2)+
            ((t3/6)*x3);
        y = (((1-t3)/6)*y0)+
            (((3*t3-6*t2+4)/6)*y1)+
            (((-3*t3+3*t2+3*t+1)/6)*y2)+
            ((t3/6)*y3);
        
        output.x.push(x);
        output.y.push(y);
    }

    output.length = output.x.length;

    return output;
}

var x1 = document.getElementById("x1");

function clearBackground() {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.rect(0, 0, 512, 512);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

function draw(method) {
    var data;
    var canvas = document.getElementById('canvas');
    var colorValue = document.getElementById('html5colorpicker').value;
    
    switch(method) {
        case 0:
            var x0 = parseInt(document.getElementById("ddax0").value);
            var y0 = parseInt(document.getElementById("dday0").value);
            var x1 = parseInt(document.getElementById("ddax1").value);
            var y1 = parseInt(document.getElementById("dday1").value);

            data = DDALine(x0, y0, x1, y1);
            break;
        case 1:
            var x0 = parseInt(document.getElementById("mlx0").value);
            var y0 = parseInt(document.getElementById("mly0").value);
            var x1 = parseInt(document.getElementById("mlx1").value);
            var y1 = parseInt(document.getElementById("mly1").value);
            
            data = midPointLine(x0, y0, x1, y1);
            break;
        case 2:
            var x = parseInt(document.getElementById("mcx").value);
            var y = parseInt(document.getElementById("mcy").value);
            var r = parseInt(document.getElementById("mcr").value);

            data = midPointCircle(x, y, r);
            break;
        case 3:
            var x = parseInt(document.getElementById("mex").value);
            var y = parseInt(document.getElementById("mey").value);
            var a = parseInt(document.getElementById("merx").value);
            var b = parseInt(document.getElementById("mery").value);

            data = midPointEllipse(x, y, a, b);
            break;
        case 4:
            var x0 = parseInt(document.getElementById("bcx0").value);
            var y0 = parseInt(document.getElementById("bcy0").value);
            var x1 = parseInt(document.getElementById("bcx1").value);
            var y1 = parseInt(document.getElementById("bcy1").value);
            var x2 = parseInt(document.getElementById("bcx2").value);
            var y2 = parseInt(document.getElementById("bcy2").value);
            var x3 = parseInt(document.getElementById("bcx3").value);
            var y3 = parseInt(document.getElementById("bcy3").value);
            var n = parseInt(document.getElementById("bcn").value);

            data = bezierCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
        case 5:
            var x0 = parseInt(document.getElementById("hcx0").value);
            var y0 = parseInt(document.getElementById("hcy0").value);
            var x1 = parseInt(document.getElementById("hcx1").value);
            var y1 = parseInt(document.getElementById("hcy1").value);
            var x2 = parseInt(document.getElementById("hcx2").value);
            var y2 = parseInt(document.getElementById("hcy2").value);
            var x3 = parseInt(document.getElementById("hcx3").value);
            var y3 = parseInt(document.getElementById("hcy3").value);
            var n = parseInt(document.getElementById("hcn").value);

            data = hermiteCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
        case 6:
            var x0 = parseInt(document.getElementById("scx0").value);
            var y0 = parseInt(document.getElementById("scy0").value);
            var x1 = parseInt(document.getElementById("scx1").value);
            var y1 = parseInt(document.getElementById("scy1").value);
            var x2 = parseInt(document.getElementById("scx2").value);
            var y2 = parseInt(document.getElementById("scy2").value);
            var x3 = parseInt(document.getElementById("scx3").value);
            var y3 = parseInt(document.getElementById("scy3").value);
            var n = parseInt(document.getElementById("scn").value);

            data = bSplineCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
        case 7:
            var x0 = Math.random() * 512;
            var y0 = Math.random() * 512;
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);
            console.log(colorValue);

            data = DDALine(x0, y0, x1, y1);
            break;
        case 8:
            var x0 = Math.random() * 512;
            var y0 = Math.random() * 512;
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);
            
            data = midPointLine(x0, y0, x1, y1);
            break;
        case 9:
            var x = Math.random() * 512;
            var y = Math.random() * 512;
            var r = Math.random() * 512;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);

            data = midPointCircle(x, y, r);
            break;
        case 10:
            var x = Math.random() * 512;
            var y = Math.random() * 512;
            var a = Math.random() * 512;
            var b = Math.random() * 512;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);

            data = midPointEllipse(x, y, a, b);
            break;
        case 11:
            var x0 = Math.random() * 512;
            var y0 = Math.random() * 512;
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;
            var x2 = Math.random() * 512;
            var y2 = Math.random() * 512;
            var x3 = Math.random() * 512;
            var y3 = Math.random() * 512;
            var n = Math.random() * 100;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);

            data = bezierCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
        case 12:
            var x0 = Math.random() * 512;
            var y0 = Math.random() * 512;
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;
            var x2 = Math.random() * 512;
            var y2 = Math.random() * 512;
            var x3 = Math.random() * 512;
            var y3 = Math.random() * 512;
            var n = Math.random() * 100;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);

            data = hermiteCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
        case 13:
            var x0 = Math.random() * 512;
            var y0 = Math.random() * 512;
            var x1 = Math.random() * 512;
            var y1 = Math.random() * 512;
            var x2 = Math.random() * 512;
            var y2 = Math.random() * 512;
            var x3 = Math.random() * 512;
            var y3 = Math.random() * 512;
            var n = Math.random() * 100;

            colorValue = "#" + Math.floor(Math.random()*16777215).toString(16);

            data = bSplineCurve(x0, y0, x1, y1, x2, y2, x3, y3, n);
            break;
    }

    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(100, 0);
        ctx.bezierCurveTo(100, 100, 0, 0, 0, 100);
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(data.x[0], data.y[0]);
        for (var i = 0; i < data.length; i++) {
            ctx.lineTo(data.x[i], data.y[i]);
        }
        ctx.strokeStyle = colorValue;
        ctx.stroke();
    }
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