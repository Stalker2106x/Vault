//Locals

var editorInstance = null;

//Helpers

function isEditorEnabled() {
    return (document.getElementById("toggleEditor").classList.contains("active"));
}

//Functions

function openEditor() {
    var apps = document.getElementsByClassName('app');
    [].forEach.call(apps, function (app) {
        app.classList.remove("app-link");
        let title = findFirstChildByClass(app, "app-title");
        title.contentEditable = "true";
        title.classList.add("editable");
        let detail = findFirstChildByClass(app, "app-detail");
        detail.contentEditable = "true";
        detail.classList.add("editable");
    });
}

function closeEditor(save) {
    var toggle = document.getElementById("toggleEditor")
    toggle.children[0].innerHTML = "create"; //Changing icon
    toggle.classList.remove("active");
    //Disabling page editor
    var apps = document.getElementsByClassName('app');
    [].forEach.call(apps, function (app) {
        if (app.getAttribute("href") != undefined) app.classList.add("app-link");
        let title = findFirstChildByClass(app, "app-title");
        title.contentEditable = "false";
        title.classList.remove("editable");
        let detail = findFirstChildByClass(app, "app-detail");
        detail.contentEditable = "false";
        detail.classList.remove("editable");
    });
    var toastContainer = document.getElementById('toast-container');
    var activeToasts = toastContainer.childNodes;
    for (var toast in activeToasts)
    {
        if (getDescendantWithClass(activeToasts[toast], "editorToast") != null)
        {
            toastContainer.removeChild(activeToasts[toast]);
            break;
        }
    }
    if (save)
    {
        saveVault();
        //Toast to alert
        M.toast({html: '<span>Modifications saved with success.</span>'});
    }
    else
    {
        //Toast to alert
        M.toast({html: '<span>Exited edition mode.</span>'});
    }
}

function toggleEditor() {
    var toggle = document.getElementById("toggleEditor");
    if (!toggle.classList.contains("active")) //Enable editor
    {
        toggle.children[0].innerHTML = "save"; //Changing icon
        toggle.classList.add("active");
        openEditor();
        //Toast to alert
        M.toast({html: '<span class="editorToast">Vault is in edition mode</span><button id="revertEditor" class="btn-flat toast-action">Revert changes</button>', displayLength: 999999});
        document.getElementById('revertEditor').addEventListener("click", revertEditor);
    }
    else //Saving and closing editor
    {
        closeEditor(true);
    }
    return (false);
}

function revertEditor() {
    closeEditor(false);
    clearVault();
    loadVault();
}

function saveVault() {
    let data = {};
    data.config = { 
        title: document.getElementById("vault-title").innerText, 
        caption: document.getElementById("vault-caption").innerText
    };
    data.apps = dumpVaultApps();
    serializeData(data);
}

function dumpVaultApps() {
    //Collecting apps data
    var apps = document.getElementsByClassName('app');
    var appsJson = { apps: [] };
    [].forEach.call(apps, function (app) {
        var appJson = {};
        appJson.title = getDescendantWithClass(app, "app-title").innerText;
        appJson.detail = getDescendantWithClass(app, "app-detail").innerText;
        var url = getDescendantWithClass(app, "app-link");
        if (url) appJson.url = url.href;
        appsJson.apps.push(appJson);
    });
    return(appsJson);
}

function serializeData(data) {
    const req = new XMLHttpRequest();

    req.onreadystatechange = function(event) {
        // XMLHttpRequest.DONE === 4
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                //Toastr Sucess!
            } else {
                console.log("Server error: %d (%s:%s)", this.status, this.statusText, this.responseText);
            }
        }
    };
    var postData = {};
    postData.passphrase = authorization_passphrase;
    if (data.config) postData.config = data.config;
    if (data.apps) postData.apps = data.apps.apps;

    req.open('POST', 'data/serialize.php', true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(postData));
}