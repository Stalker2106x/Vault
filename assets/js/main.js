//Global auth token
var authorization_passphrase = "";

//Helpers

//Change tagName of an element
function changeElementTagName(element, old, wanted) {
    let regexp = "/"+old+"/g"
    element.outerHTML = element.outerHTML.replace(regexp,wanted);
}

//Gets index of element within its container
function getElementIndex(node) {
    var index = 0;
    while ( (node = node.previousElementSibling) ) {
        index++;
    }
    return index;
}

//Gets the first child in the element childs (not multilevel)
function getDescendantWithClass(element, clName) {
    var children = element.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].className &&
            children[i].className.split(' ').indexOf(clName) >= 0) {
            return children[i];
         }
     }
     for (var i = 0; i < children.length; i++) {
         var match = getDescendantWithClass(children[i], clName);
         if (match !== null) {
             return match;
         }
     }
     return null;
}

//Gets the first child in the element hierarchy
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

function loadJSON(file, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
        }
    };
    xobj.send(null);  
 }

// Main
function clearVault() {
    document.getElementById("app-container").innerHTML = ""; //Empty container content
}

function loadVault() {
    return (new Promise(function (resolve, reject) {
        //Getting global app configuration
        loadJSON('data/config.json', function(json){
            appconfig = JSON.parse(json);
            document.getElementById('vault-title').innerText = appconfig.title;
            document.getElementById('vault-caption').innerText = appconfig.caption;
        });

        //Rendering app tiles
        loadJSON('data/apps.json', function(json){
            var data = JSON.parse(json);
            for (var i in data.apps)
            {
                var appHtml;
                //Defaults
                if (!data.apps[i].color) data.apps[i].color = "blue-grey"; else data.apps[i].color = data.apps[i].color.toLowerCase();
                if (!data.apps[i].textcolor) data.apps[i].textcolor = "white"; else data.apps[i].textcolor = data.apps[i].textcolor.toLowerCase();
                //Render
                if (data.apps[i].image) //Image app
                {
                    appHtml = nunjucks.render('templates/app_image.html', data.apps[i]);
                }
                else if (data.apps[i].action && data.apps[i].url) //Standard app
                {
                    appHtml = nunjucks.render('templates/app_base.html', data.apps[i]);
                }
                else //Not an app (note or alert)
                {
                    appHtml = nunjucks.render('templates/app_panel.html', data.apps[i]);
                }
                document.getElementById("app-container").innerHTML += appHtml;
            }
            resolve();
        });
    }));
}

//APP BEGIN
//Set navigation if scrollbar present
var appNodes = [];
//Comportement listeners
var navButtons = document.getElementsByClassName('app-nav');
window.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        navigateToSelection();
    }
});
var toolbar = document.getElementById('vault-toolbar-button');
//Init
window.addEventListener('wheel', replaceVerticalScrollByHorizontal); //Bind Horz scroll handler
document.getElementById("filterInput").addEventListener('input', filterApps); //Bind filter handler
document.getElementById("scrollHome").addEventListener("click", function() { appCursor = 0; document.getElementById('app-container').scroll(0,0); }); //Bind scrollTop handler
document.getElementById("unlockVault").addEventListener("click", authenticate); //Bind unlocking handler
initToolbar();
//Main
loadVault().then(function() {
    appNodes = [].slice.call(document.getElementById("app-container").children);
    appNodes.forEach(function(app) {
        if (app.getAttribute("href") != undefined)
        {
            app.classList.add("app-link");
            app.addEventListener("click", navigateToSelection); //Bind navigation handler
        }
        app.addEventListener("mouseover", updateSelection); //Bind selection handler
        app.addEventListener("mouseleave", clearSelection); //Bind clearSelection handler
    });
    updateNavArrows();
});
//APP END
