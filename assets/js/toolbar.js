//Locals
var toolbarAdditionalToggles = [];

//Functions

function addButtonToToolbar(id, icon, tooltipText, callback)
{
    let button = document.createElement("li");
    button.innerHTML = '<a id="' + id + '" class="btn-floating yellow darken-1 tooltipped inactive" data-position="top" data-tooltip="' + tooltipText + '"><i class="material-icons">' + icon + '</i></a>';
    document.querySelector('#vault-toolbar-button').children[1].appendChild(button);
    document.getElementById(id).addEventListener("click", callback);
    return (button);
}

function verifyAuthorization()
{
    return (authorization_passphrase == appconfig.passphrase);
}

function unlockToolbar()
{
    if (!verifyAuthorization) return; //Requires authorization
    toolbarAdditionalToggles.push(addButtonToToolbar("toggleEditor", "create", "Toggle editor", toggleEditor));
    initToolbar(); //Init newly added buttons
}

function lockToolbar()
{
    if (isEditorEnabled()) //Check editior state, return if enabled
    {
        M.toast({html: '<span>Quit edition mode before locking vault.</span>'});
        return (false);
    }
    for (let toggle in toolbarAdditionalToggles) 
    {
        toolbar.children[1].removeChild(toolbarAdditionalToggles[toggle]); //Remove additional toggles
    }
    toolbarAdditionalToggles = []; //clear array
    return (true);
}

function initToolbar() {
    var toolbarInstance = M.FloatingActionButton.init(toolbar, {direction: "left", hoverEnabled: true});
    var activeTooltips = document.querySelectorAll(".tooltipped");
    for (var tooltip in activeTooltips)
    {
        M.Tooltip.init(activeTooltips[tooltip], {exitDelay: 2});
    }
}

var dlgAuth = null;
function authenticate() {
    let button = document.querySelector("#unlockVault");
    if (button.classList.contains("locked")) //app is locked
    {
        if (dlgAuth == null) //Create modal first time
        {
            var dlgHtml = nunjucks.render('templates/modal_auth.html');
            document.querySelector('#page-content').innerHTML += dlgHtml;
            dlgElem = document.querySelector('#modal_auth');
            dlgAuth = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
            document.querySelector('#submit-passphrase').addEventListener("click", function(){
                var passphraseInput = document.querySelector('#passphrase');
                if (passphraseInput.value == appconfig.passphrase) //auth success!
                {
                    button.querySelector(".material-icons").innerText = "lock_open";
                    authorization_passphrase = passphraseInput.value;
                    button.classList.remove("locked");
                    unlockToolbar();
                    //Toast to alert
                    M.toast({html: '<span>Unlocked Vault !</span>'});
                    dlgAuth.close();
                }
                else
                {
                    //Toast bad_passphrase
                    M.toast({html: '<span>Wrong passphrase!</span>'});
                }
            });
        }
        dlgAuth.open();
    }
    else //app unlocked
    {
        if (lockToolbar()) //attempt to lock
        {
            getDescendantWithClass(button, "material-icons").innerText = "lock";
            authorization_passphrase = "";
            button.classList.add("locked");
            //Toast to alert
            M.toast({html: '<span>Vault locked !</span>'});
        }
    }
}

