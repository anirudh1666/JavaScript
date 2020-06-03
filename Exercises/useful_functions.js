/* This function swaps images being shown
   @params = e_id : id of picture being replaced.
             new_pic : the picture being shown after.
*/
function swap_pic(e_id, new_pic) {
    document.getElementById(e_id).src = new_pic;
}

// Useful for getting url of hyperlink
function get_address() {
    var link = document.getElementById("link1");
    var address = link.href;
}