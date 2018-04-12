//Locals
var toolbarAdditionalToggles = [];

//Functions

function addButtonToToolbar(id, icon, callback)
{
    let button = document.createElement("li");
    button.innerHTML = '<a id="' + id + '" class="btn-floating yellow darken-1 inactive"><i class="material-icons">' + icon + '</i></a>';
    document.getElementById('vault-toolbar-button').children[1].appendChild(button);
    document.getElementById(id).addEventListener("click", callback);
    toolbarInstance = M.FloatingActionButton.init(toolbar, {direction: "left", hoverEnabled: true});
    return (button);
}

function verifyAuthorization()
{
    return (authorization_passphrase == appconfig.passphrase);
}

function unlockToolbar()
{
    if (!verifyAuthorization) return; //Requires authorization
    toolbarAdditionalToggles.push(addButtonToToolbar("toggleEditor", "create", toggleEditor));
}

function lockToolbar()
{
    for (let toggle in toolbarAdditionalToggles)
    {
        toggle.remove();
    }
    toolbarAdditionalToggles = []; //clear array
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
            getDescendantWithClass(button, "material-icons").innerText = "lock";
            authorization_passphrase = "";
            button.classList.add("locked");
            lockToolbar();
            //Toast to alert
            M.toast({html: '<span>Vault locked !</span>'});
        }
    });
}

var toolbarInstance = M.FloatingActionButton.init(toolbar, {direction: "left", hoverEnabled: true});