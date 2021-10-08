window.onload = set_up;
PIXI.utils.sayHello();
var app = new PIXI.Application({width:window.innerWidth, height:window.innerHeight});
var maze;
var start;
var end;
var events_attached = false;     // true if we have attached movement events to keys otherwise false. Allows us to recreate mazes without having to re-attach
var completed = false;
var difficulty = 0;
var last_algo = -1;

/*
    Auxiliary function used to generate a random integer from 0 to max - 1.

    @params max : specifies the maximum (exclusive) integer in range.
    @returns random integer in range 0 - (max -1)
*/
function generate_random(max) {

    return Math.floor(Math.random() * max);
}


/* 
    Nodes are used to build up mazes. Each maze is represented as 
    nodes with edges to each other. 
    
    @params x : the column that this node is in.
    @params y : the row that this node is in.
    @params set : the set that this node is in.
*/
class Node {

    constructor(x, y, set) {

        this.x = x; 
        this.y = y;
        this.set = set;
        this.visited = false;              // flag if visited. For Kruskals alg.
        this.edges = undefined;            // array of edges to nodes.
        this.in_frontier = false;          // flag if it is in frontier. For Prims alg.
    }

    /*
    Adds nodes_to to the list of edges for current node instance.

    @params node_to : node that this node instance has an edge to.
    */
    add_edge(node_to) {

        if (this.edges == undefined) {
            this.edges = [node_to];
        } 
        else {
            this.edges.push(node_to);
        }

        if (node_to.edges == undefined) {
            node_to.edges = [this];
        }
        else {
            node_to.edges.push(this);
        }
    }

    /*
    Updates the set for all nodes reachable from this node instance by traversing edges.

    @params set: set that the nodes should be changed to.
    */
    update_sets(set) {

        if (this.set == set) { return; }
        this.set = set;
        if (this.edges != undefined) {
            this.edges.forEach(element => element.update_sets(set));
        }
    }

    /*
    Used to pick a random neighbour from this node instance. If all neighbours are visited then 
    we return null.

    @params maze: 2D array of nodes representing the maze.
    @returns unvisited neighbour or null if all are visited.
    */
    get_unvisited_neigh(maze) {
        
        var visited_top = false;
        var visited_left = false;
        var visited_right = false;
        var visited_bottom = false;
        while (true) {
            var random = generate_random(4);
            switch (random) {
                // case 0: check if node directly above is unvisited and in bounds.
                case 0: 
                    if ((this.y - 1 >= 0) && !maze[this.y - 1][this.x].visited) { 
                        return maze[this.y - 1][this.x]; 
                    } 
                    else { 
                        visited_top = true; 
                        if (visited_top && visited_bottom && visited_left && visited_right) { return null; }
                        continue; 
                    }
                // case 1: check if node to the right is unvisited and in bounds.
                case 1: 
                    if ((this.x + 1 < maze[0].length) && !maze[this.y][this.x + 1].visited) { 
                        return maze[this.y][this.x + 1]; 
                    } 
                    else { 
                        visited_right = true; 
                        if (visited_top && visited_bottom && visited_left && visited_right) { return null; }
                        continue; 
                    }
                // case 2: check if node below is unvisited and in bounds.
                case 2: 
                    if ((this.y + 1 < maze.length) && !maze[this.y + 1][this.x].visited) { 
                        return maze[this.y + 1][this.x]; 
                    } 
                    else { 
                        visited_bottom = true;
                        if (visited_top && visited_bottom && visited_left && visited_right) { return null; }
                        continue; 
                    }
                // case 3: check if node to the left is unvisited and in bounds.
                case 3: 
                    if ((this.x - 1 >= 0) && !maze[this.y][this.x - 1].visited) { 
                        return maze[this.y][this.x - 1]; 
                    } 
                    else { 
                        visited_left = true;
                        if (visited_top && visited_bottom && visited_left && visited_right) { return null; }
                        continue; 
                    }
            }
        }
    }
}

