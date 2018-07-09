/* global M, appConfig, appDragger, authorization_passphrase */

//Helpers

/**
 * checks if the vault is in edition mode
 */
function isEditorEnabled() {
  return (document.querySelector("#toggleEditor.active") == null ? false : true);
}

function openColorPaletteHelp() {
  var help = window.open("palette.html", "Color palette helper", "height=800, width=600");
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
  dlgDOM.querySelector("#paletteHelp").addEventListener("click", openColorPaletteHelp);
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
  dlgDOM.querySelector("#appInput_color").value = (appDOM.querySelector(".card").getAttribute("color") != "blue-grey" ? appDOM.querySelector(".card").getAttribute("color") : "");
  dlgDOM.querySelector("#appInput_image").value = (appDOM.querySelector(".app-image") != null ? appDOM.querySelector(".app-image").getAttribute("src") : "");
  //Clear button to prevent duplicate events
  var applyBtn = dlgDOM.querySelector("#edit-apply");
  var applyCopy = applyBtn.cloneNode();
  while (applyBtn.firstChild) { applyCopy.appendChild(applyBtn.lastChild); }
  applyBtn.parentNode.replaceChild(applyCopy, applyBtn);
  // Add serialize callback
  dlgDOM.querySelector("#edit-apply").addEventListener("click", function report() { reportAppEditModalData(appDOM); });
  M.updateTextFields();
}

/**
 * Grabs modal data and injects it in current editor state
 * @param {DOM} appDOM concerned app
 */
function reportAppEditModalData(appDOM) {
  appObject = {
    title: document.querySelector("#appInput_title").value,
    detail: document.querySelector("#appInput_detail").value,
    color: document.querySelector("#appInput_color").value,
    image: document.querySelector("#appInput_image").value
  };
  var newAppDOM = document.createElement("div");
  newAppDOM.innerHTML = buildAppDOMFromJSON(appObject);
  newAppDOM = newAppDOM.firstChild;
  appDOM.parentNode.replaceChild(newAppDOM, appDOM);
  bindAppEvents(newAppDOM);
  addDeleteBadge(newAppDOM);
  setAppNodes(); //Refresh app nodes
  M.toast({html: "<span>Modifications applied.</span>"});
  AppEditModal.close();
}

/**
 * delete an application from grid
 * @param {DOM} appDOM concerned app
 */
function deleteApp(appDOM) {
  var appContainer = document.querySelector("#app-container");
  appContainer.removeChild(appDOM);
  setAppNodes();
  M.toast({html: "<span>Deleted app !</span>"});
  AppDeleteModal.close();
}

/**
 * Initialize App deletion modal
 */
var AppDeleteModal = null;
function initAppDeleteModal() {
  if (AppDeleteModal != null) return;
  var dlgDOM = document.querySelector("#modal_delete");
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
function setAppDeleteModalData(appDOM) {
  var dlgDOM = document.querySelector("#modal_delete");
  dlgDOM.querySelector(".delete-prompt").innerText = "Delete " + appDOM.querySelector(".app-title").innerText; + " ?";
  //Clear button to prevent duplicate events
  var confirmBtn = dlgDOM.querySelector("#delete-confirm");
  var confirmCopy = confirmBtn.cloneNode();
  while (confirmBtn.firstChild) { confirmCopy.appendChild(confirmBtn.lastChild); }
  confirmBtn.parentNode.replaceChild(confirmCopy, confirmBtn);
  //Bind delete callback
  dlgDOM.querySelector("#delete-confirm").addEventListener("click", function() { deleteApp(appDOM); });
  AppDeleteModal.open();
}

/**
 * Add delete badge to an app
 * @param {DOM} app DOM of app to add delete badge to
 */
function addDeleteBadge(app) {
  let badgeHTML = "<i class=\"delete-badge material-icons\">cancel</i>";
  app.innerHTML = badgeHTML + app.innerHTML;
  app.querySelector(".delete-badge").addEventListener("click", function () { setAppDeleteModalData(app); });
}

/**
 * Add delete badge to an app
 * @param {DOM} app DOM of app to add delete badge to
 */
function removeDeleteBadge(app) {
  let badgeDOM = app.querySelector(".delete-badge");
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
    bindAppEvents(app);
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
  if (AppEditModal.isOpen) AppEditModal.close(); //Close modal if open
  toggleDragger();
  [].forEach.call(apps, function (app) {
    removeDeleteBadge(app);
    bindAppEvents(app);
  });
  var toastContainer = document.getElementById("toast-container");
  [].forEach.call(toastContainer.children, function (toast) {
    if (toast.querySelector(".editorToast") != null)
    {
      toastContainer.removeChild(toast);
    }
  });
  if (save)
  {
    serializeData("apps");
    M.toast({html: "<span>Modifications saved with success.</span>"});
  }
  else
  {
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
  loadApps();
}

/**
 * Converts an app DOM to JSON Object
 */
function appDOMtoJSON(app) {
  var appObject = {};
  appObject.title = app.querySelector(".app-title").innerText;
  appObject.detail = app.querySelector(".app-detail").innerText;
  appObject.url = app.getAttribute("href");
  //Get App image
  var image = app.querySelector(".app-image");
  appObject.image = (image != null ?  image.getAttribute("src") : "");
  return (appObject);
}

/**
 * Dump vault apps to JSON object
 */
function dumpVaultApps() {
  //Collecting apps data
  var apps = [];
  appNodes.forEach(function (app) {
    apps.push(appDOMtoJSON(app));
  });
  return(apps);
}

/**
 * Serialize JSON data to serialization object
 * @param {String} type Identifier for data type {"config" or "apps"}
 */
function serializeData(type) {
  const req = new XMLHttpRequest();
  req.onreadystatechange = function(event) {
    // XMLHttpRequest.DONE === 4
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        //Success!
      } else {
        console.log("Server error: %d (%s:%s)", this.status, this.statusText, this.responseText);
      }
    }
  };
  var postData = {
    passphrase: authorization_passphrase
  };
  if (type == "config") postData.config = appConfig;
  if (type == "apps") postData.apps = dumpVaultApps();

  req.open("POST", "data/serialize.php", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(postData));
}