/* global M, nunjucks, appConfig, appDragger, authorization_passphrase */

//Helpers

/**
 * returns true if the vault is in edition mode, false if not
 */
var editing = false;
function isEditorEnabled() {
  return (editing);
}

/**
 * opens a popup with available color palette
 */
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
 * Initialize app edition modal
 */
var AppEditModal = null;
function initAppEditModal() {
  if (AppEditModal != null) return;
  var dlgDOM = document.querySelector("#modal_edit");
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  dlgDOM.querySelector(".paletteHelp").addEventListener("click", openColorPaletteHelp);
  dlgDOM.querySelector("#widgetSwitch").addEventListener("click", toggleAppWidget);
  AppEditModal = M.Modal.init(dlgDOM, dlgParams);
}

/**
 * Fills edit modal with an app data
 * @param {DOM} appDOM edited app DOM
 * @param {function} applyCallback function to call when clicking apply
 */
function setAppEditModalData(appDOM, applyCallback) {
  var dlgDOM = document.querySelector("#modal_edit");
  var appObject = appDOMtoJSON(appDOM);
  //Set data
  dlgDOM.querySelector("#appEdit_title").innerText = (appDOM.id == "newapp" ? "Create App" : appObject.title + " Settings");
  dlgDOM.querySelector("#appInput_title").value = appObject.title;
  var actionSelect = dlgDOM.querySelector("#appSelect_action");
  [].forEach.call(actionSelect.children, function (option) {
    option.selected = (option.value == appObject.action ? true : false);
  });
  M.FormSelect.init(actionSelect);
  dlgDOM.querySelector("#appInput_color").value = appObject.color;
  dlgDOM.querySelector("#appInput_detail").value = appObject.detail;
  dlgDOM.querySelector("#appInput_image").value = appObject.image;
  //Clear button to prevent duplicate events
  var applyBtn = dlgDOM.querySelector("#edit-apply");
  var applyCopy = applyBtn.cloneNode();
  while (applyBtn.firstChild) { applyCopy.appendChild(applyBtn.lastChild); }
  applyBtn.parentNode.replaceChild(applyCopy, applyBtn);
  // Add serialize callback
  dlgDOM.querySelector("#edit-apply").addEventListener("click", applyCallback);
  M.updateTextFields();
}

/**
 * returns JSON object containing modal app data
 */
function dumpAppEditModalData() {
  var appObject = {
    title: document.querySelector("#appInput_title").value,
    color: document.querySelector("#appInput_color").value
  };
  if (AppEditModalMode == "app")
  {
    appObject.detail = document.querySelector("#appInput_detail").value;
    appObject.image = document.querySelector("#appInput_image").value;
  }
  else if (AppEditModalMode == "widget")
  {
    appObject.html = document.querySelector("#appInput_html").value;
  }
  var actionSelect = document.querySelector("#appSelect_action");
  [].forEach.call(actionSelect.children, function (option) {
    if (option.selected && !option.disabled) appObject.action = option.value;
  });
  appObject.url = document.querySelector("#appInput_url").value;
  return (appObject);
}

/**
 * Extract data from app edition modal, and update concerned app with edits
 * @param {DOM} appDOM edited app DOM
 */
function reportAppEditModalData(appDOM) {
  var appObject = dumpAppEditModalData();
  var newAppDOM = buildAppDOMFromJSON(appObject);
  if (appDOM != undefined) appDOM.parentNode.replaceChild(newAppDOM, appDOM);
  else document.querySelector("#app-container").insertBefore(newAppDOM, document.querySelector("#newapp"));
  setAppNodes(); //Refresh app nodes
  addDeleteBadge(newAppDOM);
  bindAppEvents(newAppDOM);
  M.toast({html: "<span>Modifications applied.</span>"});
  AppEditModal.close();
}

/**
 * Initialize widget edition modal
 */
var AppEditModalMode = "app";
function toggleAppWidget() {
  if (AppEditModal == null) return;
  var dlgDOM = document.querySelector("#modal_edit");
  AppEditModalMode = (AppEditModalMode == "app" ? "widget" : "app");
  if (AppEditModalMode == "app")
  {
    dlgDOM.querySelector("#appEdit_widgetData").style.display = "none";
    dlgDOM.querySelector("#appEdit_appData").style.display = "block";
  }
  else if (AppEditModalMode == "widget")
  {
    dlgDOM.querySelector("#appEdit_appData").style.display = "none";
    dlgDOM.querySelector("#appEdit_widgetData").style.display = "block";
  }
}

