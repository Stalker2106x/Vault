/* global M, nunjucks, appConfig, authorization_passphrase */
//Helpers

/**
 * checks if the vault is in edition mode
 */
function isEditorEnabled() {
  return (document.querySelector("#toggleEditor.active") == null ? false : true);
}

function openColorPaletteHelp() {
  var help = window.open('palette.html','Color palette helper','height=800,width=600');
  if (window.focus) help.focus();
}

//Functions

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
  if (AppEditModal != null) return;
  var dlgDOM = document.querySelector("#modal_edit");
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  dlgDOM.querySelector("#paletteHelp").addEventListener('click', openColorPaletteHelp);
  AppEditModal = M.Modal.init(dlgDOM, dlgParams);
}

/**
 * Fills edit modal with an app data
 * @param {DOM} appDOM concerned app
 */
function setAppEditModalData(appDOM) {
  var dlgDOM = document.querySelector("#modal_edit");
  //Set data
  dlgDOM.querySelector("#appInput_title").value = appDOM.querySelector(".app-title").innerText;
  dlgDOM.querySelector("#appInput_detail").value = appDOM.querySelector(".app-detail").innerText;
  dlgDOM.querySelector("#appInput_image").value = (appDOM.querySelector(".app-image") != null ? appDOM.querySelector(".app-image").src : "");
  //Add serialize callback
  dlgDOM.querySelector("#edit-apply").addEventListener("click", function() { reportAppEditModalData(appDOM); });
}

/**
 * Grabs modal data and injects it in current editor state
 * @param {DOM} appDOM concerned app
 */
function reportAppEditModalData(appDOM) {
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
  AppDeleteModal.close();
  AppDeleteModal.destroy();
}

/**
 * Initialize App deletion modal
 */
var AppDeleteModal = null;
function initAppDeleteModal() {
  if (AppDeleteModal != null) return;
  var dlgDOM = document.querySelector("#modal_delete");
  dlgDOM.querySelector("#delete-confirm").addEventListener("click", deleteApp); //Bind delete
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  AppDeleteModal = M.Modal.init(dlgDOM, dlgParams);
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
  AppDeleteModal.open();
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
  initAppEditModal();
  initAppDeleteModal();
  toggleDragger();
  appNodes.forEach(function (app) {
    addDeleteBadge(app);
  });
}

/**
 * Toggle on/off app dragging
 */
function toggleDragger() {
  if (appDragger == null)
  {
    appDragger = dragula([document.querySelector("#app-container")]);
    appDragger.on("drop", setAppNodes); //Refresh appNodes list on drop
  }
  else if (appDragger.containers.length != 0) appDragger.containers = [];
  else appDragger.containers.push(document.querySelector("#app-container"));
}

/**
 * Close vault app editor
 */
function closeEditor(save) {
  //Disabling page editor
  var apps = document.getElementsByClassName("app");
  toggleDragger();
  [].forEach.call(apps, function (app) {
    removeDeleteBadge(app);
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
 * @param save : should we save on exit ?
 */
function toggleEditor(save) {
  var toggle = document.getElementById("toggleEditor");
  if (!toggle.classList.contains("active")) //Enable editor
  {
    toggle.children[0].innerHTML = "save"; //Changing icon
    toggle.classList.remove("inactive");
    toggle.classList.add("active");
    openEditor();
    //Toast to alert
    M.toast({html: "<span class=\"editorToast\">Vault is in edition mode</span><button id=\"revertEditor\" class=\"btn-flat toast-action\">Undo all</button>", displayLength: 999999});
    document.getElementById("revertEditor").addEventListener("click", revertEditor);
  }
  else //Saving and closing editor
  {
    closeEditor(save);
    toggle.children[0].innerHTML = "edit"; //Changing icon
    toggle.classList.remove("active");
    toggle.classList.add("inactive");
  }
  return (false);
}

/**
 * Cancels edition of apps and revert grid to JSON state
 */
function revertEditor() {
  toggleEditor(false);
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
  var appsJSON = {
    apps: []
  };
  appNodes.forEach(function (app) {
    var appObject = {};
    if (app.classList.contains("deleted")) appObject.deleted = true; //Mark for deletion
    appObject.title = getDescendantWithClass(app, "app-title").innerText;
    appObject.detail = getDescendantWithClass(app, "app-detail").innerText;
    appObject.url = app.href;
    //Get App image
    var image = app.querySelector(".app-image");
    appObject.image = (image != null ?  image.src : "");
    appsJSON.apps.push(appObject);
  });
  return(appsJSON);
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