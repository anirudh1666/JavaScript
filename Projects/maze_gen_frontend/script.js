/* The maze used here is already generated. This is because this isnt
   the actual maze generator game. This is only the frontend. Maze is 8x8.
*/

var HEIGHT = 500;
var WIDTH = 700;
var CELL_HEIGHT = 60;
var CELL_WIDTH = 80;
var board = new Array();

function maze() {
  
    init();
    make_maze();
}

function init() {

    var canvas = document.getElementById("my-maze");
    var context = canvas.getContext("2d");
    context.beginPath();
    context.strokeStyle = "white";
    context.moveTo(10, 30);

    for (var i = 10; i <= HEIGHT - 10; i += CELL_HEIGHT) {
        // i counts rows.

        for (var j = 30; j != WIDTH - 30; j += CELL_WIDTH) {
            // j counts columns.
            context.lineTo(j, i);
            context.stroke();
        }
    }
}


function make_maze() {
    
    // TODO.
}