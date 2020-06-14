/* The maze in the init() function has already been created by the
   backend and I manually initialize it in the function. In the actual
   implementation the backend will generate a unique maze and send it to this
   code which will draw it. This code will also be refactored to use less space
   and run faster in actual implementation.
*/


var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH = 800;

function maze() {

    // Set up 2d array of nodes containing info about path and maze.
    var maze = init();

    // Get start and ending cell row and column numbers.
    var special_cells = get_special();

    // Calculate the width and height of each cell in the maze.
    var cell_dimensions = calc_dimensions(maze);

    // Draw the maze on canvas.
    draw_maze(maze, cell_dimensions);

    // Color start or end cells blue.
    color_special(special_cells, cell_dimensions);
}

/* This is a constructor for Node object. It holds information
   about the cell column and row number and paths it has to neighbouring
   nodes. start_or_end is bool value telling us if it is start or end.
*/
function Node(cell_row, cell_col, edges, start_or_end) {

    this.cell_row = cell_row;
    this.cell_col = cell_col;
    this.edges = edges;
    this.start_or_end = start_or_end;
}

/* Manually initialize array. In actual program this function receives
   details from Java backend. It would receive number of columns in each row
   and the number of rows. It would also receive an arraylist of nodes.
   maze[row][col].
*/
function init() {

    var maze = new Array();
    for (var i = 0; i != 8; ++i) {
        maze[i] = new Array();
    }

    // manually create nodes.
    var node0 = new Node(0, 0, null, false);
    var node1 = new Node(0, 1, [[1,1]], false);
    var node2 = new Node(0, 2, [[0,1]], false);
    var node3 = new Node(0, 3, [[0,4],[0,2]], true);
    var node4 = new Node(0, 4, [[1,4],[0,5]], false);
    var node5 = new Node(0, 5, [[0,6]], false);
    var node6 = new Node(0, 6, [[0,7]], false);
    var node7 = new Node(0, 7, null, false);
    var node8 = new Node(1, 0, [[2,0],[0,0]], false);
    var node9 = new Node(1, 1, [[1,0]], false);
    var node10 = new Node(1, 2, [[1,3]], false);
    var node11 = new Node(1, 3, [[0,3]], false);
    var node12 = new Node(1, 4, null, false);
    var node13 = new Node(1, 5, [[2,5]], false);
    var node14 = new Node(1, 6, [[1,5]], false);
    var node15 = new Node(1, 7, [[1,6]], true);
    var node16 = new Node(2, 0, [[2,1]], false);
    var node17 = new Node(2, 1, [[3,1]], false);
    var node18 = new Node(2, 2, [[1,2]], false);
    var node19 = new Node(2, 3, [[2,2]], false);
    var node20 = new Node(2, 4, [[2,3]], false);
    var node21 = new Node(2, 5, [[2,6]], false);
    var node22 = new Node(2, 6, [[3,6]], false);
    var node23 = new Node(2, 7, null, false);
    var node24 = new Node(3, 0, null, false);
    var node25 = new Node(3, 1, [[3,2]], false);
    var node26 = new Node(3, 2, [[3,3]], false);
    var node27 = new Node(3, 3, [[4,3]], false);
    var node28 = new Node(3, 4, [[3,5],[2,4]], false);
    var node29 = new Node(3, 5, [[4,5]], false);
    var node30 = new Node(3, 6, [[3,7]], false);
    var node31 = new Node(3, 7, [[2,7], [4,7]], false);
    var node32 = new Node(4, 0, [[3,0]], false);
    var node33 = new Node(4, 1, [[5,1]], false);
    var node34 = new Node(4, 2, [[4,1]], false);
    var node35 = new Node(4, 3, [[4,2]], false);
    var node36 = new Node(4, 4, [[3,4]], false);
    var node37 = new Node(4, 5, [[4,6]], false);
    var node38 = new Node(4, 6, [[5,6]], false);
    var node39 = new Node(4, 7, [[5,7]], false);
    var node40 = new Node(5, 0, [[4,0]], false);
    var node41 = new Node(5, 1, [[6,1]], false);
    var node42 = new Node(5, 2, [[5,3]], false);
    var node43 = new Node(5, 3, [[6,3]], false);
    var node44 = new Node(5, 4, [[4,4]], false);
    var node45 = new Node(5, 5, null, false);
    var node46 = new Node(5, 6, [[5,5]], false);
    var node47 = new Node(5, 7, [[6,7]], false);
    var node48 = new Node(6, 0, [[5,0]], false);
    var node49 = new Node(6, 1, [[7,1]], false);
    var node50 = new Node(6, 2, [[5,2]], false);
    var node51 = new Node(6, 3, [[7,3]], false);
    var node52 = new Node(6, 4, [[5,4]], false);
    var node53 = new Node(6, 5, [[6,4]], false);
    var node54 = new Node(6, 6, [[6,5]], false);
    var node55 = new Node(6, 7, [[7,7]], false);
    var node56 = new Node(7, 0, [[6,0]], false);
    var node57 = new Node(7, 1, [[7,2],[7,0]], false);
    var node58 = new Node(7, 2, [[6,2]], false);
    var node59 = new Node(7, 3, [[7,4]], false);
    var node60 = new Node(7, 4, [[7,5]], false);
    var node61 = new Node(7, 5, null, false);
    var node62 = new Node(7, 6, [[6,6]], false);
    var node63 = new Node(7, 7, [[7,6]], false);

    // manually add nodes.
    maze[0][0] = node0;
    maze[0][1] = node1;
    maze[0][2] = node2;
    maze[0][3] = node3;
    maze[0][4] = node4;
    maze[0][5] = node5;
    maze[0][6] = node6;
    maze[0][7] = node7;
    maze[1][0] = node8;
    maze[1][1] = node9;
    maze[1][2] = node10;
    maze[1][3] = node11;
    maze[1][4] = node12;
    maze[1][5] = node13;
    maze[1][6] = node14;
    maze[1][7] = node15;
    maze[2][0] = node16;
    maze[2][1] = node17;
    maze[2][2] = node18;
    maze[2][3] = node19;
    maze[2][4] = node20;
    maze[2][5] = node21;
    maze[2][6] = node22;
    maze[2][7] = node23;
    maze[3][0] = node24;
    maze[3][1] = node25;
    maze[3][2] = node26;
    maze[3][3] = node27;
    maze[3][4] = node28;
    maze[3][5] = node29;
    maze[3][6] = node30;
    maze[3][7] = node31;
    maze[4][0] = node32;
    maze[4][1] = node33;
    maze[4][2] = node34;
    maze[4][3] = node35;
    maze[4][4] = node36;
    maze[4][5] = node37;
    maze[4][6] = node38;
    maze[4][7] = node39;
    maze[5][0] = node40;
    maze[5][1] = node41;
    maze[5][2] = node42;
    maze[5][3] = node43;
    maze[5][4] = node44;
    maze[5][5] = node45;
    maze[5][6] = node46;
    maze[5][7] = node47;
    maze[6][0] = node48;
    maze[6][1] = node49;
    maze[6][2] = node50;
    maze[6][3] = node51;
    maze[6][4] = node52;
    maze[6][5] = node53;
    maze[6][6] = node54;
    maze[6][7] = node55;
    maze[7][0] = node56;
    maze[7][1] = node57;
    maze[7][2] = node58;
    maze[7][3] = node59;
    maze[7][4] = node60;
    maze[7][5] = node61;
    maze[7][6] = node62;
    maze[7][7] = node63;

    return maze;
}


