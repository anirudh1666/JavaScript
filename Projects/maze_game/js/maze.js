/* This file contains the code for generating the maze, 
   moving the character around the maze and also finding the path.
   The maze generation algorithm used is a recursive backtracking one
   (depth first search) and the algorithm to find the shortest path is 
   a breadth first search.

   This maze is NUM_ROWS_COLSxNUM_ROWS_COLS. Squares on canvas are 10x10 with cells inside them that
   are 8x8. The left over space is used as walls between unconnected cells.
   Canvas height and width is 800x800.
*/

var NUM_ROWS_COLS = 25;       // Make this 1 less than the number you want since 0 is included.
var cell_dim;
var cell_padding;
var line_width;
var start;
var end;
var maze;
var player_pos;

/* Constructor for class Node. 
   @params = row : row number.
             col : column number.
             edges : paths to neighbouring cells. 
*/
function Node(row, col, edges, neighbours) {

    this.row = row;
    this.col = col;
    this.edges = edges;
    this.neighbours = neighbours;
    this.visited = false;     // True if node has been visited already.
    
    /* Returns a randomly selected adjacent node to node this. 
       The node must not already be visited.
       @params = maze : maze 
       @returns = random unvisited neighbouring node.
    */
    Node.prototype.get_unvisited_neigh = function(maze) {

        var found = false;
        var ret = new Array();

        do {

            if (this.neighbours.length === 0) {
                return null;
            }

            var index = Math.floor(Math.random() * (this.neighbours.length + 1));
            while (index >= this.neighbours.length) {
                index = Math.floor(Math.random() * (this.neighbours.length + 1));
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

    /* Adds an edge to node given as param.
       @params = node : node to add edge to.
    */
    Node.prototype.add_edge = function(node) {

        if (this.edges === undefined) {
            this.edges = [node];
        }
        else {
            this.edges.push(node);
        }
    }
}

/* Constructor for class Stack. We use it instead of using 
   recursion. 
*/
function Stack() {

    this.stack = new Array();

    Stack.prototype.push = function(value) {
        this.stack.push(value);
    }

    Stack.prototype.pop = function() {
        return this.stack.pop();
    }

    // @returns = true if stack is empty.
    Stack.prototype.empty = function() {
        return this.stack.length === 0;
    }
}

/* Calls all the relevant functions to build the maze and control
   the character.
*/
function init() {

    cell_dim = Math.floor(800 / NUM_ROWS_COLS);
    cell_padding = cell_dim / 10;
    line_width = cell_dim / 4;
    maze = build_maze();
    start = choose_start();
    end = choose_end(start);
    var stack = new Stack();
    stack.push(start);
    var current = maze[start[0]][start[1]];
    dfs(current, stack, maze);
    draw_maze(maze);
    color_start_end(start, end);
    init_player();
}

/* Builds a maze with NUM_ROWS_COLS rows and columns. The maze is represented as a 
   2D array of nodes where the index of the node is the same as the index of
   the node in the canvas. E.g. node at row 2 col 3 is row 2 col 3 on canvas as well.
*/
function build_maze() {

    var maze = new Array();
    for (var i = 0; i != NUM_ROWS_COLS; ++i) {
        // i = curr row.
        var row = new Array();
        for (var j = 0; j != NUM_ROWS_COLS; ++j) {
            // j = curr column.
            var neighbours = new Array();
            
            // Add all neighbours above, below, left and right that are not out of bounds.
            if (i + 1 < NUM_ROWS_COLS) {
                // [y+1,x] is in range.
                var temp = [i+1,j];
                neighbours.push(temp);
            }
            if (i - 1 >= 0) {
                // [y-1,x] is in range.
                var temp = [i-1,j];
                neighbours.push(temp);
            }
            if (j + 1 < NUM_ROWS_COLS) {
                // [y,x+1] is in range.
                var temp = [i,j+1];
                neighbours.push(temp);
            }
            if (j - 1 >= 0) {
                // [y,x-1] is in range.
                var temp = [i,j-1];
                neighbours.push(temp);
            }
            
            var node = new Node(i, j, undefined, neighbours);
            row.push(node);
        }

        maze.push(row);
    }

    return maze;
}


/* Depth first search algorithm implemented using a stack.
   @params = current : node we are at.
             stack : current stack.
             maze : 2D array of nodes.
*/ 
function dfs(current, stack, maze) {

    current.visited = true;
    while (!stack.empty()) {
        var current = stack.pop();
        var curr_node = maze[current[0]][current[1]];
        
        var unvisited_neigh = curr_node.get_unvisited_neigh(maze);

        if (unvisited_neigh == null) {
            // No more unvisited neighbours.
            continue;
        }

        stack.push(current);
        var neighbour = maze[unvisited_neigh[0]][unvisited_neigh[1]];
        
        curr_node.add_edge(neighbour);
        neighbour.visited = true;
        stack.push(unvisited_neigh);
    }
}

/* Selects start node randomly and returns it.
   @returns = row num and col num of starting node in the format [row, col, side]
*/
function choose_start() {

   var ret = new Array();
   var side = generate_random(3)

   switch (side) {
       // 0 = top side. Row must be row 0 column is random.
       case 0 : ret.push(0); ret.push(generate_random(NUM_ROWS_COLS - 1)); ret.push(0); break;
       // 1 = right side. Column must be NUM_ROWS_COLS and row is random.
       case 1 : ret.push(generate_random(NUM_ROWS_COLS - 1)); ret.push(NUM_ROWS_COLS - 1); ret.push(1); break;
       // 2 = bottom side. Row must be NUM_ROWS_COLS and column is random.
       case 2 : ret.push(NUM_ROWS_COLS - 1); ret.push(generate_random(NUM_ROWS_COLS - 1)); ret.push(2); break;
       // 3 = left side. Column must be 0 and row is random.
       case 3 : ret.push(generate_random(NUM_ROWS_COLS - 1)); ret.push(0); ret.push(3); break;
   }

   return ret;
}

/* Picks last node in path randomly and returns it. However, this node must 
   be on the opposite side to start node to make sure the maze isn't too easy.
   @returns = end node in format [row, col, side].
*/
function choose_end(start) {

    var ret = new Array();
    switch (start[2]) {
        // Start is on topside so end is on bottom.
        case 0 : ret.push(NUM_ROWS_COLS - 1); ret.push(generate_random(NUM_ROWS_COLS)); ret.push(2); break;
        // Start is right side so end is on left.
        case 1 : ret.push(generate_random(NUM_ROWS_COLS)); ret.push(0); ret.push(3); break;
        // Start is on bottom so end is on top.
        case 2 : ret.push(0); ret.push(generate_random(NUM_ROWS_COLS)); ret.push(0); break;
        // Start is on left so end is on right.
        case 3 : ret.push(generate_random(NUM_ROWS_COLS)); ret.push(NUM_ROWS_COLS - 1); ret.push(1); break;
    }

    return ret;
}

/* Generates random number from 0 - limit including both in range.
   @returns = random int.
*/
function generate_random(limit) {

    var ret = Math.floor(Math.random() * (limit + 1));
    while (ret >= limit) {
        // Sometimes number generated is == limit. 
        ret = Math.floor(Math.random() * (limit + 1));
    }

    return ret
}

/* Draws the maze on the canvas. 
   @params = maze : 2D array of nodes.
*/
function draw_maze(maze) {

    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    var start = [20,20];

    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = "White";

    for (var i = 0; i != NUM_ROWS_COLS; ++i) {
        // i = current row.
        for (var j = 0; j != NUM_ROWS_COLS; ++j) {
            // j = current column.

            var at = maze[i][j];

            if (!(at.edges === undefined)) {
                var path_to = at.edges;
                var x_coord = start[1] + (j * cell_dim);
                var y_coord = start[0] + (i * cell_dim);

                for (var k = 0; k != path_to.length; ++k) {
                    var neigh = path_to[k];
                    var neigh_x = start[1] + (neigh.col * cell_dim);
                    var neigh_y = start[0] + (neigh.row * cell_dim);
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

/* Colors start and end nodes blue.
   @params = start and end node row num and col number in format [row, col]
*/
function color_start_end(start, end) {

    var canvas = document.getElementById("my-maze");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = "Blue";

    var start_x = 20 + (start[1] * cell_dim);
    var start_y = 20 + (start[0] * cell_dim) - line_width/2;
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(start_x, start_y + (line_width * 1.3));
    ctx.stroke();

    var end_x = 20 + (end[1] * cell_dim);
    var end_y = 20 + (end[0] * cell_dim) - line_width/2;
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(end_x, end_y + (line_width * 1.3));
    ctx.stroke();
}

/* This function draws the initial position of player as a red circle
   at starting cell.
*/
function init_player() {

    var canvas = document.getElementById("player");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "Red";
    
    var radius = line_width/3;
    player_pos = [start[0],start[1]];        // Represents current position of player. 
    var start_x = 20 + (start[1] * cell_dim);
    var start_y = 20 + (start[0] * cell_dim);
    ctx.arc(start_x, start_y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/* Call this function when left button is pressed. First check if player can move left.
   Then remove the cell and circle at player_pos, redraw the cell and draw new circle at new position.
   Lastly, update player pos to represent new position.
   @params = direction : {up = 1, down = 3, left = 0, right = 2}
*/
function move(direction) {

    if (check_valid_movement(direction)) {
        move_player(direction, line_width/3);
        update_pos(direction);
        check_if_finished();
    }
}


/* Checks if there is an edge from position player is on and the node 
   in the direction of the key pressed. If there is no edge then there is no path 
   and function returns false.
   @params = key : key pressed from {up = 1, down = 3, left = 0, right = 2}
   @returns = true if player can move in that direction else false.
*/
function check_valid_movement(key) {

    var ret;
    
    switch (key) {
        case 0:
            // left key.
            var curr = maze[player_pos[0]][player_pos[1]];
            var node_to_move_to = maze[player_pos[0]][player_pos[1] - 1];
            ret = check_movement(curr, node_to_move_to);
            break;
        case 1:
            // up key.
            var curr = maze[player_pos[0]][player_pos[1]];
            var node_to_move_to = maze[player_pos[0]-1][player_pos[1]];
            ret = check_movement(curr, node_to_move_to);
            break;
        case 2:
            // right key.
            var curr = maze[player_pos[0]][player_pos[1]];
            var node_to_move_to = maze[player_pos[0]][player_pos[1] + 1];
            ret = check_movement(curr, node_to_move_to);
            break;
        case 3:
            // down key.
            var curr = maze[player_pos[0]][player_pos[1]];
            var node_to_move_to = maze[player_pos[0]+1][player_pos[1]];
            ret = check_movement(curr, node_to_move_to);
            break;
    }

    return ret;
}

/* Axuiliary function for check_valid_movement. Helps to not repeat myself
   for each switch case.
*/
function check_movement(curr, node_to_move_to) {

    if (curr.edges !== undefined) {
        for (var i = 0; i != curr.edges.length; ++i) {
            if (curr.edges[i] === node_to_move_to) {
                return true;
            }
        }
    }

    if (node_to_move_to.edges !== undefined) {
        for (var i = 0; i != node_to_move_to.edges.length; ++i) {
            if (node_to_move_to.edges[i] === curr) {
                return true;
            }
        }
    }
    return false;
}

/* Redraws the player circle and moves it. 
   @params = player_pos : current position of player in format [row, col].
             key : key pressed from {up = 1, down = 3, left = 0, right = 2}.
             radius : radius of circle.
*/
function move_player(key, radius) {

    // First we remove the cell that the circle is in. Then we redraw that cell 
    // then draw the circle at its new position.
    var canvas = document.getElementById("player");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();

    var player_x = 20 + (player_pos[1] * cell_dim);
    var player_y = 20 + (player_pos[0] * cell_dim);
    ctx.clearRect(player_x - radius, player_y - radius, 40, 40);

    ctx.fillStyle = "Red";
    // now draw circle at new pos
    switch (key) {
        case 0:
            // left
            var x = 20 + ((player_pos[1] - 1) * cell_dim);
            ctx.arc(x, player_y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 1:
            // up
            var y = 20 + ((player_pos[0] - 1) * cell_dim);
            ctx.arc(player_x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 2:
            // right
            var x = 20 + ((player_pos[1] + 1) * cell_dim);
            ctx.arc(x, player_y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 3:
            // down
            var y = 20 + ((player_pos[0] + 1) * cell_dim);
            ctx.arc(player_x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

/* Updates player_pos to represent where the new circle is.
   @params = key : {0 = left, 1 = up, 2 = right, 3 = down}
            player_pos : [row, col] we update it and reutrn it.
   @returns = updated player_pos.
*/
function update_pos(key) {
    
    switch (key) {
        case 0:
            // left.
            player_pos[1] -= 1;
            break;
        case 1:
            // up
            player_pos[0] -= 1;
            break;
        case 2:
            // right
            player_pos[1] += 1;
            break;
        case 3:
            // down
            player_pos[0] += 1;
            break;
    }

    return player_pos;
}

/* Checks if player_pos === end. If true then maze is completed and display completion message.
*/
function check_if_finished() {
    
    if (player_pos[0] === end[0] && player_pos[1] === end[1]) {
        alert('Congratulations on completing the maze! Refresh to try a new one.');
    } 
}

function change_diff(inc_or_dec) {

    var canvas_maze = document.getElementById("my-maze");
    var canvas_player = document.getElementById("player");
    var ctx_maze = canvas_maze.getContext("2d");
    var ctx_player = canvas_player.getContext("2d");

    ctx_maze.clearRect(0, 0, canvas_maze.width, canvas_maze.height);
    ctx_player.clearRect(0, 0, canvas_player.width, canvas_player.height);

    if (inc_or_dec === 1) {
        // increase difficulty by adding 5 to NUM_ROWS_COLS.
        if (NUM_ROWS_COLS + 5 <= 35) {
            NUM_ROWS_COLS += 5;
            init();
        }
        else {
            alert("Reached maximum difficulty.");
        }
    }
    else if (inc_or_dec === 0) {
        if (NUM_ROWS_COLS - 5 >= 20) {
            NUM_ROWS_COLS -= 5;
            init();
        }
        else {
            alert("Reached minimum difficulty.");
        }
    }
    else {
        init();
    }
}

// When you load index.html, call init().
window.onload = init;