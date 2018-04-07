
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

loadJSON(function(data){
    var html = nunjucks.render('app.html', JSON.parse(data));
    document.getElementById("app-container").innerHTML = html;
});