function set_up() {

    // set up canvas and PixiJS
    app.renderer.view.style.position = "absolute";
    document.body.appendChild(app.view);
    var text = new PIXI.Text("Welcome to Anirudh's Maze Game!\n\nPress K to use Kruskal's\nPress R to use Recursive Backtracker\nPress P to use Prim's"
                             + "\nPress H to increase difficulty.\nPress E to reduce difficulty.",
                            {
                                fontFamily : "Times New Roman",
                                fontSize : 40,
                                stroke : "white",
                                strokeThickness: 3,
                                align : "center"
                            });
    text.x = (window.innerWidth - text.width) / 2;
    text.y = (window.innerHeight - text.height) / 2;
    app.stage.addChild(text);

    window.addEventListener("keydown", function(event) {
        if (event.defaultPrevented) {
            return;
        }

        switch (event.code) {
            case "KeyK" : last_algo = 1; create(1); break;
            case "KeyP" : last_algo = 2; create(2); break;
            case "KeyR" : last_algo = 3; create(3); break;
            case "KeyH" : 
                if (difficulty < 2) { difficulty++; }
                else { alert("Reached maximum difficulty"); }
                create(last_algo); 
                break;
            case "KeyE" : 
                if (difficulty > 0) { difficulty--; }
                else { alert("Reached minimum difficulty"); }
                create(last_algo);
                break;
        }
    });
}

function create(algo) {
    
    // clear stage.
    for (var i = app.stage.children.length - 1; i >= 0; --i) {
        app.stage.children[i].destroy();
    }
    app.loader.reset();       // get rid of existing sprite
    completed = false;

    // useful variables
    var num_rows = 15 + 5 * difficulty;               // starting difficulty is 15. Highest is 25
    var num_cols = 30 + 5 * difficulty;               // starting is 30. highest is 30
    maze = generate_maze(num_rows, num_cols);       // maze is 2D array of nodes
    var special = generate_special_cells(maze);
    start = special[0];
    end = special[1];

    // building the structure of the maze
    if (algo == 1) {
        kruskals(maze, start);
    } else if (algo == 2) {
        prims(maze, start);
    } else {
        dfs(maze, start);
    }

    // drawing the player and maze
    render_maze(maze, start, end);
    app.loader.add("player", "http://localhost:8000/retro_character_sprite_sheet.png");   // load sprite sheet
    app.loader.load(() => {
        var cell_height = window.innerHeight / maze.length;
        var cell_width = window.innerWidth /  maze[0].length;
        var player_sheet = create_player_sheet();
        var player = create_player(player_sheet, cell_height, cell_width);
        app.stage.addChild(player);
        player.play();

        var speed = 6;       // indicates speed of sprite
        var canvas = app.renderer.plugins.extract.canvas(app.stage);
        var ctx = canvas.getContext("2d");
        // controlling player movement.
        window.addEventListener("keydown", function(event) {

            // handle keyboard movement
            if (!events_attached && event.defaultPrevented) {
                // prevent default action of key. E.g., pressing down wont scroll down. 
                // when the maze is re-generated, we do not want to prevent default behaviour since it is now player movement.
                // by setting events_attached flag to true we are saying do not prevent default behaviour in the future
                events_attached = true;
                return;
            }

            /* We can find out if the movement is valid by checking to see what color pixel our sprite is on. We plot two points
               with their location dependant on the direction of movement. For example, if we are moving down, we plot two points
               at the bottom of the sprite with one on the left hand side and the other on the right. If either of them are on black,
               then it is an invalid movement. 

               Calculating the position of the points is a bit tricky because the anchor is set to the middle of the sprite but it is 
               still a little to the bottom right. This means we have to offset it a bit more for moving top and left.
            */
            switch (event.code) {
                case "ArrowDown": 
                    event.preventDefault();

                    if (check_invalid_movement(player.x - player.width, player.y, player.x - player.width / 2, player.y, ctx)) { break; }

                    if (!player.playing) {
                        // to make animation more smooth. If animation is already playing skip.
                        player.textures = player_sheet.walk_south;
                        player.play();
                    }
                    player.y += speed;

                    break;
                case "ArrowUp": 
                    event.preventDefault();

                    if (check_invalid_movement(player.x - player.width, player.y - player.height, player.x - player.width / 2, player.y - player.height, ctx)) { break; }

                    if (!player.playing) {
                        player.textures = player_sheet.walk_north;
                        player.play();
                    }
                    player.y -= speed;

                    break;
                case "ArrowLeft": 
                    event.preventDefault(); 

                    if (check_invalid_movement(player.x - player.width, player.y - player.height / 5, player.x - player.width, player.y - player.height * 4/5, ctx)) { break; }

                    if (!player.playing) {
                        player.textures = player_sheet.walk_west;
                        player.play();
                    }
                    player.x -= speed;

                    break;
                case "ArrowRight": 
                    event.preventDefault();

                    if (check_invalid_movement(player.x, player.y - player.height / 5, player.x, player.y - player.height * 4/5, ctx)) { break; }

                    if (!player.playing) {
                        player.textures = player_sheet.walk_east;
                        player.play();
                    }
                    player.x += speed;

                    break;
            }
        });
    });
}

