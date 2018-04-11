var toolbar = document.getElementById('vault-toolbar-button');
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

//Serialization test
if (true/* !remote || remote &&  appconfig.allow-remote-edition == true*/)
{
    var button = document.createElement("li");
    button.innerHTML = '<a id="testBtn" class="btn-floating yellow darken-1 inactive"><i class="material-icons">backup</i></a>';
    toolbar.children[1].appendChild(button);
    document.getElementById("testBtn").addEventListener("click", function () {
        
        serializeData({title: "Vault", caption: "Oklm ac les putt"}, dumpVaultApps());
    });
}

var toolbarInstance = M.FloatingActionButton.init(toolbar, {direction: "left", hoverEnabled: true});