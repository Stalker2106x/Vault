/**
 * initialize the iFrame modal
 */
var IFrameModal = null;
function initFrameModal()
{
    var dlgDOM = document.getElementById('modal_frame');
    var dlgParams = {
        dismissible: true,
        preventScrolling: true,
    };
    IFrameModal = M.Modal.init(dlgDOM, dlgParams);
    M.updateTextFields();
}

/**
 * initialize the iFrame Tab
 */
function initTabFrame() 
{
    var dlgDOM = document.getElementById('tab_frame');
    if (dlgDOM.childElementCount > 0)
    {
        var dlgParams = {
            onShow: true
        };
        M.Tabs.init(dlgDOM, dlgParams);
        IFrameTab = M.Tabs.getInstance(dlgDOM);
    }
}

/**
   * open a vault iframe modal
   */
var IFrameTab = null;
function createModalIFrameVault(title, url)
{
    if (IFrameModal != null)
    {
        // Insert Frame in frame list
        var tabFrame = document.getElementById('tab_frame');

        if (typeof title != 'undefined' && document.getElementById(title) == null)
        {
            var newLi = document.createElement('li');
            newLi.setAttribute('id', title);
            newLi.setAttribute('class', 'tab');
            tabFrame.appendChild(newLi);

            var newA = document.createElement('a');
            newA.setAttribute('href', '#modal-iframe-' + title);
            newA.innerHTML = title;
            newLi.appendChild(newA);

            // Create Frame
            var modalFrame = document.getElementById('modal_frame');

            var newDivFrame = document.createElement('div');
            newDivFrame.setAttribute('id', 'modal-iframe-' + title);
            newDivFrame.setAttribute('class', 'col s12');
            newDivFrame.setAttribute('style', 'padding: 0; height: 75vh;');
            modalFrame.insertBefore(newDivFrame, modalFrame.firstElementChild);

            var buttonDiv = document.createElement('div');
            buttonDiv.setAttribute('class', 'header');
            buttonDiv.setAttribute('style', 'height: 4vh;');
            newDivFrame.appendChild(buttonDiv);

            var buttonNewTabClose = document.createElement('button');
            buttonNewTabClose.setAttribute('class', 'modal-action waves-effect waves-red btn-flat');
            buttonNewTabClose.setAttribute('style', 'margin: 0;height: 100%');
            buttonNewTabClose.setAttribute('onClick', 'closeModalFrame("' + title + '");');
            buttonNewTabClose.innerHTML = '<i class="material-icons prefix">close</i>';
            buttonDiv.appendChild(buttonNewTabClose);

            var buttonNewModalHide = document.createElement('button');
            buttonNewModalHide.setAttribute('class', 'modal-action waves-effect waves-orange btn-flat');
            buttonNewModalHide.setAttribute('style', 'margin: 0;height: 100%;font-size: 1.5em;');
            buttonNewModalHide.setAttribute('onClick', 'IFrameModal.close();');
            buttonNewModalHide.innerHTML = '<i class="material-icons prefix">unfold_less</i>';
            buttonDiv.appendChild(buttonNewModalHide);

            var buttonNewTab = document.createElement('button');
            buttonNewTab.setAttribute('class', 'modal-action waves-effect waves-green btn-flat');
            buttonNewTab.setAttribute('style', 'margin: 0;height: 100%;font-size: 1.5em;');
            buttonNewTab.setAttribute('onClick', 'openNewTabFromIFrame("' + title + '")');
            buttonNewTab.innerHTML = '<i class="material-icons prefix">tab</i>';
            buttonDiv.appendChild(buttonNewTab);

            var iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', 'iframe-' + title);
            iFrame.setAttribute('style', 'border: none; width: 100%; height: 71vh;');
            iFrame.setAttribute('src', url);
            newDivFrame.appendChild(iFrame);

            initTabFrame();
        }
        IFrameTab.select('modal-iframe-' + title);
        IFrameModal.open();
    }
    else
    {
        M.toast({html: '<span>Error opening modal</span>'});
    }
}

function closeModalFrame(titleFrame) 
{
    var modalframe = document.getElementById('modal-iframe-' + titleFrame);
    modalframe.remove();
    var liFrame = document.getElementById(titleFrame);
    liFrame.remove();
    var dlgDOM = document.getElementById('tab_frame');
    if (dlgDOM.childElementCount > 1)
    {
        var dlgParams = {
            onShow: true
        };
        M.Tabs.init(dlgDOM, dlgParams);
        IFrameTab = M.Tabs.getInstance(dlgDOM);
    }
    else
    {
        IFrameTab = null;
    }
    IFrameModal.close();
}

function openNewTabFromIFrame(titleFrame) 
{
    var modalframe = document.querySelector('#iframe-' + titleFrame);
    var url = modalframe.src;
    window.open(url, '_blank');
}

function openModalIFrame()
{
    if (IFrameTab != null)
    {
        IFrameModal.open();
    }
    else
    {
        M.toast({html: '<span>No modal to display</span>'});
    }
}

initFrameModal();
document.getElementById('openModalFrame').addEventListener('click', openModalIFrame); //Bind modal handler