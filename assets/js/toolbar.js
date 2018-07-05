/* global M, nunjucks, authorization_passphrase, appConfig */

//Locals
var toolbarAdditionalToggles = [];

//Functions

/**
 * Adds a button to vault toolbar
 * @param {String} id of the button to inject
 * @param {String} icon identifier of Material Icons atlas
 * @param {String} color of the button
 * @param {String} tooltipText tooltip on button hover
 * @param {Function} callback to execute on click
 */
function addButtonToToolbar(id, icon, color, tooltipText, callback)
{

}

/**
 * Checks if the stored passphrase equals the JSON config one
 */
function verifyAuthorization()
{
  return (authorization_passphrase == appConfig.passphrase);
}

/**
 * Inject admin tools/buttons to vault toolbar
 */
function unlockToolbar()
{
  if (!verifyAuthorization) return; //Requires authorization
  //Editor toggle injection
  var toggleEditor = document.createElement("li");
  toggleEditor.innerHTML = '<a id="toggleEditor" class="btn-floating blue darken-1 tooltipped inactive" data-position="top" data-tooltip="Toggle Editor"><i class="material-icons">create</i></a>';
  toggleEditor.addEventListener("click", toggleEditor);
  toolbarAdditionalToggles.push(toggleEditor);
  toolbar.querySelector("ul").appendChild(toggleEditor);
  //Vault config opener injection
  var vaultConfig = document.createElement("li");
  vaultConfig.innerHTML = '<a id="vaultConfig" href="#modal_config" class="btn-floating blue darken-1 tooltipped inactive modal-trigger" data-position="top" data-tooltip="Configure Vault"><i class="material-icons">gear</i></a>';
  toolbarAdditionalToggles.push(vaultConfig);
  toolbar.querySelector("ul").appendChild(vaultConfig);
  initToolbar(); //Init newly added buttons
}

/**
 * Locks toolbar and removes admin tools/buttons from toolbar
 */
function lockToolbar()
{
  if (isEditorEnabled()) //Check editior state, return if enabled
  {
    M.toast({html: "<span>Quit edition mode before locking vault.</span>"});
    return (false);
  }
  for (let toggle in toolbarAdditionalToggles) 
  {
    toolbar.querySelector("ul").removeChild(toolbarAdditionalToggles[toggle]); //Remove additional toggles
  }
  toolbarAdditionalToggles = []; //clear array
  return (true);
}

/**
 * Initialize base toolbar with JS anims
 */
function initToolbar() {
  M.FloatingActionButton.init(toolbar, {direction: "left", hoverEnabled: true});
  var activeTooltips = document.querySelectorAll(".tooltipped");
  for (var tooltip in activeTooltips)
  {
    M.Tooltip.init(activeTooltips[tooltip], {exitDelay: 2});
  }
  document.getElementById("scrollHome").addEventListener("click", function() { appCursor = 0; document.getElementById("app-container").scroll(0,0); }); //Bind scrollTop handler
  document.getElementById("unlockVault").addEventListener("click", authenticate); //Bind unlocking handler
}
