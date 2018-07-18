/* global M, nunjucks */

//Global auth token
var authorization_passphrase = "";

/**
 * Extract data from JSON file, and execute given callback when loaded
 * @param {String} file path of file to load
 * @param {Function} callback function to execute when loaded
 */
function loadJSON(file, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", file, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

/**
 * Empties the app container, and app nodes array
 */
function clearApps() {
  appNodes = [];
  document.getElementById("app-container").innerHTML = ""; //Empty container content
}

/**
 * fills appConfig object with JSON config
 */
function loadConfig() {
  loadJSON("data/config.json", function(json){
    appConfig = JSON.parse(json);
    document.getElementById("vault-title").innerText = appConfig.title;
    document.getElementById("vault-caption").innerText = appConfig.caption;
    document.body.style.backgroundImage= "url('./assets/img/"+appConfig.background+".jpg')";
  });
}

/**
 * filter apps displayed on grid based on search bar contents
 */
function filterApps() {
  var filter = this.value.toLowerCase();
  var firstMatching = true;
  if (filter == "")
  {
    appNodes.forEach(function (app) {
      app.style.display = "";
    });
    return;
  }
  appNodes.forEach(function (app) {
    if (app.querySelector(".app-title").innerText.toLowerCase().indexOf(filter) < 0 //Filter title
      && app.querySelector(".app-detail").innerText.toLowerCase().indexOf(filter) < 0) //Filter detail
    {
      app.style.display = "none";
    }
    else 
    {
      if (firstMatching)
      {
        firstMatching = false;
        selectApp(app);
      }
      if (app.style.display == "none")
      {
        app.style.display = "";
      }
    }
  });
}

/**
 * Converts a JSON app to an html DOM
 * @param app JSON data of the app to render
 */
function buildAppDOMFromJSON(app)
{
  var appDOM = document.createElement("div");
  if (app == undefined) return (appDOM);
  //Inject defaults
  if (!app.action) app.action = "redirect";
  if (!app.color) app.color = "blue-grey"; else app.color = app.color.toLowerCase();
  if (!app.textcolor) app.textcolor = "white"; else app.textcolor = app.textcolor.toLowerCase();
  //Render
  if (app.html) //Widget
  {
    appDOM.innerHTML = nunjucks.render("templates/app_widget.html", app);
    appDOM.querySelector(".app-widget").innerHTML = app.html;
  }
  else if (app.image) //Image app
  {
    appDOM.innerHTML = nunjucks.render("templates/app_image.html", app);
  }
  else if (app.title) //Standard app
  {
    appDOM.innerHTML = nunjucks.render("templates/app_base.html", app);
  }
  else //Not an app (note or alert)
  {
    appDOM.innerHTML = nunjucks.render("templates/app_panel.html", app);
  }
  return (appDOM.firstChild);
}

/**
 * loads all the Vault apps from JSON data
 */
function loadApps() {
  if (appNodes.length != 0) clearApps();
  //Rendering app tiles
  loadJSON("data/apps.json", function(json){
    JSON.parse(json).forEach(function (app) {
      document.getElementById("app-container").appendChild(buildAppDOMFromJSON(app));
    });
    setAppNodes();
    appNodes.forEach(function(app) {
      bindAppEvents(app);
    });
  });
}

/**
 * Fills appNodes array with current node order
 */
function setAppNodes()
{
  appNodes = [].slice.call(document.getElementById("app-container").children);
}

/**
 * initialize the vault configuration modal
 */
var VaultConfigModal = null;
function initVaultConfigModal() {
  var dlgDOM = document.querySelector("#modal_config");
  dlgDOM.querySelector("#config-apply").addEventListener("click", serializeVaultConfigModalData);
  var dlgParams = {
    dismissible: true,
    preventScrolling: true,
    onOpenStart: setVaultConfigModalData
  };
  M.updateTextFields();
  VaultConfigModal = M.Modal.init(dlgDOM, dlgParams);
}

/**
 * fill the vault configuration modal data before opening
 */
function setVaultConfigModalData() {
  var dlgDOM = document.querySelector("#modal_config");
  dlgDOM.querySelector("#configInput_title").value = appConfig.title;
  dlgDOM.querySelector("#configInput_caption").value = appConfig.caption;
  var bgSelect = dlgDOM.querySelector("#configSelect_background");
  [].forEach.call(bgSelect.children, function (option) {
    option.selected = (option.value == appConfig.background ? true : false);
  });
  M.FormSelect.init(bgSelect);
  dlgDOM.querySelector("#configInput_passphrase").value = "";
}

/**
 * serializes the vault configuration data to json
 */
function serializeVaultConfigModalData() {
  var dlgDOM = document.querySelector("#modal_config");
  appConfig.title = dlgDOM.querySelector("#configInput_title").value;
  appConfig.caption = dlgDOM.querySelector("#configInput_caption").value;
  var bgSelect = dlgDOM.querySelector("#configSelect_background");
  [].forEach.call(bgSelect.children, function (option) {
    if (option.selected && !option.disabled) appConfig.background = option.value;
  });
  appConfig.passphrase = dlgDOM.querySelector("#configInput_passphrase").value;
  VaultConfigModal.close();
  serializeData("config");
  M.toast({html: "<span>Modifications applied.</span>"});
  //Reload changes
  loadConfig();
}

/**
 * initialize the vault authentication modal
 */
var AuthModal = null;
function initAuthModal()
{
  var dlgDOM = document.querySelector("#modal_auth");
  dlgDOM.querySelector("#submit-passphrase").addEventListener("click", function(){
    authorization_passphrase = document.querySelector("#passphrase").value;
    if (authorization_passphrase == appConfig.passphrase) //auth success!
    {
      let button = document.querySelector("#unlockVault");
      button.querySelector(".material-icons").innerText = "lock_open";
      button.classList.remove("locked");
      unlockToolbar();
      //Toast to alert
      M.toast({html: "<span>Unlocked Vault !</span>"});
      AuthModal.close();
    }
    else
    {
      //Toast bad_passphrase
      M.toast({html: "<span>Wrong passphrase!</span>"});
    }
  });
  var dlgParams = {
    dismissible: true,
    preventScrolling: true
  };
  AuthModal = M.Modal.init(dlgDOM, dlgParams);
  M.updateTextFields();
}

/**
 * callback of lock/unlock button
 */
function authenticate() {
  let button = document.querySelector("#unlockVault");
  if (button.classList.contains("locked")) //app is locked
  {
    AuthModal.open();
  }
  else //app unlocked
  {
    if (lockToolbar()) //attempt to lock
    {
      button.querySelector(".material-icons").innerText = "lock";
      authorization_passphrase = "";
      button.classList.add("locked");
      //Toast to alert
      M.toast({html: "<span>Vault locked !</span>"});
    }
  }
}

/**
 * Bind app navigation, hover and various events to an app
 * @param {DOM} app DOM to bind events to
 */
function bindAppEvents(app) {
  app.classList.add("app-link");
  app.addEventListener("click", navigateToSelection); //Bind navigation handler
  app.querySelector(".card").addEventListener("mouseover", function () { selectApp(app); }); //Bind selection handler
  app.querySelector(".card").addEventListener("mouseleave", clearSelection); //Bind clearSelection handler
  if (isEditorEnabled())
  {
    var deleteBadge = app.querySelector(".delete-badge");
    if (deleteBadge != null) deleteBadge.addEventListener("click", function () { setAppDeleteModalData(app); });
  }
}

//APP BEGIN
var appDragger = null;
var appConfig = {};
var appNodes = [];
//Comportement listeners
var navButtons = document.getElementsByClassName("app-nav");
window.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    navigateToSelection();
  }
});
var toolbar = document.getElementById("vault-toolbar-button");
//Init
window.addEventListener("wheel", replaceVerticalScrollByHorizontal); //Bind Horz scroll handler
document.getElementById("filterInput").addEventListener("input", filterApps); //Bind filter handler
initToolbar();
initAuthModal();
//Main
//Getting global vault configuration
loadConfig();
//Getting apps
loadApps();
//APP END