
//Helpers

function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/apps.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
        }
    };
    xobj.send(null);  
 }

// Main

loadJSON(function(json){
    var data = JSON.parse(json);
    for (var i in data.apps)
    {
        var appHtml;
        if (data.apps[i].image) //Image app
        {
            appHtml = nunjucks.render('app-templates/image.html', data.apps[i]);
        }
        else if (data.apps[i].action && data.apps[i].url) //Standard app
        {
            appHtml = nunjucks.render('app-templates/base.html', data.apps[i]);
        }
        else //Not an app (note or alert)
        {
            appHtml = nunjucks.render('app-templates/panel.html', data.apps[i]);
        }
        document.getElementById("app-container").innerHTML += appHtml;
    }
});

