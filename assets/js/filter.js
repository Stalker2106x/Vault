//Functions

function filterApps() {
    var filter = this.value;
    var firstMatching = true;
    if (filter == "")
    {
        appNodes.forEach(function (app) {
            app.style.display = "";
        });
        return;
    }
    appNodes.forEach(function (app) {
        if (findFirstChildByClass(app, "app-title").innerText.toLowerCase().indexOf(filter.toLowerCase()) < 0 //Filter title
            && findFirstChildByClass(app, "app-detail").innerText.toLowerCase().indexOf(filter.toLowerCase()) < 0) //Filter detail
        {
            app.style.display = "none";
        }
        else 
        {
            if (firstMatching)
            {
                firstMatching = false;
                selectApp(app);
            }
            if (app.style.display == "none")
            {
                app.style.display = "";
            }
        }
    });
}