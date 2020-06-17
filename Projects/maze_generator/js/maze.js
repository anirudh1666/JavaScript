var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH = 800;
var DIFFICULTY_LEVEL = 0;

/* Constructor for cell. 
   @params = row : row cell is on.
             col : column cell is on.
             edges : paths to neighbours from this node.
             start_or_end : true if cell is start or end node.
             neighbours : array of unvisited neighbours.
*/
function Cell(row, col, edges, start_or_end, neighbours, visited) {

    this.row = row;
    this.col = col;
    this.edges = edges;
    this.start_or_end = start_or_end;
    this.neighbours = neighbours;
    this.visited = visited;

    // Used to get random unvisited neighbour.
    Cell.prototype.get_unvisited_neigh = function(maze) {

        var found = false;
        var ret = new Array();

        do {

            if (this.neighbours.length === 0) {
                return null;
            }

            var index = Math.floor((Math.random() * (this.neighbours.length - 1)) + 1);
            
            if (index === 1 && this.neighbours.length === 1) {
                // Index 0 is never reached because we add 1 when generating random.
                // so if array has length 1 and index is 0 it becomes index 1 which is out of bounds.
                // therefore we make it 0.
                index = 0;
            }

            ret = this.neighbours.splice(index, 1);

            if (maze[ret[0][0]][ret[0][1]].visited === false) {
                found = true;
            }
        } while (!found)
       
        // ret is an array of array. We want to return 1d array so we flatten it.
        ret = [].concat.apply([], ret);

        return ret;
    }

    // Add path from this to neighbour node at coordinates value.
    Cell.prototype.add_edge = function(value) {

        if (this.edges === undefined) {
            this.edges = [value];
        }
        else {
            this.edges.push(value);
        }
    }
}

/* Constructor for stack. Stack is used in the depth first search algorithm used to generate maze.
   You can implement the algorithm without Stack by using just array but good practice.
*/
function Stack() {

    this.stack = new Array();

    Stack.prototype.push = function(value) {
        this.stack.push(value);
    }
    Stack.prototype.pop = function() {
        return this.stack.pop();
    }
    Stack.prototype.empty = function() {
        return this.stack.length === 0;
    }
}


/* Call this function whenever you want to generate a maze. Does all the work.
*/
function init() {

    if (DIFFICULTY_LEVEL === 20) {
        // Reached max level.
        display_end();
    }

    /* Generate make with initially 8 wide and high. At each level increase difficulty
       by increasing the number of cells by 2. The last two coordinates at the end of maze
       at start and end cells.
    */
    var maze = make_maze(8 + 2 * DIFFICULTY_LEVEL, 8 + 2  * DIFFICULTY_LEVEL++);
    
    // Pop last two cells off into seperate array.
    var special_cells = get_special(maze);
   
    // Calculate cell height and cell width.
    var cell_dimensions = calc_dimensions(maze);
    draw_maze(maze, cell_dimensions);
   
    // Color start and end cells blue.
    color_special(special_cells, cell_dimensions);
}

/* Used to make maze harder or easier. Just increments or
   decrements difficulty level then calls init to draw maze.
   @params = harder_or_easier : 0 for harder 1 for easier.
*/
function regen(harder_or_easier) {

    var canvas = document.getElementById("my-maze");
    var context = canvas.getContext('2d');
    
    if (harder_or_easier === 0) {
        // Make maze harder with more cells.
        context.clearRect(0, 0, canvas.width, canvas.height);
        DIFFICULTY_LEVEL++;
        init();
    }
    else {
        if (DIFFICULTY_LEVEL === 1) {
            alert("Maze can't get any easier!");
        }
        else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            DIFFICULTY_LEVEL--;
            init();
        }
    }
}

/* This function goes through and generates a 2D array of Cells. This function
   doesn't actually generate the paths, it leaves it to build_paths to build the edges.
   @params = num_rows : number of rows.
             num_cols : number of columns.
   @returns = 2d array of cells. The last two cells are repeated cells. Start and end cells in that order.
*/
function make_maze(num_rows, num_cols) {

    var maze = new Array();

    for (var i = 0; i != num_rows; ++i) {
        // i = current row.
        var row = new Array();
        for (var j = 0; j != num_cols; ++j) {
            // j = current col.

            var neighbours = new Array();
            // Add all neighbours above, below, left and right that are not out of bounds.
            if (i + 1 < num_rows) {
                // [y+1,x] is in range.
                var temp = [i+1,j];
                neighbours.push(temp);
            }
            if (i - 1 >= 0) {
                // [y-1,x] is in range.
                var temp = [i-1,j];
                neighbours.push(temp);
            }
            if (j + 1 < num_cols) {
                // [y,x+1] is in range.
                var temp = [i,j+1];
                neighbours.push(temp);
            }
            if (j - 1 >= 0) {
                // [y,x-1] is in range.
                var temp = [i,j-1];
                neighbours.push(temp);
            }

            var cell = new Cell(i, j, undefined, false, neighbours, false);
            row.push(cell);
        }

        maze.push(row);
    }

    return build_paths(maze);
}

