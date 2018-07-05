/* global M, nunjucks, appConfig, authorization_passphrase */
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

/**
 * opens the vault configuration modal
 */
var VaultConfigModal = null;
function initVaultConfigModal() {
  var dlgDOM = document.querySelector("#modal_config");
  dlgDOM.querySelector("#config-apply").addEventListener("click", function () {
    //Update vault config
    appConfig.title = dlgDOM.querySelector("#configInput_title").value;
    appConfig.caption = dlgDOM.querySelector("#configInput_caption").value;
    appConfig.background = bgSelect.getSelectedValues()[0];
    saveVault(appConfig);
    M.toast({html: "<span>Modifications applied.</span>"});
    VaultConfigModal.close();
    //Reload changes
    loadConfig();
  });
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  }
  VaultConfigModal = M.Modal.init(dlgDOM, dlgParams);
  M.updateTextFields();
  var bgSelect = M.FormSelect.init(dlgElem.querySelector("#configSelect_background"));
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
var AppEditModal = null;
function initAppEditModal() {
  var dlgDOM = document.querySelector("#modal_appEdit");
  dlgDOM.querySelector("#edit-apply").addEventListener("click", serializeAppConfig);
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  var colorSelect = appDOM.querySelector("#appSelect_color");
  M.FormSelect.init(colorSelect);
  AppEditModal = M.Modal.init(dlgDOM, dlgParams);
}

function serializeAppConfig() {
  //Identify selected app instead of app[0]
  var appDOM = appNodes[0];
  appDOM.querySelector(".app-title").innerText = document.querySelector("#appInput_title").value;
  appDOM.querySelector(".app-detail").innerText = document.querySelector("#appInput_detail").value;
  M.toast({html: "<span>Modifications applied.</span>"});
  AppEditModal.close();
}

/**
 * delete an application from grid
 * @param {Event} event triggered from click event on an app delete-btn
 */
function deleteApp(event) {
  var app = document.querySelector(".app.markedForDeletion");
  app.classList.remove("markedForDeletion");
  app.classList.add("deleted");
  M.toast({html: "<span>Deleted app !</span>"});
  dlgDelete.close();
  dlgDelete.destroy();
}

var dlgDelete = null;
/**
 * Initialize App deletion modal
 */
function initAppDeleteModal() {
  var dlgDOM = document.querySelector("#modal_delete");
  dlgDOM.querySelector("#delete-confirm").addEventListener("click", deleteApp); //Bind delete
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  dlgDelete = M.Modal.init(dlgDOM, dlgParams);
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
  let badgeHTML = "<i class=\"delete-badge material-icons\">cancel</i>";
  app.innerHTML = badgeHTML + app.innerHTML;
  app.querySelector(".delete-badge").addEventListener("click", promptDelete);
}

/**
 * Add delete badge to an app
 * @param {DOM} app DOM of app to add delete badge to
 */
function removeDeleteBadge(app) {
  let badgeDOM = app.querySelector(".delete-badge");
  badgeDOM.removeEventListener("click", promptDelete);
  badgeDOM.parentNode.removeChild(badgeDOM);
}

/**
 * Opens vault app editor
 */
function openEditor() {
  initVaultConfigModal();
  initAppEditModal();
  initAppDeleteModal();
  var apps = document.getElementsByClassName("app");
  [].forEach.call(apps, function (app) {
    unbindAppClick(app, navigateToSelection);
    addDeleteBadge(app);
    app.href = "#modal_edit";
  });
}

/**
 * Close vault app editor
 */
function closeEditor(save) {
  var toggle = document.getElementById("toggleEditor");
  toggle.children[0].innerHTML = "create"; //Changing icon
  toggle.classList.remove("active");
  //Disabling page editor
  var apps = document.getElementsByClassName("app");
  [].forEach.call(apps, function (app) {
    if (app.getAttribute("href") != undefined) app.classList.add("app-link");
    unbindAppClick(app, editApp);
    removeDeleteBadge(app);
    bindAppClick(app, navigateToSelection);
  });
  var toastContainer = document.getElementById("toast-container");
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
    M.toast({html: "<span>Modifications saved with success.</span>"});
  }
  else
  {
    //Toast to alert
    M.toast({html: "<span>Exited edition mode.</span>"});
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
    M.toast({html: "<span class=\"editorToast\">Vault is in edition mode</span><button id=\"revertEditor\" class=\"btn-flat toast-action\">Undo all</button>", displayLength: 999999});
    document.getElementById("revertEditor").addEventListener("click", revertEditor);
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
  var apps = document.querySelectorAll(".app");

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

  req.open("POST", "data/serialize.php", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(postData));
}