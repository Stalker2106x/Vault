//Locals
var instances = [];

//Functions

function toggleEditors() {
    var enable = document.getElementById("toggleEditor").classList.contains("inactive");
    if (enable) //authentication needed for edition
    {
        var dlgHtml = nunjucks.render('templates/modal_auth.html');
        document.getElementsByTagName('body')[0].innerHTML += dlgHtml;
        var dlgElem = document.getElementById('modal_auth');
        var dlg = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
        document.getElementById('submit-passphrase').addEventListener("click", function(){
            if (document.getElementById('passphrase').value == appconfig.passphrase) //auth success!
            {
                var toggle = document.getElementById("toggleEditor");
                toggle.firstChild.innerHTML = "save"; //Changing icon
                toggle.classList.remove("inactive");
                initEditors(instances);
                //Toast to alert
                M.toast({html: '<span>Switched to edition mode !</span><button class="btn-flat toast-action">Undo</button>'});
                dlg.close();
            }
            else
            {
                //Toast bad_passphrase
                M.toast({html: '<span>Wrong passphrase!</span>'});
            }
        });
        dlg.open();
    }
    else //Saving edition, no auth required
    {
        var toggle = document.getElementById("toggleEditor")
        toggle.firstChild.innerHTML = "create"; //Changing icon
        toggle.classList.add("inactive");
        saveEditors(instances);
        for (var i in instances)
        {
            instances[i].destroy(); //Destruct instances
        }
        //Toast to alert
        M.toast({html: '<span>Modifications saved with success.</span>'});
    }
    return (false);
}

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
            linksInNewWindow: false
        }
        var appsEntities = document.getElementsByClassName("app");
        [].forEach.call(appsEntities, function (elem) {
            instances.push(new Pen(elem, penConfig)); //Create instances
        });
    }
    else //Recall
    {
        instances.forEach(function (){
            instances[i].rebuild(); //Rebuild instances
        });
    }
}

function saveEditors(instances) {
    //Nothing...
}