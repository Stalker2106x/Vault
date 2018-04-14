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
        else 
        {
            if (app.style.display == "none")
            {
                app.style.display = "";
            }
        }
    });
});