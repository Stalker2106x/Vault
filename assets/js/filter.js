//Helper

function findFirstChildByClass(element, className) {
    var foundElement = null, found;
    function recurse(element, className, found) {
        for (var i = 0; i < element.childNodes.length && !found; i++) {
            var el = element.childNodes[i];
            var classes = el.className != undefined? el.className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) {
                    found = true;
                    foundElement = element.childNodes[i];
                    break;
                }
            }
            if(found)
                break;
            recurse(element.childNodes[i], className, found);
        }
    }
    recurse(element, className, false);
    return (foundElement);
}

//Main

document.getElementById("filterInput").addEventListener('input', function () {
    var filter = this.value;
    var apps = document.getElementsByClassName("app");
    if (filter == "")
    {
        [].forEach.call(apps, function (app) {
            app.style.display = "";
        });
    }
    [].forEach.call(apps, function (app) {
        if (findFirstChildByClass(app, "app-title").innerText.toLowerCase().indexOf(filter.toLowerCase()) < 0 //Filter title
            && findFirstChildByClass(app, "app-detail").innerText.toLowerCase().indexOf(filter.toLowerCase()) < 0) //Filter detail
        {
            app.style.display = "none";
        }
        else if (app.style.display == "none")
        {
            app.style.display = "";
        }
    });
});