var elem = document.querySelector('.fixed-action-btn');
var instance = M.FloatingActionButton.init(elem, {direction: "left"});
//RocketTop
document.getElementById("rocketTop").addEventListener("click", function() { scroll(0,0); });
//Editor
document.getElementById("toggleEditor").addEventListener("click", toggleEditors);