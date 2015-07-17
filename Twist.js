"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 0;

var ratio = 1;

var gasketCheck = 0;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(4, 8), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	    document.getElementById("slider1").onchange = function() {
        ratio = event.srcElement.value;
        render();
    };
	
	    document.getElementById("slider2").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
        render();
    };

    render();
};

function handleClick(cd) {
    gasketCheck = cd.checked;
    render();
};

function twist( a )
{
	var dist = ratio*Math.sqrt(a[0]*a[0] + a[1]*a[1]);
	var temp1 = a[0]*Math.cos(dist*1) - a[1]*Math.sin(dist*1);
	var temp2 = a[0]*Math.sin(dist*1) + a[1]*Math.cos(dist*1);
	var temp = [temp1, temp2];
	return temp;
}

function triangle( a, b, c )
{
    points.push( twist(a), twist(b), twist(c) );
}

function divideTriangle( a, b, c, count, gasketCheck )
{

    // check for end of recursion

    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count, gasketCheck );
        divideTriangle( c, ac, bc, count, gasketCheck );
        divideTriangle( b, bc, ab, count, gasketCheck );
		if ( !gasketCheck ) divideTriangle(ab, bc, ac, count, gasketCheck );
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2( -0.85, -0.5 ),
        vec2(  0,  1 ),
        vec2(  0.85, -0.5 )
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide, gasketCheck );

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}
