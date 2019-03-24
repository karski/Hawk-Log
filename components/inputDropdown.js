// Customizeable dropdown
// Allows single selection, multi-column display, and custom inputs.  For now, multi-selection is not an option
//  provides display of current selected value and a frame for a dropdown overlay behavior
//  RootLevel input: if this dropdown is at the page level, then all other dropdowns should close for it - leave false if nested in another modal
// When selection changes (from user input), "change" event will be triggered with the dropdown object (this) as target - queries can be made against the object to detemine state
function inputDropdown(listItems, initialValueSelected, includeSearch, allowCustom, rootLevel) {
    //set up variables for maintaining state
    this.oldValue = null;
    this.value = initialValueSelected;
    this.listItems = listItems;
    this.hasCustom = allowCustom || false;
    this.hasSearch = includeSearch || false;
    this.rootLevel = rootLevel || false;

    //bind global/callback listeners to current context so it can be deactivated later
    this.changeHandler = this.changeHandler.bind(this);
    this.globalKeyHandler = this.globalKeyHandler.bind(this);
    //this.globalClickHandler = this.globalClickHandler.bind(this);

    //store main elements
    this.dropdownContainer = document.createElement('div'); //wraps all elements for this control
    this.dropdownContainer.className = "editDropdown";
    this.dropdownContainer.value = this.value; //also store value here so it can be accessed by events
    this.dropdownContainer.addEventListener("click", () => { this.dropdownToggle(); });

    this.valueDisplay = document.createElement('span');
    this.valueDisplay.className = "dropdown-display";

    this.dropdownListContainer = document.createElement('div');
    this.dropdownListContainer.className = "dropdown-container card modal hidden";
    this.dropdownListContainer.addEventListener("click", () => { event.stopPropagation(); }); //prevent clicks inside dropdown from closing the dropdown
    //the actual list
    this.list = new selectionList(listItems, this.changeHandler, includeSearch, allowCustom, false);

    //put components together
    this.dropdownListContainer.appendChild(this.list.getHTMLNode());
    this.dropdownContainer.appendChild(this.valueDisplay);
    this.dropdownContainer.appendChild(this.dropdownListContainer);

    //set current value
    this.setValue(initialValueSelected);

}

inputDropdown.prototype.getHTMLNode = function() {
    return this.dropdownContainer;
};

inputDropdown.prototype.dropdownToggle = function() {
    event.stopPropagation(); //assuming this was triggered by user click
    if (this.dropdownListContainer.classList.contains('hidden')) {
        this.dropdownShow();
    } else {
        this.dropdownHide();
    }
};
inputDropdown.prototype.dropdownShow = function() {
    //display dropdown
    this.dropdownListContainer.classList.remove("hidden");
    //position inside window
    this.dropdownReposition();
    //scroll to selected as required
    this.list.scrollToSelection();
    if (this.hasSearch) { this.list.searchInput.focus(); }
    //assign global listeners to handle interactions that aren't caught by text inputs
    document.addEventListener('keydown', this.globalKeyHandler);
    //document.addEventListener('click', this.globalClickHandler);
    addModal(this, this.rootLevel); //<--should be true if page level occurance
};
inputDropdown.prototype.dropdownHide = function(fromModalManager) {
    fromModalManager = fromModalManager || false;
    //hide dropdown
    this.dropdownListContainer.classList.add("hidden");
    //remove custom if not selected
    this.list.clearInactiveCustom();
    //remove search inputs
    this.list.clearSearchSelection();
    //remove global-level listeners supporting the dropdown
    document.removeEventListener('keydown', this.globalKeyHandler);
    //document.removeEventListener('click', this.globalClickHandler); <--make sure modal holder is closed, too
    //remove ourselves from the global modal manager
    if (!fromModalManager) {
        removeSpecificModal(this);
    }
};

//updates current selection in list and display - does NOT trigger any events
// NOTE: passing "" will clear out selections and reset the list
inputDropdown.prototype.setValue = function(selectedValue) {
    selectedValue = selectedValue || ""; //avoid dealing will undefined params

    //display value
    if (selectedValue === "") { //blank selection - reset the dropdown
        //clear out list selection
        this.list.clearSelections();
        //fill value display with placeholder
        this.valueDisplay.innerText = "Select...";
        this.valueDisplay.classList.add("label");
    } else {
        //select the value in list
        this.list.setSelection(selectedValue, "value", false, true);
        //update value display
        this.valueDisplay.innerText = selectedValue;
        this.valueDisplay.classList.remove("label");
    }
    //update old value/current value
    this.oldValue = this.value;
    this.value = selectedValue;
    this.dropdownContainer.value = this.value;
};

//move dropdown to avoid overflowing window
inputDropdown.prototype.dropdownReposition = function() {
    //shift left/right
    if (this.dropdownListContainer.getBoundingClientRect().right > window.innerWidth) {
        this.dropdownListContainer.classList.add("shiftLeft");
    }
    if (this.dropdownListContainer.getBoundingClientRect().left < 0) {
        this.dropdownListContainer.classList.remove("shiftLeft");
    }

    //shift up/down
    if (this.dropdownListContainer.getBoundingClientRect().bottom > window.innerHeight - 25) {
        this.dropdownListContainer.classList.add("shiftUp");
    }
    if (this.dropdownListContainer.getBoundingClientRect().top < 50) {
        this.dropdownListContainer.classList.remove("shiftUp");
    }
};

///////////////////////////////////////////////////////////////////////////
//                  Event Handlers
///////////////////////////////////////////////////////////////////////////


//handles global keypresses to control selection and closing of list
// * Should only be active while list is displayed
// *  This bound to the dropdown instance at creation
// arrow up/down moves search selection
// enter selects current selection
// escape closes list
inputDropdown.prototype.globalKeyHandler = function() {
    //if (event.key === "Escape" || event.key === "Esc") {
    //    this.dropdownHide();
    //} else <--handled by modal manager
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
//handles gloabl click events to close list <--handled by modal manager
//inputDropdown.prototype.globalClickHandler = function () {
//    this.dropdownHide();
//};

//catches callback from user inputs to list element
// triggers "change" event so that listeners can be registered to this element
inputDropdown.prototype.changeHandler = function(selectionObj) {
    this.dropdownHide(); //close the dropdown
    // update current status - if value has changed
    if (selectionObj.value !== this.value) {
        this.oldValue = this.value;
        this.value = selectionObj.value;
        this.dropdownContainer.value = this.value;
        //display current value
        this.valueDisplay.innerText = this.value;
        this.valueDisplay.classList.remove("label");
        //trigger change event so that listeners can get info from me
        let changeEvent = new Event('change', {
            'bubbles': true,
            'cancelable': true
        });
        this.dropdownContainer.dispatchEvent(changeEvent);
    }
};

//receives modal manager close call
inputDropdown.prototype.close = function() {
    this.dropdownHide(true);
};