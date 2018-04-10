var toolbar = document.getElementById('toolbar-button');
//RocketTop
document.getElementById("rocketTop").addEventListener("click", function() { scroll(0,0); });
//Editor
if (true/* !remote || remote &&  appconfig.allow-remote-edition == true*/)
{
    var button = document.createElement("li");
    button.innerHTML = '<a id="toggleEditor" class="btn-floating yellow darken-1 inactive"><i class="material-icons">create</i></a>';
    toolbar.children[1].appendChild(button);
    document.getElementById("toggleEditor").addEventListener("click", toggleEditors);
}

var toolbarInstance = M.FloatingActionButton.init(toolbar, {direction: "left"});