/**
 * This function gets the pixel RGB value from the (p1_x, p1_y) & (p2_x, p2_y)
 * co-ordinates. If either of them are black, then we cannot move there and return false.
 * If it is red, then we have finished and we throw alert.
 * 
 * @param {*} p1_x x co-ordinate of first point.
 * @param {*} p1_y y co-ordinate of first point
 * @param {*} p2_x x co-ordinate of second point
 * @param {*} p2_y y co-ordinate of second point
 * @param {*} ctx canvas context
 * @returns true if invalid movement otherwise false.
 */
function check_invalid_movement(p1_x, p1_y, p2_x, p2_y, ctx) {

    var pixel1 = ctx.getImageData(p1_x, p1_y, 1, 1).data;          // returns 4 element array of format = [R, G, B, A]
    var pixel2 = ctx.getImageData(p2_x, p2_y, 1, 1).data;

    if ((array_equals(Array.from(pixel1), [255,0,0,255]) && array_equals(Array.from(pixel2), [255,0,0,255])) && !completed) {
        // [255, 0, 255] = red
        alert("Congratulations on completing the maze! Press P, K, or R to generate a new maze.");
        completed = true;
        return false;
    }
    
    // [0, 0, 0, 0] = black. We have to convert pixel UInt8ClampedArray to Array otherwise equality fails.
    return array_equals(Array.from(pixel1), [0,0,0,0]) || array_equals(Array.from(pixel2), [0,0,0,0]);
}

/**
 * Checks for equality between arrays.
 * 
 * @param {*} a first array
 * @param {*} b second array
 * @returns true if first array == second array
 */
function array_equals(a, b) {

    return a.length == b.length && a.every((val, index) => val == b[index]);
}

/**
 * Segments the sprite sheet into individual chunks representing animation frames.
 * 
 * @returns player sheet containing animations for the sprite.
 */
function create_player_sheet() {

    var ret = {};
    var sprite_sheet = new PIXI.BaseTexture.from(app.loader.resources["player"].url);
    var sprite_width = 20;          // sheet pixel width is 80. 4 sprite columns. width = 80 / 4 = 20
    var sprite_height = 30;         // sheet pixel height is 120. 4 sprite rows. height = 120 / 4 = 30

    // load the individual sprites from the sprite sheet. Multiple elements indicate that it is an animation.
    ret["stand_south"] = [new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(0 * sprite_width, 0, sprite_width, sprite_height))];
    ret["walk_south"] = [
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(1 * sprite_width, 0, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(2 * sprite_width, 0, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(3 * sprite_width, 0, sprite_width, sprite_height))
    ];
    ret["stand_north"] = [new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(0 * sprite_width, 1 * sprite_height, sprite_width, sprite_height))];
    ret["walk_north"] = [
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(1 * sprite_width, 1 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(2 * sprite_width, 1 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(3 * sprite_width, 1 * sprite_height, sprite_width, sprite_height))
    ];
    ret["stand_west"] = [new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(0 * sprite_width, 2 * sprite_height, sprite_width, sprite_height))];
    ret["walk_west"] = [
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(1 * sprite_width, 2 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(2 * sprite_width, 2 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(3 * sprite_width, 2 * sprite_height, sprite_width, sprite_height))
    ];
    ret["stand_east"] = [new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(0 * sprite_width, 3 * sprite_height, sprite_width, sprite_height))];
    ret["walk_east"] = [
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(1 * sprite_width, 3 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(2 * sprite_width, 3 * sprite_height, sprite_width, sprite_height)),
        new PIXI.Texture(sprite_sheet, new PIXI.Rectangle(3 * sprite_width, 3 * sprite_height, sprite_width, sprite_height))
    ];

    return ret;
}

