//Locals

var editorInstance = null;

//Helpers

function isEditorEnabled() {
    return (document.querySelector("#toggleEditor.active") == null ? false : true);
}

//Functions

var dlgConfig = null;
function configureVault() {
    if (dlgConfig == null) //Create modal first time
    {
        var config = { 
            title: document.getElementById("vault-title").innerText, 
            caption: document.getElementById("vault-caption").innerText
        };
        var dlgHtml = nunjucks.render('templates/modal_config.html', config);
        document.querySelector('#page-content').innerHTML += dlgHtml;
        var dlgElem = document.querySelector('#modal_config');
        dlgConfig = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
        M.updateTextFields();
        document.querySelector('#submit-config').addEventListener("click", function () {
            document.getElementById("vault-title").innerText = document.getElementById("configInput_title").value;
            document.getElementById("vault-caption").innerText = document.getElementById("configInput_caption").value;
            saveVault();
            M.toast({html: '<span>Modifications saved with success.</span>'});
            dlgConfig.close();
        });
    }
    dlgConfig.open();
}

function editApp(event) {
    let appDOM = event.currentTarget;
    var app = {
        title: appDOM.querySelector(".app-title").innerText,
        detail: appDOM.querySelector(".app-detail").innerText
    };
    var dlgHtml = nunjucks.render('templates/modal_appedit.html', app);
    var dlgElem = document.querySelector('#modal_appEdit');
    dlgElem.innerHTML = dlgHtml;
    var dlgAppEdit = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
    M.updateTextFields();
    dlgAppEdit.open();
}

function deleteApp(event) {
    var app = document.querySelector(".app.markedForDeletion");
    app.classList.remove("markedForDeletion");
    app.classList.add("deleted");
    M.toast({html: '<span>Deleted app !</span>'});
    dlgDelete.close();
    dlgDelete.destroy();
};

var dlgDelete = null;
function addDeleteModal() {
    var dlgHtml = nunjucks.render('templates/modal_delete.html');
    document.querySelector("#page-content").innerHTML += dlgHtml;
    var dlgElem = document.querySelector('#modal_delete');
    dlgElem.querySelector('#delete-confirm').addEventListener("click", deleteApp); //Bind delete
    dlgDelete = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
}

function addAppEditModal() {
    var dlgContainer = '<div id="modal_appEdit" class="modal"></div>';
    document.querySelector("#page-content").innerHTML += dlgContainer;
    var dlgElem = document.querySelector('#modal_appEdit');
}

function promptDelete(event) {
    var dlgElem = document.querySelector("#modal_delete");
    event.currentTarget.parentNode.classList.add("markedForDeletion");
    var appTitle = event.currentTarget.parentNode.querySelector(".app-title").innerText;
    dlgElem.querySelector(".delete-prompt").innerText = "Delete " + appTitle + " ?";
    dlgDelete.open();
}

function addDeleteBadge(app) {
    let badgeHTML = '<i class="delete-badge material-icons">cancel</i>';
    app.innerHTML = badgeHTML + app.innerHTML;
    app.querySelector(".delete-badge").addEventListener("click", promptDelete);
}

function openEditor() {
    var apps = document.getElementsByClassName('app');
    addDeleteModal();
    addAppEditModal();
    [].forEach.call(apps, function (app) {
        app.classList.remove("app-link"); //remove mouse style
        addDeleteBadge(app);
        bindClickHandler(app, editApp);
        /*
        let title = findFirstChildByClass(app, "app-title");
        title.contentEditable = "true";
        title.classList.add("editable");
        let detail = findFirstChildByClass(app, "app-detail");
        detail.contentEditable = "true";
        detail.classList.add("editable");*/
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
        app.querySelector(".delete-badge").remove();
        bindClickHandler(apps, navigateToSelection);
        /*
        let title = findFirstChildByClass(app, "app-title");
        title.contentEditable = "false";
        title.classList.remove("editable");
        let detail = findFirstChildByClass(app, "app-detail");
        detail.contentEditable = "false";
        detail.classList.remove("editable");
        */
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
        M.toast({html: '<span class="editorToast">Vault is in edition mode</span><button id="revertEditor" class="btn-flat toast-action">Undo all</button>', displayLength: 999999});
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
    var apps = document.querySelectorAll('.app');

    var appsArray = [];
    [].forEach.call(apps, function (app) {
        var appJson = {};
        if (app.classList.contains("deleted")) appJson.deleted = true; //Mark for deletion
        appJson.title = getDescendantWithClass(app, "app-title").innerText;
        appJson.detail = getDescendantWithClass(app, "app-detail").innerText;
        var url = getDescendantWithClass(app, "app-link");
        if (url) appJson.url = url.href;
        appsArray.push(appJson);
    });
    return({ apps: appsArray});
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