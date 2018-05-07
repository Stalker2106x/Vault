//Locals

var editorInstance = null;

//Helpers

/**
 * checks if the vault is in edition mode
 */
function isEditorEnabled() {
    return (document.querySelector("#toggleEditor.active") == null ? false : true);
}

//Functions

var dlgConfig = null;
/**
 * opens the vault configuration modal
 */
function configureVault() {
    if (dlgConfig == null) //Create modal first time
    {
        var config = {
            title: document.getElementById("vault-title").innerText,
            caption: document.getElementById("vault-caption").innerText,
            passphrase: authorization_passphrase
        };
        var dlgHtml = nunjucks.render('templates/modal_config.html', config);
        document.querySelector('#page-content').innerHTML += dlgHtml;
        var dlgElem = document.querySelector('#modal_config');
        dlgConfig = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
        M.updateTextFields();
        var bgSelect = M.FormSelect.init(dlgElem.querySelector('#configSelect_background'));
        dlgElem.querySelector('#config-apply').addEventListener("click", function () {
            var config = { };
            if (appconfig.title != dlgElem.querySelector('#configInput_title').value) config.title = dlgElem.querySelector('#configInput_title').value;
            if (appconfig.caption != dlgElem.querySelector('#configInput_caption').value) config.caption = dlgElem.querySelector('#configInput_caption').value;
            if (bgSelect.getSelectedValues()[0] != "") config.background = bgSelect.getSelectedValues()[0];
            saveVault(config);
            M.toast({html: '<span>Modifications applied.</span>'});
            dlgConfig.close();
            //Apply changes
            loadConfig();
        });
    }
    dlgConfig.open();
}

/**
 * returns the data of a specific element of an app
 * @param {DOMElement} app HTML DOM of the app
 * @param {string} selector Element to query for data
 */
function getAppAttribute(app, selector)
{
    var attribute = app.querySelector(selector);
    if (attribute == null) return ("");
    if (selector == ".app-image") return (attribute.src);
    else return (attribute.innerText);
}

/**
 * Opens edit modal for an app
 * @param {Event} event triggered from click event on an app
 */
function editApp(event) {
    if (event.target.classList.contains("delete-badge")) promptDelete(event);
    let appDOM = event.currentTarget;
    var app = {
        title: getAppAttribute(appDOM, ".app-title"),
        detail: getAppAttribute(appDOM, ".app-detail"),
        image: getAppAttribute(appDOM, ".app-image")
    };
    var dlgHtml = nunjucks.render('templates/modal_appedit.html', app);
    document.querySelector('#modal_appEdit').innerHTML = dlgHtml;
    var dlgElem = document.querySelector('#modal_appEdit');
    var dlgAppEdit = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
    var colorSelect = dlgElem.querySelector('#appSelect_color');
    M.FormSelect.init(colorSelect);
    document.querySelector('#edit-apply').addEventListener("click", function () {
        appDOM.querySelector(".app-title").innerText = document.querySelector("#appInput_title").value;
        appDOM.querySelector(".app-detail").innerText = document.querySelector("#appInput_detail").value;
        M.toast({html: '<span>Modifications applied.</span>'});
        dlgAppEdit.close();
    });
    M.updateTextFields();
    dlgAppEdit.open();
}

/**
 * delete an application from grid
 * @param {Event} event triggered from click event on an app delete-btn
 */
function deleteApp(event) {
    var app = document.querySelector(".app.markedForDeletion");
    app.classList.remove("markedForDeletion");
    app.classList.add("deleted");
    M.toast({html: '<span>Deleted app !</span>'});
    dlgDelete.close();
    dlgDelete.destroy();
};

var dlgDelete = null;
/**
 * Inject app deletion modal to vault DOM
 */
function addDeleteModal() {
    var dlgHtml = nunjucks.render('templates/modal_delete.html');
    document.querySelector("#page-content").innerHTML += dlgHtml;
    var dlgElem = document.querySelector('#modal_delete');
    dlgElem.querySelector('#delete-confirm').addEventListener("click", deleteApp); //Bind delete
    dlgDelete = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
}

/**
 * Inject app edition modal to vault DOM
 */
function addAppEditModal() {
    var dlgContainer = '<div id="modal_appEdit" class="modal"></div>';
    document.querySelector("#page-content").innerHTML += dlgContainer;
    var dlgElem = document.querySelector('#modal_appEdit');
}

/**
 * Opens modal to confirm app deletion
 * @param {Event} event triggered from click on an app delete-btn
 */
function promptDelete(event) {
    var dlgElem = document.querySelector("#modal_delete");
    event.currentTarget.parentNode.classList.add("markedForDeletion");
    var appTitle = event.currentTarget.parentNode.querySelector(".app-title").innerText;
    dlgElem.querySelector(".delete-prompt").innerText = "Delete " + appTitle + " ?";
    dlgDelete.open();
}

/**
 * Add delete badge to an app
 * @param {DOM} app DOM of app to add delete badge to
 */
function addDeleteBadge(app) {
    let badgeHTML = '<i class="delete-badge material-icons">cancel</i>';
    app.innerHTML = badgeHTML + app.innerHTML;
    app.querySelector(".delete-badge").addEventListener("click", promptDelete);
}

/**
 * Opens vault app editor
 */
function openEditor() {
    var apps = document.getElementsByClassName('app');
    addDeleteModal();
    addAppEditModal();
    [].forEach.call(apps, function (app) {
        app.classList.remove("app-link"); //remove mouse style
        addDeleteBadge(app);
        bindClickHandler(app, editApp);
    });
}

/**
 * Close vault app editor
 */
function closeEditor(save) {
    var toggle = document.getElementById("toggleEditor")
    toggle.children[0].innerHTML = "create"; //Changing icon
    toggle.classList.remove("active");
    //Disabling page editor
    var apps = document.getElementsByClassName('app');
    [].forEach.call(apps, function (app) {
        if (app.getAttribute("href") != undefined) app.classList.add("app-link");
        app.querySelector(".delete-badge").remove();
        bindClickHandler(app, navigateToSelection);
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

/**
 * toggle app editor on or off
 */
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

/**
 * Cancels edition of apps and revert grid to JSON state
 */
function revertEditor() {
    closeEditor(false);
    clearVault();
    loadVault();
}

/**
 * Saves the vault config to JSON, collects app data and POSTs to serialization script
 * @param {JSON} config JSON Object containing vault configuration data
 */
function saveVault(config) {
    let data = {};
    if (config) data.config = config;
    data.apps = dumpVaultApps();
    serializeData(data);
}

/**
 * Dump vault apps to JSON object
 */
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

/**
 * Serialize JSON data to serialization object
 * @param {JSON} data JSON object of vault data
 */
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