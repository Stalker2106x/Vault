//Global auth token
var authorization_passphrase = "";

//Helpers

/**
 * Change tagName of an element
 */
function changeElementTagName(element, old, wanted) {
  let regexp = "/"+old+"/g";
  element.outerHTML = element.outerHTML.replace(regexp,wanted);
}

/**
 * Gets index of element within its container
 */
function getElementIndex(node) {
  var index = 0;
  while ( (node = node.previousElementSibling) ) {
    index++;
  }
  return index;
}

/**
 * Gets the first child in the element childs (not multilevel)
 */
function getDescendantWithClass(element, clName) {
  var children = element.childNodes;
  for (var i = 0; i < children.length; i++) {
    if (children[i].className &&
            children[i].className.split(" ").indexOf(clName) >= 0) {
      return children[i];
    }
  }
  for (var i = 0; i < children.length; i++) {
    var match = getDescendantWithClass(children[i], clName);
    if (match !== null) {
      return match;
    }
  }
  return null;
}

/**
 * Gets the first child in the element hierarchy
 */
function findFirstChildByClass(element, className) {
  var foundElement = null, found;
  function recurse(element, className, found) {
    for (var i = 0; i < element.childNodes.length && !found; i++) {
      var el = element.childNodes[i];
      var classes = el.className != undefined? el.className.split(" ") : [];
      for (var j = 0, jl = classes.length; j < jl; j++) {
        if (classes[j] == className) {
          found = true;
          foundElement = element.childNodes[i];
          break;
        }
      }
      if(found)
        break;
      recurse(element.childNodes[i], className, found);
    }
  }
  recurse(element, className, false);
  return (foundElement);
}

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
 * loads the whole Vault from JSON data
 */
function loadVault() {
  return (new Promise(function (resolve, reject) {
    //Getting global vault configuration
    loadConfig();
    if (appNodes.length != 0) clearApps();
    //Rendering app tiles
    loadJSON("data/apps.json", function(json){
      var data = JSON.parse(json);
      for (var i in data.apps)
      {
        var appHtml;
        //Defaults
        if (!data.apps[i].color) data.apps[i].color = "blue-grey"; else data.apps[i].color = data.apps[i].color.toLowerCase();
        if (!data.apps[i].textcolor) data.apps[i].textcolor = "white"; else data.apps[i].textcolor = data.apps[i].textcolor.toLowerCase();
        //Render
        if (data.apps[i].image) //Image app
        {
          appHtml = nunjucks.render("templates/app_image.html", data.apps[i]);
        }
        else if (data.apps[i].action && data.apps[i].url) //Standard app
        {
          appHtml = nunjucks.render("templates/app_base.html", data.apps[i]);
        }
        else //Not an app (note or alert)
        {
          appHtml = nunjucks.render("templates/app_panel.html", data.apps[i]);
        }
        document.getElementById("app-container").innerHTML += appHtml;
      }
      appNodes = [].slice.call(document.getElementById("app-container").children);
      resolve();
    });
  }));
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
    preventScrolling: true,
    onOpenStart: fillVaultConfigModalData
  }
  M.updateTextFields();
  var bgSelect = M.FormSelect.init(dlgDOM.querySelector("#configSelect_background"));
  VaultConfigModal = M.Modal.init(dlgDOM, dlgParams);
}

/**
 * fill the vault configuration modal data
 */
function fillVaultConfigModalData() {
  var dlgDOM = document.querySelector("#modal_config");
  dlgDOM.querySelector("#configInput_title").value = appConfig.title;
  dlgDOM.querySelector("#configInput_caption").value = appConfig.caption;
  dlgDOM.querySelector("#configInput_passphrase").value = "";
}

/**
 * initialize the vault authentication modal
 */
var AuthModal = null;
function initAuthModal()
{
  var dlgDOM = document.querySelector("#modal_auth");
  dlgDOM.querySelector("#submit-passphrase").addEventListener("click", function(){
    var authorization_passphrase = document.querySelector("#passphrase").value;
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
      getDescendantWithClass(button, "material-icons").innerText = "lock";
      authorization_passphrase = "";
      button.classList.add("locked");
      //Toast to alert
      M.toast({html: "<span>Vault locked !</span>"});
    }
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
loadVault().then(function() {
  appNodes.forEach(function(app) {
    bindAppClick(app, navigateToSelection);
    app.addEventListener("mouseover", function (event) { selectApp(event.currentTarget); }); //Bind selection handler
    app.addEventListener("mouseleave", clearSelection); //Bind clearSelection handler
  });
  updateNavArrows();
});
//APP END