/**
 * Used to initialise the player sprite and sets it at the starting position.
 * 
 * @param {*} player_sheet contains all of the animations for the player
 * @param {*} cell_height height of each cell
 * @param {*} cell_width width of each cell
 * @returns AnimatedSprite object representing the player sprite
 */
function create_player(player_sheet, cell_height, cell_width) {

    var ret = new PIXI.AnimatedSprite(player_sheet.stand_south);
    ret.anchor.set(0.5);      
    ret.animation_speed = 0.5;
    ret.scale.x = 0.95 - difficulty * 0.15;
    ret.scale.y = 0.95 - difficulty * 0.15;
    ret.loop = false;
    ret.x = start.x * cell_width + cell_width / 4 + ret.width / 2;       // place sprite correctly
    ret.y = start.y * cell_height + cell_height / 4 + ret.height / 2;

    return ret;
}

/** 
 * Used to randomly select a start and destination cell. The two cells are guaranteed
 * to be on opposite sides. 
 * 
 * @params maze : 2D array of nodes representing the maze 
 * 
 * @returns an array containing [starting_node_object, destination_node_object]
*/
function generate_special_cells(maze) {

    var ret = new Array();
    var start_wall = generate_random(4);    // 0 = upper, 1 = right, 2 = bottom, 3 = left.
    ret.push(generate_special_cells_aux(start_wall, maze));
    ret.push(generate_special_cells_aux((start_wall + 2) % 4, maze));    // end is generated on the opposite side of start node. e.g. start is on wall 3. end is on 3 + 2 = 5 % 4 = 1st wall. 

    return ret;
}

/**
 * Auxiliary function used to randomly generate a starting cell
 * 
 * @param {*} wall Code represents which wall to generate the cell at. 1 = Upper, 1 = Right, 2 = Bottom, 3 = Left
 * @param {*} maze 2D array of nodes representing the underlying maze.
 * @returns a node specifying the special cell.
 */
function generate_special_cells_aux(wall, maze) {

    switch (wall) {
        case 0 : return maze[0][generate_random(maze[0].length)];
        case 1 : return maze[generate_random(maze.length)][maze[0].length - 1];
        case 2 : return maze[maze.length - 1][generate_random(maze[0].length)];
        case 3 : return maze[generate_random(maze.length)][0];
    }
}

/**
 * Used to initialise the nodes and the 2D array. Each node starts off
 * with a unique set id.
 * 
 * @param {*} num_rows Number of rows in maze
 * @param {*} num_cols Number of cols in maze
 * @returns 2D array of nodes
 */
function generate_maze(num_rows, num_cols) {

    var ret = new Array();
    var set_id = 0;            // assign each node a unique ID for kruskals & prims algs.

    for (var i = 0; i != num_rows; ++i) {
        // i = row
        var row = new Array();
        for (var ii = 0; ii != num_cols; ++ii) {
            // ii = col
            var node = new Node(ii, i, set_id++);
            row.push(node);       // push node to row
        }
        ret.push(row);           // push row to maze
    }

    return ret;
}

/**
 * Implementation of Kruskals Algorithm. Steps are outlined below:
 *  1) Generate an array of every possible edge.
 *  2) Randomly pick an edge and remove it from the array.
 *  3) Check if the first node in the edge has the same set as the second node. If they do not 
 *     then add an edge between them and change the set of every node that is connected to the second 
 *     node to the set of the first node. 
 *  4) Repeat 2,3 until the array of edges is empty.
 * 
 * @param {*} maze 2D array of nodes representing the maze.
 */
function kruskals(maze) {

    var edges = generate_edges(maze);
    while (edges.length != 0) {
        // pick random edge
        var rand = generate_random(edges.length);
        var curr_edge = edges.splice(rand, 1);         // splice returns an array containing element rather than the element itself. So need double indexing.
        var node_1 = curr_edge[0][0];
        var node_2 = curr_edge[0][1];
        
        if (node_1.set != node_2.set) {
            // if node1 set is different from node 2 set
            node_1.add_edge(node_2);
            node_2.add_edge(node_1);
            node_2.update_sets(node_1.set);
        }
    }
}

