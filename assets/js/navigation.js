
function getSelectedApp() {
    return (findFirstChildByClass(document.getElementById("app-container"), "selected"));
}

function getAppByIndex(index) {
    return (getElementsByClassName("app")[index]);
}

function navigateToSelection() {
    var app = getSelectedApp();
    if (app == undefined || app.getAttribute("href") == undefined) return;
    window.location.href = app.getAttribute("href");
}

function updateNavArrows() {
    if (window.innerWidth > document.getElementById('app-container').clientWidth)
    {
        navButtons[0].style.display = "none";
        navButtons[1].style.display = "none";
    }
}

function clearSelection() {
    var selection = getSelectedApp(); //Get current selection
    if (selection != null) //If not null, unselect
    {
        var appIndex = appNodes.indexOf(selection);
        selection.classList.remove("selected");  //unselect previous
    }
}

function selectApp(app) {
    clearSelection();
    app.classList.add("selected"); //select current element
}

function updateSelection(event) {
    selectApp(event.currentTarget); //select current element
}

function replaceVerticalScrollByHorizontal(event) {
    var motion = (event.deltaY > 0 ? 1 : -1); // interpret scroll horizonally motion
    if (event.deltaY != 0) {
        var selection = getSelectedApp(); //Get current selection
        if (selection == null) //If null, select first app
        {
            emptySelection = true;
            selection = getAppByIndex(0);
        }
        else
        {
            var appIndex = appNodes.indexOf(selection);
            if (appIndex + motion < 0 || appIndex + motion >= appNodes.length) return; //Out of range
            appIndex += motion;
            while (appNodes[appIndex].style.display == "none") //Search next app
            {
                appIndex += motion;
                if (appIndex < 0 || appIndex >= appNodes.length) return; //Out of range
            }
            selection.classList.remove("selected");  //unselect previous
            selection = getAppByIndex(appIndex);
        }
        selection.classList.add("selected");  //select app
        selection.scrollIntoView({ block: 'start',  behavior: 'smooth' });
        updateNavArrows();
        // prevent vertical scroll
        event.preventDefault();
    }
    return;
}