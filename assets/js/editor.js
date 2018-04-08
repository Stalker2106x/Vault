function initEditors(instances) {
    if (instances.length == 0) //Editor not enabled
    {
        var penConfig = {
            class: 'pen',
            debug: false,
            textarea: '<textarea name="content"></textarea>',
            list: [
                'blockquote', 'h2', 'h3', 'p', 'insertorderedlist', 'insertunorderedlist',
                'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
            ],
            stay: true,
            linksInNewWindow: false
        }
        var appsEntities = document.getElementById("app-container").children;
        for (var i in appsEntities)
        {
            instances.push(new Pen(appsEntities[i], penConfig)); //Create instances
        }
    }
    else //Recall
    {
        for (var i in instances)
        {
            instances[i].rebuild(); //Rebuild instances
        }
    }
}

function saveEditors(instances) {
    //Nothing...
}