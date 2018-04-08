var elem = document.querySelector('.fixed-action-btn');
var instance = M.FloatingActionButton.init(elem, {direction: "left"});
//RocketTop
document.getElementById("rocketTop").addEventListener("click", function() { scroll(0,0); });
//Editor
var instances = [];
document.getElementById("toggleEditor").addEventListener("click", function() {

    if (this.classList.contains("inactive")) //enabling edition
    {
        this.firstChild.innerHTML = "save"; //Changing icon
        this.classList.remove("inactive");
        initEditors(instances);
        //Toast to alert
        M.toast({html: '<span>Switched to edition mode !</span><button class="btn-flat toast-action">Undo</button>'});
    }
    else //Saving edition
    {
        this.firstChild.innerHTML = "create"; //Changing icon
        this.classList.add("inactive");
        saveEditors(instances);
        for (var i in instances)
        {
            instances[i].destroy(); //Destruct instances
        }
        //Toast to alert
        M.toast({html: '<span>Modifications saved with success.</span>'});
    }
    
});