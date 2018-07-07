/* global appNodes */

/**
 * filter apps displayed on grid based on search bar contents
 */
function filterApps() {
  var filter = this.value.toLowerCase();
  var firstMatching = true;
  if (filter == "")
  {
    appNodes.forEach(function (app) {
      app.style.display = "";
    });
    return;
  }
  appNodes.forEach(function (app) {
    if (app.querySelector(".app-title").innerText.toLowerCase().indexOf(filter) < 0 //Filter title
      && app.querySelector(".app-detail").innerText.toLowerCase().indexOf(filter) < 0) //Filter detail
    {
      app.style.display = "none";
    }
    else 
    {
      if (firstMatching)
      {
        firstMatching = false;
        selectApp(app);
      }
      if (app.style.display == "none")
      {
        app.style.display = "";
      }
    }
  });
}