/* This function is responsible for adding edge information to each cell.
   It uses a depth first search algorithm to generate the maze.
*/
function build_paths(maze) {

    var start_cell = generate_start(maze.length, maze[0].length);
    var end_cell = generate_end(maze.length, maze[0].length, start_cell[2]);

    // Mark the cells as special cells.
    maze[start_cell[0]][start_cell[1]].start_or_end = true;
    maze[end_cell[0]][end_cell[1]].start_or_end = true;

    var stack = new Stack();
    stack.push(start_cell);
    var curr = maze[start_cell[0]][start_cell[1]];
    dfs(curr, stack, maze);

    // Push start and end cells to maze.
    maze.push(maze[start_cell[0]][start_cell[1]]);
    maze.push(maze[end_cell[0]][end_cell[1]]);

    return maze;
}

/* Works by first randomly picking a side to put start on. Then it randomly generates
   the coordinates.
   @params = num_rows : number of rows.
             num_cols : number of columns.
   @returns = 2d array [start, end, side].
*/
function generate_start(num_rows, num_cols) {

    var ret = new Array();
    // Randomly pick a side. 0 = top, left = 1, bottom = 2, right = 3.
    var side = Math.floor((Math.random() * 3) + 1);

    switch (side) {
        // topside. row = 0, column = random number.
        case 0 : ret.push(0); ret.push(Math.floor((Math.random() * (num_cols-1)) + 1)); ret.push(0); break;
        // leftside. row = random number, column = 0.
        case 1 : ret.push(Math.floor((Math.random() * (num_rows-1)) + 1)); ret.push(0); ret.push(1); break;
        // bottomside. row = num_rows - 1, column = random number.
        case 2 : ret.push(num_rows - 1); ret.push(Math.floor((Math.random() * (num_cols-1)) + 1)); ret.push(2); break;
        // rightside. row = random number, column = num_cols - 1.
        case 3 : ret.push(Math.floor((Math.random() * (num_rows-1)) + 1)); ret.push(num_cols - 1); ret.push(3); break;
        default : alert("Unable to generate start."); break;
    }

    return ret;
}

/* Works similarly to generate_start, the only difference is that is continually generates
   coordinatees until it gets coordinates that are on different sides.
*/ 
function generate_end(num_rows, num_cols, start_side) {

    var ret = new Array();
   
    do {
        ret = generate_start(num_rows, num_cols);
    } while (ret[3] === start_side);

    return ret;
}

/* Recursive depth first search using a stack. It works by popping off the stack
    and picking a random unvisited neighbour. If it doesn't have any you continue to
    the next cell by popping. Otherwise, you push neighbour and curr_cell to stack, mark neighbour as visited
    and add an edge from curr_cell to neigh_cell. Then continue. Repeat until stack is empty.
    The main downside with this algorithm is that it has a low branching factor and leads to long corridors.
    @params = curr : starting cell.
              stack : stack that will hold coordinates of cells.
              2maze : 2d array of cells in the maze.
*/
function dfs(curr, stack, maze) {

    curr.visited = true;
    while (!stack.empty()) {
        var curr = stack.pop();
        var curr_cell = maze[curr[0]][curr[1]];
    
        var unvisited_neigh = curr_cell.get_unvisited_neigh(maze);

        if (unvisited_neigh == null) {
            // No more neighbours left to visit.
            continue;
        }

        stack.push(curr);
        var neighbour = maze[unvisited_neigh[0]][unvisited_neigh[1]];

        curr_cell.add_edge(unvisited_neigh);
        neighbour.visited = true;
        stack.push(unvisited_neigh);
    }
}

// Pops last two cells off maze which are start and end cells.
function get_special(maze) {
    
    var end = maze.pop();
    var start = maze.pop();
    
    return [start, end];
}

/* Calculates the height and width of each cell in pixels.
   @params = maze : 2d array of cells.
   @returns = array with format [cell height, cell width, cell padding].
*/
function calc_dimensions(maze) {
    
    var num_cols = maze[0].length;
    var num_rows = maze.length;
    var cell_height = Math.floor(CANVAS_HEIGHT / num_rows);
    var cell_width = Math.floor(CANVAS_WIDTH / num_cols);
    var cell_padding = cell_width / 10;

    return [cell_height, cell_width, cell_padding];
}

/* Draws the maze onto the canvas. Paths are colored red
   while special cells are colored blue.
   @params = maze : 2d array of cells.
             cell_dimensions : array of format = [cell height, cell width, cell padding].
*/ 
function draw_maze(maze, cell_dimensions) {

    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    var start = [15, 15];
    var line_width = cell_dimensions[1] / 4;

    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = "Red";

    for (var i = 0; i != maze.length; ++i) {
        // i = current row.
        for (var j = 0; j != maze[0].length; ++j) {
            // j = current column.

            var cell_at = maze[i][j];

            if (!(cell_at.edges == null)) {
                // cell_at has edges to neighbours

                var path_to = cell_at.edges;
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

/* Colors the starting and finishing cell blue. 
   @params = special_cells : array = [starting cell, end cell]
             cell_dimensions : array = [cell_height, cell_width, cell_padding]
   */ 
function color_special(special_cells, cell_dimensions) {
    
    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    var line_width = cell_dimensions[1] / 4;
    var start = special_cells[0];
    var end = special_cells[1];
    var start_point = [15, 15];

    var start_x = start_point[1] + (start.col * cell_dimensions[1]);
    var start_y = start_point[0] + (start.row * cell_dimensions[0]) - line_width/2;
    var end_x = start_point[1] + (end.col * cell_dimensions[1]);
    var end_y = start_point[0] + (end.row * cell_dimensions[0]) - line_width/2;

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


function display_end() {
    // TODO
}


window.onload = init;