function get_special() {

    return [[0, 3], [1, 7]];
}


function calc_dimensions(maze) {

    var num_cols = maze[0].length;
    var num_rows = maze.length;
    var cell_height = Math.floor(CANVAS_HEIGHT / num_rows);
    var cell_width = Math.floor(CANVAS_WIDTH / num_cols);
    var cell_padding = cell_width / 10;

    return [cell_height, cell_width, cell_padding];
}

/* cell_dimenions = [cell_height, cell_width, cell_padding]
*/
function draw_maze(maze, cell_dimensions) {

    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    var start = [50, 50];
    var line_width = cell_dimensions[1] / 4;

    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = "Red";

    for (var i = 0; i != maze.length; ++i) {
        // i = row number.
        for (var j = 0; j != maze[0].length; ++j) {
            // j = col number.
            var node_at = maze[i][j];

            if (!(node_at.edges === null)) {
                // node_at has paths to neighbouring nodes.
                var path_to = node_at.edges;
                var x_coord = start[1] + (j * cell_dimensions[1]);
                var y_coord = start[0] + (i * cell_dimensions[0]);

                for (var k = 0; k != path_to.length; ++k) {
                    // Iterate through each edge.
                    var neigh_node = path_to[k];
                    var neigh_x = start[1] + (neigh_node[1] * cell_dimensions[1]);
                    var neigh_y = start[0] + (neigh_node[0] * cell_dimensions[0]);

                    ctx.moveTo(x_coord, y_coord);

                    if (neigh_x === x_coord && neigh_y > y_coord) {
                        // Moving vertically down.
                        ctx.lineTo(neigh_x, neigh_y + line_width/2);

                    }
                    else if (neigh_x === x_coord && neigh_y < y_coord) {
                        // Moving vertically up.
                        ctx.lineTo(neigh_x, neigh_y - line_width/2);
                    }
                    else if (neigh_y === y_coord && neigh_x > x_coord) {
                        // Moving horizontally to the right.
                        ctx.lineTo(neigh_x + line_width/2, neigh_y);
                    }
                    else {
                        // Moving horizontally to the left.
                        ctx.lineTo(neigh_x - line_width/2, neigh_y);
                    }

                    ctx.stroke();
                }
            }
        }
    }
}


function color_special(special_cells, cell_dimensions) {

    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    var line_width = cell_dimensions[1] / 4;
    var start = special_cells[0];
    var end = special_cells[1];
    var start_point = [50, 50];

    var start_x = start_point[1] + (start[1] * cell_dimensions[1]);
    var start_y = start_point[0] + (start[0] * cell_dimensions[0]) - line_width/2;
    var end_x = start_point[1] + (end[1] * cell_dimensions[1]);
    var end_y = start_point[0] + (end[0] * cell_dimensions[0]) - line_width/2;

    alert("End_x: " + end_x);
    alert("End_y: " + end_y);

    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = "Blue";
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(start_x, start_y + line_width);
    ctx.stroke();

    ctx.moveTo(end_x, end_y);
    ctx.lineTo(end_x, end_y + line_width);
    ctx.stroke();
} 

