window.onload = animate 

function animate() {
    if (sessionStorage.getItem("hasVisited")) {
        document.getElementById("container").style.display = "none";
        document.getElementById("main").style.opacity = 1;
    }
    else {
        sessionStorage.setItem("hasVisited", true);
    }
}