/**
 * delete an application from grid
 * @param {DOM} appDOM app DOM to remove
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
 * set delete modal content before opening
 * @param {DOM} appDOM DOM of the app to remove
 */
function setAppDeleteModalData(appDOM) {
  var dlgDOM = document.querySelector("#modal_delete");
  dlgDOM.querySelector(".delete-prompt").innerText = "Delete " + (appDOM.querySelector(".app-title") != null ? appDOM.querySelector(".app-title").innerText : "App") + " ?";
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
  let badgeHTML = "<div class=\"btn-floating btn-small waves-effect waves-light red delete-badge\"><i class=\"material-icons delete-fix\">close</i></div>";
  app.innerHTML = badgeHTML + app.innerHTML;
}

/**
 * Remove delete badge to an app
 * @param {DOM} app DOM of app to remove delete badge from
 */
function removeDeleteBadge(app) {
  let badgeDOM = app.querySelector(".delete-badge");
  if (badgeDOM != null) badgeDOM.parentNode.removeChild(badgeDOM);
}

/**
 * Opens vault app editor
 */
function openEditor() {
  editing = true;
  initAppEditModal();
  initAppDeleteModal();
  toggleDragger();
  appNodes.forEach(function (app) {
    addDeleteBadge(app);
    bindAppEvents(app);
  });
  addNewAppPlaceholder();
}

/**
 * Toggle on/off app dragging
 */
function toggleDragger() {
  if (appDragger == null)
  {
    appDragger = dragula([document.querySelector("#app-container")], {
      moves: function (el, target, source, sibling) {
        if (el.classList.contains("placeholder")) return (false);
        return (true);
      }
    });
    appDragger.on("drop", setAppNodes); //Refresh appNodes list on drop
  }
  else if (appDragger.containers.length != 0) appDragger.containers = [];
  else appDragger.containers.push(document.querySelector("#app-container"));
}

/**
 * Adds a fake app with "+" to create a new app
 */
function addNewAppPlaceholder()
{
  var container = document.querySelector("#app-container");
  container.innerHTML += nunjucks.render("templates/new_app.html");
  setAppNodes();
  appNodes.forEach(function (app) {
    bindAppEvents(app);
  });
}

/**
 * Removes the fake "+" app
 */
function removeNewAppPlaceholder()
{
  var appContainer = document.querySelector("#app-container");
  appContainer.removeChild(appContainer.querySelector("#newapp"));
  setAppNodes();
}

/**
 * Close vault app editor
 */
function closeEditor(save) {
  editing = false;
  //Disabling page editor
  var apps = document.getElementsByClassName("app");
  if (AppEditModal.isOpen) AppEditModal.close(); //Close modal if open
  toggleDragger();
  removeNewAppPlaceholder();
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
 * @param {bool} save : true to save on exit, false to skip saving
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
 * @param {DOM} app DOM of the app to convert
 */
function appDOMtoJSON(app) {
  var appObject = {};
  appObject.title = (app.querySelector(".app-title") != null ? app.querySelector(".app-title").innerText : "");
  appObject.url = (app.getAttribute("href") != undefined ? app.getAttribute("href") : "");
  appObject.color = (app.querySelector(".card").getAttribute("color") != "blue-grey" ? app.querySelector(".card").getAttribute("color") : "");
  appObject.action = (app.getAttribute("action") != undefined ? app.getAttribute("action") : "none");
  //Get App image
  if (app.querySelector(".app-widget") != null) //Widget
  {
    appObject.html = (app.querySelector(".app-widget") != null ? app.querySelector(".app-widget").innerHTML : "");
  }
  else
  {
    var image = app.querySelector(".app-image");
    appObject.image = (image != null ?  image.getAttribute("src") : "");
    appObject.detail = (app.querySelector(".app-detail") != null ? app.querySelector(".app-detail").innerText : "");
  }
  return (appObject);
}

/**
 * Dump all vault apps to JSON array
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