/**
 * Builds an array of all possible edges within the maze. By looping
 * right and then down.
 * 
 * @param {*} maze 2D array of nodes representing the maze.
 * @returns an array of arrays of edges. Each inner array contains 2 nodes.
 */
function generate_edges(maze) {

    var ret = new Array();
    for (var i = 0; i != maze.length; ++i) {
        // i = row
        for (var ii = 0; ii != maze[0].length; ++ii) {
            // ii = col
            if (ii + 1 < maze[0].length) {
                ret.push([maze[i][ii], maze[i][ii + 1]]); // add edge to node to the right from here if it is bounds
            }
            if (i + 1 < maze.length) {
                ret.push([maze[i][ii], maze[i + 1][ii]]);   // add edge to node below if it is in bounds.
            }
        }
    }

    return ret;
}

function prims(maze, start) {

    var total_num_nodes = maze.length * maze[0].length;
    var frontier = [];
    var sum_neg_one = 1;
    start.set = -1;

    if (start.x - 1 >= 0) {
        frontier.push(maze[start.y][start.x - 1]);
    }
    if (start.x + 1 < maze[0].length) {
        frontier.push(maze[start.y][start.x + 1]);
    }
    if (start.y - 1 >= 0) {
        frontier.push(maze[start.y - 1][start.x]);
    }
    if (start.y + 1 < maze.length) {
        frontier.push(maze[start.y + 1][start.x]);
    }

    while (sum_neg_one != total_num_nodes) {
        // loop until all nodes are in set -1.
        var random_frontier_node = frontier.splice(generate_random(frontier.length), 1)[0]; // select random node in frontier.
        random_frontier_node.set = -1;      // set its set to -1.
        
        var bag = [];
        // loop through its neighbours until you find one in set v.
        if ((random_frontier_node.y - 1 >= 0) && maze[random_frontier_node.y - 1][random_frontier_node.x].set == -1) {
            bag.push(maze[random_frontier_node.y - 1][random_frontier_node.x]);
            //random_frontier_node.add_edge(maze[random_frontier_node.y - 1][random_frontier_node.x]);
            //sum_neg_one++;
        }
        if ((random_frontier_node.x + 1 < maze[0].length) && maze[random_frontier_node.y][random_frontier_node.x + 1].set == -1) {
            bag.push(maze[random_frontier_node.y][random_frontier_node.x + 1]);
            //random_frontier_node.add_edge(maze[random_frontier_node.y][random_frontier_node.x + 1]);
            //sum_neg_one++;
        }
        if ((random_frontier_node.y + 1 < maze.length) && maze[random_frontier_node.y + 1][random_frontier_node.x].set == -1) {
            bag.push(maze[random_frontier_node.y + 1][random_frontier_node.x]);
            //random_frontier_node.add_edge(maze[random_frontier_node.y + 1][random_frontier_node.x]);
            //sum_neg_one++;
        }
        if ((random_frontier_node.x - 1 >= 0) && maze[random_frontier_node.y][random_frontier_node.x - 1].set == -1) {
            bag.push(maze[random_frontier_node.y][random_frontier_node.x - 1]);
            //random_frontier_node.add_edge(maze[random_frontier_node.y][random_frontier_node.x - 1]);
            //sum_neg_one++;
        }

        if (bag.length != 0) {
            random_frontier_node.add_edge(bag.splice(generate_random(bag.length), 1)[0]);
            sum_neg_one++;
        }

        // add any neighbours that are not in frontier or set -1
        if ((random_frontier_node.y - 1 >= 0) && !frontier.includes(maze[random_frontier_node.y - 1][random_frontier_node.x]) && (maze[random_frontier_node.y - 1][random_frontier_node.x].set != -1)) {
            frontier.push(maze[random_frontier_node.y - 1][random_frontier_node.x]);
        }
        if ((random_frontier_node.x + 1 < maze[0].length) && !frontier.includes(maze[random_frontier_node.y][random_frontier_node.x + 1]) && (maze[random_frontier_node.y][random_frontier_node.x + 1].set != -1)) {
            frontier.push(maze[random_frontier_node.y][random_frontier_node.x + 1]);
        }
        if ((random_frontier_node.y + 1 < maze.length) && !frontier.includes(maze[random_frontier_node.y + 1][random_frontier_node.x]) && (maze[random_frontier_node.y + 1][random_frontier_node.x].set != -1)) {
            frontier.push(maze[random_frontier_node.y + 1][random_frontier_node.x]);
        }
        if ((random_frontier_node.x - 1 >= 0) && !frontier.includes(maze[random_frontier_node.y][random_frontier_node.x - 1]) && (maze[random_frontier_node.y][random_frontier_node.x - 1].set != -1)) {
            frontier.push(maze[random_frontier_node.y][random_frontier_node.x - 1]);
        }


    }


}

