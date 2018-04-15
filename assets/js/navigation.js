
function getAppByIndex(index) {
    return (document.querySelectorAll(".app")[index]);
}

function navigateToSelection() {
    var selection = document.querySelector(".app.selected");
    if (selection != undefined && selection != null) //If not null, goto
    {
        if (selection.getAttribute("href") == undefined) return;
        window.location.href = selection.getAttribute("href");
    }
}

function updateNavArrows() {
    if (window.innerWidth > document.querySelector('#app-container').clientWidth)
    {
        navButtons[0].style.display = "none";
        navButtons[1].style.display = "none";
    }
}

function clearSelection() {
    var selection = document.querySelector(".app.selected"); //Get current selection
    if (selection != undefined && selection != null) //If not null, unselect
    {
        selection.classList.remove("selected");  //unselect previous
    }
}

function selectApp(app) {
    clearSelection();
    app.classList.add("selected"); //select current element
}

function replaceVerticalScrollByHorizontal(event) {
    var motion = (event.deltaY > 0 ? 1 : -1); // interpret scroll horizonally motion
    if (event.deltaY != 0) {
        var selection = document.querySelector(".app.selected"); //Get current selection
        if (selection == undefined || selection == null) //If null, select first app
        {
            emptySelection = true;
            selection = document.querySelector(".app"); //Grab first app
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
            selection = document.querySelectorAll(".app")[appIndex];
        }
        selection.classList.add("selected");  //select app
        selection.scrollIntoView({ block: 'start',  behavior: 'smooth' });
        updateNavArrows();
        // prevent vertical scroll
        event.preventDefault();
    }
    return;
}