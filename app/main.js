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
 * Empties the app grid
 */
function clearApps() {
  appNodes = [];
  document.getElementById("app-container").innerHTML = ""; //Empty container content
}

function loadConfig() {
  loadJSON("data/config.json", function(json){
    appConfig = JSON.parse(json);
    document.getElementById("vault-title").innerText = appConfig.title;
    document.getElementById("vault-caption").innerText = appConfig.caption;
    document.body.style.backgroundImage= "url('./assets/img/"+appConfig.background+".jpg')";
  });
}

/**
 * Converts a JSON app to an html DOM
 */
function buildAppDOMFromJSON(app)
{
  var appDOM;
  //Inject defaults
  if (!app.color) app.color = "blue-grey"; else app.color = app.color.toLowerCase();
  if (!app.textcolor) app.textcolor = "white"; else app.textcolor = app.textcolor.toLowerCase();
  //Render
  if (app.image) //Image app
  {
    appDOM = nunjucks.render("templates/app_image.html", app);
  }
  else if (app.action && app.url) //Standard app
  {
    appDOM = nunjucks.render("templates/app_base.html", app);
  }
  else //Not an app (note or alert)
  {
    appDOM = nunjucks.render("templates/app_panel.html", app);
  }
  return (appDOM);
}

/**
 * loads the whole Vault from JSON data
 */
function loadApps() {
  if (appNodes.length != 0) clearApps();
  //Rendering app tiles
  loadJSON("data/apps.json", function(json){
    JSON.parse(json).forEach(function (app) {
      document.getElementById("app-container").innerHTML += buildAppDOMFromJSON(app);
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
  return (true);
}

/**
 * Binds the click behaviour to an app
 * @param {DOMElement} app DOM to bind click callback to
 * @param {Function} callback Callback to bind to event
 */
function bindAppClick(app, callback) {
  if (app.getAttribute("href") != undefined)
  {
    app.classList.add("app-link");
    app.addEventListener("click", callback); //Bind navigation handler
  }
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
  var bgSelect = M.FormSelect.init(dlgDOM.querySelector("#configSelect_background"));
  VaultConfigModal = M.Modal.init(dlgDOM, dlgParams);
}

/**
 * fill the vault configuration modal data
 */
function setVaultConfigModalData() {
  var dlgDOM = document.querySelector("#modal_config");
  dlgDOM.querySelector("#configInput_title").value = appConfig.title;
  dlgDOM.querySelector("#configInput_caption").value = appConfig.caption;
  var bgSelect = dlgDOM.querySelector("#configSelect_background");
  [].forEach.call(bgSelect.children, function (option) {
    option.selected = (option.value == appConfig.background ? true : false);
  });
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
 * Prompt the user for passphrase, to trigger unlock of vault if correct
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
 */
function bindAppEvents(app) {
  bindAppClick(app, navigateToSelection);
  app.querySelector(".card").addEventListener("mouseover", function () { selectApp(app); }); //Bind selection handler
  app.querySelector(".card").addEventListener("mouseleave", clearSelection); //Bind clearSelection handler
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