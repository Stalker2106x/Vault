//Locals
var toolbarAdditionalToggles = [];

//Functions

function addButtonToToolbar(id, icon, tooltipText, callback)
{
    let button = document.createElement("li");
    button.innerHTML = '<a id="' + id + '" class="btn-floating yellow darken-1 tooltipped inactive" data-position="top" data-tooltip="' + tooltipText + '"><i class="material-icons">' + icon + '</i></a>';
    document.getElementById('vault-toolbar-button').children[1].appendChild(button);
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
    var activeTooltips = document.getElementsByClassName("tooltipped");
    for (var tooltip in activeTooltips)
    {
        M.Tooltip.init(activeTooltips[tooltip], {exitDelay: 2});
    }
}

//Main

var toolbar = document.getElementById('vault-toolbar-button');
//RocketTop
document.getElementById("scrollHome").addEventListener("click", function() { appCursor = 0; document.getElementById('app-container').scroll(0,0); });

//Authentication lock
if (true/* !remote || remote &&  appconfig.allow-remote-edition == true*/)
{
    let button = document.getElementById("unlockVault");
    var dlgAuth;
    document.getElementById("unlockVault").addEventListener("click", function () {
        if (button.classList.contains("locked")) //app is locked
        {
            var dlgElem = document.getElementById('modal_auth');
            if (dlgElem == null) //Create modal first time
            {
                var dlgHtml = nunjucks.render('templates/modal_auth.html');
                document.getElementById('page-content').innerHTML += dlgHtml;
                dlgElem = document.getElementById('modal_auth');
                dlgAuth = M.Modal.init(dlgElem, {dismissible: true, preventScrolling: true});
                document.getElementById('submit-passphrase').addEventListener("click", function(){
                    var passphraseInput = document.getElementById('passphrase');
                    if (passphraseInput.value == appconfig.passphrase) //auth success!
                    {
                        getDescendantWithClass(button, "material-icons").innerText = "lock_open";
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
    });
}

initToolbar();