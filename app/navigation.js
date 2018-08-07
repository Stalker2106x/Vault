/* global appNodes, navButtons */

/**
 * Execute action of the app currently selected (if any)
 * Redirects or opens configuration
 */
function navigateToSelection() {
  var selection = document.querySelector(".app.selected");
  if (selection != undefined && selection != null) //If not null, execute
  {
    if (!isEditorEnabled()) //Navigate
    {
      var url = selection.getAttribute("href");
      if (url == undefined || selection.getAttribute("action") == undefined) return;
      switch(selection.getAttribute("action"))
      {
      case "redirect":
        window.location.href = url;
        break;
      case "newtab":
        window.open(url, "_blank");
        break;
      case "popup":
        window.open(url, "Target", "resizable=yes");
        break;
      case "modal":
        openModalIFrameVault(url);
        break
      default:
        break;
      }
    }
    else //Editor
    {
      setAppEditModalData(selection, function() {
        if (selection.id == "newapp") reportAppEditModalData();
        else reportAppEditModalData(selection);
      });
      AppEditModal.open();
    }
  }
}

/**
 * Updates navigation arrows surrounding app container
 */
function updateNavArrows() {
  if (window.innerWidth > document.querySelector("#app-container").clientWidth)
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
 * @param {DOMElement} app DOM to select
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
    if (selection == null) selection = appNodes[0]; //If null, select first app
    else //Else, increment
    {
      var appIndex = appNodes.indexOf(selection);
      if (appIndex + motion < 0 || appIndex + motion >= appNodes.length) return; //Out of range
      appIndex += motion;
      while (appNodes[appIndex].style.display == "none") //Search next app
      {
        appIndex += motion;
        if (appIndex < 0 || appIndex >= appNodes.length) return; //Out of range
      }
      selection = appNodes[appIndex];
    }
    selectApp(selection);
    selection.scrollIntoView({ block: "start",  behavior: "smooth" });
    updateNavArrows();
    // prevent vertical scroll
    event.preventDefault();
  }
  return;
}

/**
 * open a vault iframe modal
 */
function openModalIFrameVault(url)
{
  if(IFrameModal != null) {
    document.querySelector("#modal-iframe").setAttribute("src", url);
    IFrameModal.open();
  } else {
    M.toast({html: "<span>Error opening modal</span>"});
  }
}