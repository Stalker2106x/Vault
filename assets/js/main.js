//Global auth token
var authorization_passphrase = "";

//Helpers

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
});

