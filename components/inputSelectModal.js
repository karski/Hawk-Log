//provides a popup modal containing a list for one time inputs
//  Desgined to be a single-use input method, so values are not retained
// multiple selection mode provides an "accept" button to confirm inputs
//  -> listItems: array of items to display, can contain other arrays to build multiple columns
//  <- when selection is completed, callback will be called with object containing selection info in the format:
// obj{index;value;contents} - index and value are arrays for multi-select
//   *note: right now, custom input doesn't work with multi selections

function inputSelectModal(listItems, selectCallback, includeSearch, allowCustom, multiSelection, blockPage,  closeOtherModals, title) {
    //set up variables for maintaining state
    this.selectionCallback = selectCallback;
    this.hasBacksplash = blockPage || false;
    this.hasSearch = includeSearch || false;
    this.hasCustom = allowCustom || false;
    this.multi = multiSelection || false;
    this.currentSelectionObj = null; //placeholder to store data from list's callbacks 

    this.modal = document.createElement('div');
    this.modal.className = "card modal selectModal";
    this.modal.addEventListener("click", () => { event.stopPropagation(); });  //prevent clicks from closing modal

    if (this.hasBacksplash) {
        this.backsplash = document.createElement('div');
        this.backsplash.className = "modalBackdrop";
        this.backsplash.appendChild(this.modal);
    }

    let titleText = title || "";
    if (titleText !== "") {
        let titleElement = document.createElement('h2');
        titleElement.className = "modalHeader";
        titleElement.innerText = titleText;
        this.modal.appendChild(titleElement);
    }

    this.listSelectionHandler = this.listSelectionHandler.bind(this);
    this.list = new selectionList(listItems, this.listSelectionHandler, this.hasSearch, this.hasCustom, this.multi);
    this.modal.appendChild(this.list.getHTMLNode());

    if (this.multi) {
        let footer = document.createElement('div');
        footer.className = "modalHeader";
        let button = document.createElement('div');
        button.className = "small button";
        button.innerText = "Accept";
        button.addEventListener("click", () => { this.returnSelection(); });
        footer.appendChild(button);
        this.modal.appendChild(footer);
    }

    //assign global listeners
    this.globalKeyHandler = this.globalKeyHandler.bind(this);
    document.addEventListener('keydown', this.globalKeyHandler);
    //add to page and add to modal manager
    addModal(this, closeOtherModals || false);
    document.body.appendChild(this.getHTMLNode());

    if (this.hasSearch) {
        this.list.searchInput.focus();
    }
}

// passes current selection information via callback (only if selection exists)
inputSelectModal.prototype.getHTMLNode = function () {
    return this.hasBacksplash ? this.backsplash : this.modal;
};


inputSelectModal.prototype.returnSelection = function () {
    //check to make sure a selection has been made, then return it via callback
    if (this.currentSelectionObj !== null &&
        (this.currentSelectionObj.index !== -1 ||
        (Array.isArray(this.currentSelectionObj.index) && this.currentSelectionObj.index.length > 0))) {
        this.selectionCallback(this.currentSelectionObj);
        //close modal and remove from modal manager
        this.close();
        removeSpecificModal(this);
    }
};



///////////////////////////////////////////////////////////////////////////
//                  Event Handlers
///////////////////////////////////////////////////////////////////////////

// collects callbacks every time user makes a selection on the list
inputSelectModal.prototype.listSelectionHandler = function (selectionObj) {
    this.currentSelectionObj = selectionObj;
    if (!this.multi) { //for single selection mode, callback immediately
        this.returnSelection();
    }
};

//handles global keypresses to control selection in list
// arrow up/down moves search selection
// enter selects current selection
inputSelectModal.prototype.globalKeyHandler = function () {
    if (event.key === "Enter") {
        event.stopImmediatePropagation(); //prevent key from changing page position, which would be confusing
        event.preventDefault();
        this.list.selectSearchSelection();
    } else if (event.key === "ArrowDown") {
        event.stopImmediatePropagation(); //prevent key from changing page position, which would be confusing
        event.preventDefault();
        this.list.moveSearchSelectionDown();
    } else if (event.key === "ArrowUp") {
        event.stopImmediatePropagation(); //prevent key from changing input cursor position, which would be confusing
        event.preventDefault();
        this.list.moveSearchSelectionUp();
    }
};

//receives modal manager close call
inputSelectModal.prototype.close = function () {
    //destroy display
    this.getHTMLNode().outerHTML = '';
    //remove global listeners
    document.removeEventListener('keydown', this.globalKeyHandler);
};