function dfs(maze, start) {

    var stack = [start];
    start.visited = true;
    while (stack.length != 0) {
        var current = stack.pop();
        var unvisited_neighbour = current.get_unvisited_neigh(maze);

        if (unvisited_neighbour == null) { continue; }
        
        stack.push(current);
        current.add_edge(unvisited_neighbour);
        unvisited_neighbour.visited = true;
        stack.push(unvisited_neighbour);
    }

}

/**
 * This function draws the maze that is represented by the 2D array, maze, onto the canvas.
 * The library PixiJS is used to handle the drawing. The bulk of the function is down to correctly
 * figuring out the co-ordinates of the rectangles.
 * 
 * We choose cell_height for line size because window.innerHeight is the limiting factor.
 * Each cell is anchored in the top left corner.
 * 
 * @param {*} maze 2D array of nodes. The nodes contain information about the edges.
 * @param {*} start the starting node
 * @param {*} end the destination node
 */
function render_maze(maze, start, end) {

    // divide up the window into blocks of cells. We calculate cell and line dimensions below.
    var cell_height = window.innerHeight / maze.length;
    var cell_width = window.innerWidth /  maze[0].length;
    var cell_size = cell_height / 2;

    for (var i = 0; i != maze.length; ++i) {
        // i = row
        for (var ii = 0; ii != maze[0].length; ++ii) {
            // ii = col
            var curr_node = maze[i][ii];
            if (curr_node.edges == undefined) { continue; }
            curr_node.edges.forEach(element => {
                // rectangle is drawn from top left most point. This point is offset by 1/4 of the cell width and height. Otherwise,
                // the maze is joined to the edge of the screen. Chose a 1/4 because it is the ideal size.
                var x = curr_node.x * cell_width + cell_width / 4;
                var y = curr_node.y * cell_height + cell_height / 4;
                var x_to = element.x * cell_width + cell_width / 4;
                var y_to = element.y * cell_height + cell_height / 4;
                var line = new PIXI.Graphics();

                if (curr_node.x == element.x) {
                    // we are drawing line to cell vertically

                    if (curr_node.y < element.y) {
                        // drawing line down
                        // draw from (x,y). The width of rectangle is cell_size, height is cell_height + cell_size
                        line.beginFill(0xFFFFFF).drawRect(x, y, cell_size, cell_height + cell_size).endFill();
                    }
                    else {
                        // drawing line up
                        line.beginFill(0xFFFFFF).drawRect(x_to, y_to, cell_size, cell_height + cell_size).endFill();
                    }
                }
                else {
                    // we are drawing line horizontally
                    
                    if (curr_node.x < element.x) {
                        // drawing line to the right.
                        line.beginFill(0xffffff).drawRect(x, y, cell_width + cell_size, cell_size).endFill();
                    }
                    else {
                        // drawing line to the left
                        line.beginFill(0xFFFFFF).drawRect(x_to, y_to, cell_width + cell_size, cell_size).endFill();
                    }
                }

                app.stage.addChild(line);
            });
        }
    }

    render_special_cells(end, cell_width, cell_height, cell_size);  // color in the destination cell
}

/**
 * Colors the destination cell red. Co-ordinates are calculated the same way as in render_maze.
 * 
 * @param {*} end destination node
 * @param {*} cell_width width of cells
 * @param {*} cell_height height of cells
 * @param {*} cell_size size of the rectangles
 */
function render_special_cells(end, cell_width, cell_height, cell_size) {

    var end_x = end.x * cell_width + cell_width / 4;
    var end_y = end.y * cell_height + cell_height / 4;

    // draw red destination cell
    var end_rect = new PIXI.Graphics();
    end_rect.beginFill(0xFF0000).drawRect(end_x, end_y, cell_size, cell_size).endFill();
    app.stage.addChild(end_rect)
}

