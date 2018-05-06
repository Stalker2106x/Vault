/**
 * returns the DOM of an app by its position in the grid
 * @param {Integer} index of the app to get
 */
function getAppByIndex(index) {
    return (document.querySelectorAll(".app")[index]);
}

/**
 * Redirect url to the app currently selected (if any)
 */
function navigateToSelection() {
    var selection = document.querySelector(".app.selected");
    if (selection != undefined && selection != null) //If not null, goto
    {
        if (selection.getAttribute("href") == undefined) return;
        window.location.href = selection.getAttribute("href");
    }
}

/**
 * Updates navigation arrows surrounding app container
 */
function updateNavArrows() {
    if (window.innerWidth > document.querySelector('#app-container').clientWidth)
    {
        navButtons[0].style.display = "none";
        navButtons[1].style.display = "none";
    }
}

/**
 * Deselect the currently selected app
 */
function clearSelection() {
    var selection = document.querySelector(".app.selected"); //Get current selection
    if (selection != undefined && selection != null) //If not null, unselect
    {
        selection.classList.remove("selected");  //unselect previous
    }
}

/**
 * Selects an app
 * @param {DOM} app DOM to select
 */
function selectApp(app) {
    clearSelection();
    app.classList.add("selected"); //select current element
}

/**
 * Replaces the vertical scroll method by custom handler
 * @param {Event} event triggered by mouse wheel scroll
 */
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