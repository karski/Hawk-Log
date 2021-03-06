//creates a list with optional search and multi-select and returns for inclusion in dropdowns and modals
/* List object generator
 * Inputs:
 * listItems: array of items to display, can contain other arrays to build multiple columns
 * selectCallback: function that will be called when a selection is made.  Return obj{index;value;contents} - index and value are arrays for multi-select
 * includeSearch: search box provided
 * allowCustom: custom inputs accepted via text box at end of list (this doesn't really work right for mutli-selections)
 * multiSelection: true to use checkbox selection type
*/
function selectionList(listItems, selectCallback, includeSearch, allowCustom, multiSelection) {
    //store inputs that define operating modes:
    this.selectionCallback = selectCallback;
    this.hasSearch = includeSearch || false;
    this.hasCustom = allowCustom || false;
    this.multi = multiSelection || false;
    this.currentSelectionIndex = this.multi ? [] : -1; //index of current selection - will be an ascending sorted array if multi-mode
    this.searchSelectionIndex = -1; //index of selected search result starts as unselected - also used for scrolling selections

    //store main elements for list operation
    this.listContainer = document.createElement('div'); //overall container so we can insert the list as a single node into another element
    this.listContainer.className = "list-container";
    this.listScrollContainer = document.createElement('div'); //allows scrolling the list - keep a reference so we can scroll selections into view
    this.listScrollContainer.className = "list-scroll-container";
    this.listTable = document.createElement('table'); //list entries are displayed as a table to allow multiple columns
    //create search as required - use table as input so that filters can be more easily applied
    if (includeSearch) {
        let searchContainer = document.createElement('div');
        searchContainer.className = "panelShadow";
        searchContainer.style.textAlign = "center";

        this.searchInput = document.createElement('input');
        this.searchInput.type = "text";
        this.searchInput.className = "list-textinput";
        this.searchInput.name = "search";
        this.searchInput.placeholder = "Search...";
        this.searchInput.autofocus = true;
        this.searchInput.addEventListener('input', () => { this.searchInputHandler(); });
        this.searchInput.addEventListener('keydown', () => { this.searchInputKeyHandler(); });
        this.searchInput.addEventListener('change', () => { event.stopPropagation(); }); //prevent input changes from bypassing internal selection handling


        searchContainer.appendChild(this.searchInput);
        this.listContainer.appendChild(searchContainer);
    }
    //build list contents
    this.buildList(listItems);
    this.listScrollContainer.appendChild(this.listTable);
    this.listContainer.appendChild(this.listScrollContainer);
}

selectionList.prototype.getHTMLNode = function () {
    return this.listContainer;
};

// passes current selection information via callback
selectionList.prototype.returnSelection = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');

    //build object for return
    let result = {};
    if (this.multi) {
        result.index = [];
        result.value = [];
        result.contents = [];
        for (let index of this.currentSelectionIndex) {
            result.index.push(index);
            try {
                result.value.push(listEntries[index].value);
            } catch (e) {
                result.value.push("");
            }
            try {
                result.contents.push(listEntries[index].contents);
            } catch (e) {
                result.contents.push("");
            }
        }
    } else {
        result.index = this.currentSelectionIndex;
        try {
            result.value = listEntries[this.currentSelectionIndex].value;
        } catch (e) {
            result.value = "";
        }
        try {
            result.contents = listEntries[this.currentSelectionIndex].contents;
        } catch (e) {
            result.contents = "";
        }
    }

    //make callback
    this.selectionCallback(result);
};
// returns current selection index(es)
//   will return array if multi
selectionList.prototype.getSelectedIndex = function () {
    return this.currentSelectionIndex;
};
// returns current selection value(s)
//  array of values for multi-selections
//  only the first column is passed for multi-column options
selectionList.prototype.getSelectedValue = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');

    if (this.multi) {
        let result = [];
        for (let index of this.currentSelectionIndex) {
            try {
                result.value.push(listEntries[index].value);
            } catch (e) {
                result.value.push("");
            }
        }
        return result;
    } else {
        try {
            return listEntries[this.currentSelectionIndex].value;
        } catch (e) {
            return "";
        }
    }
};


//fills in table element with list items passed
selectionList.prototype.buildList = function (listItems) {
    this.listTable.innerHTML = "";
    for (let i = 0; i < listItems.length; i++) {
        let listRow = document.createElement('tr');
        listRow.className = "list-entry";
        listRow.contents = listItems[i];
        //listRow.index = i; //redundant to rowIndex and I don't think we end up using it
        listRow.addEventListener('click', () => { this.selectHandler(event, listRow); });
        //add multi-selection checkbox as required
        if (this.multi) {
            let selectCol = document.createElement('td');
            selectCol.width = "15px";
            let selectBox = document.createElement('input');
            selectBox.type = "checkbox";
            selectCol.appendChild(selectBox);
            listRow.appendChild(selectCol);
        }
        //add row contents
        if (Array.isArray(listItems[i])) { //multi-column entry
            listRow.value = listItems[i][0]; //store first column value as the lookup value
            for (let itemCol of listItems[i]) {
                let entry = document.createElement('td');
                entry.className = this.multi ? "list-entry-multicontent" : "list-entry-content";
                entry.innerText = itemCol;
                listRow.appendChild(entry);
            }
        } else { //single column
            listRow.value = listItems[i]; //store entry value for lookupu
            let entry = document.createElement('td');
            entry.className = this.multi ? "list-entry-multicontent" : "list-entry-content";
            entry.innerText = listItems[i];
            listRow.appendChild(entry);
        }
        //add row to table
        this.listTable.appendChild(listRow);
    }

    //add custom entry as needed
    if (this.hasCustom) {
        this.customRow = document.createElement('tr');
        this.customRow.className = "list-entry";
        this.customRow.value = ""; //start with blank - will need to set directly using custom methods
        this.customRow.contents = "";
        let customColumn = document.createElement('td');
        customColumn.colSpan = "99"; //this will expand to cover all columns
        this.customEntry = document.createElement('input');
        this.customEntry.className = "list-textinput";
        this.customEntry.type = "text";
        this.customEntry.name = "custom";
        this.customEntry.placeholder = "Other";
        this.customEntry.addEventListener('keydown', () => { this.customInputKeyHandler(); });
        this.customEntry.addEventListener('click', () => { event.stopPropagation(); }); //prevent clicking into text field from selecting row
        this.customEntry.addEventListener('change', () => { event.stopPropagation(); }); //prevent input changes from bypassing internal selection handling
        customColumn.appendChild(this.customEntry);
        this.customRow.appendChild(customColumn);
        this.listTable.appendChild(this.customRow);
    }
};

/* sets current selection display
 * *to clear selections, use clearSelections()
 * NOTE: This does NOT trigger selectionCallback - it only sets internal selection variables and updates display (in case it is being called by the parent)
 * selection: index or value (first instance) of new selection
 * selectionType: "index" or "value" - determines how selections will be passed to the list from outside (or in initial selection variable)
 * addToExisting: in multi mode, adds selection to existing selections
 * scrollTo: for new display, you will want to scroll to the selection
 * Return: True if list updated, false if result not found
*/
selectionList.prototype.setSelection = function (selection, selectionType, addToExisting, scrollTo) {
    let listEntries = this.listTable.getElementsByClassName('list-entry');

    //find the index of the value-based selection - store in selection variable to make value type consistent
    if (selectionType === "value") {
        let found = false;
        for (let i = 0; i < listEntries.length; i++) {
            if (listEntries[i].value === selection) { //use first column if multi-column entry - or this : (Array.isArray(listEntries[i].contents) ? listEntries[i].contents[0] : listEntries[i].contents)
                //save match as selection for use in next section
                selection = i;
                found = true;
                break; //only keep first instance
            }
        }
        if (!found) {
            if (this.hasCustom) { //use custom to store the value that wasn't found in the list
                this.setCustom(selection);
                selection = this.customRow.rowIndex;
            } else { //didn't find value in list, fail here
                return false;
            }
        }
    }

    // *From here on, selection is the index of the listEntry
    //update current selection index(es)
    if (selection >= 0 && selection < listEntries.length) { //make sure we have a valid selection
        if (this.multi) {
            if (addToExisting) { //add to existing list (toggle values that are already on the list)
                if (this.currentSelectionIndex.includes(selection)) { //already in list, splice it off
                    this.currentSelectionIndex.splice(this.currentSelectionIndex.indexOf(selection), 1);
                } else {  //add new indexes onto the list in ascending order
                    let added = false;
                    for (let i = 0; i < this.currentSelectionIndex.length; i++) {
                        if (this.currentSelectionIndex[i] > selection) {
                            this.currentSelectionIndex.splice(i, 0, selection);
                            added = true;
                            break;
                        }
                    }
                    if (!added) { this.currentSelectionIndex.push(selection); } //no larger indexes in list, add to end of list
                }
            } else { //construct an array with our single selection
                this.currentSelectionIndex = [selection];
            }
        } else { //simply store the single selection as the current one
            this.currentSelectionIndex = selection;
        }
    } else if (selection === -1) { //clear selection
        this.currentSelectionIndex = this.multi ? [] : -1;
        return false;
    }

    //clear out previuos selection display
    let selectedEntries = this.listTable.getElementsByClassName('selected');
    while (selectedEntries.length > 0) {
        if (this.multi) {
            try {
                selectedEntries[0].querySelector('input[type=checkbox]').checked = false; //uncheck selection checkbox
            } catch (err) { console.log("no checkbox here to clear"); }
        }
        selectedEntries[0].classList.remove('selected');
    }

    //display current selection
    if (this.multi) { //go through each multi-list option, selecting every index that is currently selected
        for (let i = 0; i < listEntries.length; i++) {
            if (this.currentSelectionIndex.includes(i)) {
                listEntries[i].classList.add('selected');
                //scroll selection into view as required
                if (scrollTo) {
                    try { listEntries[i].scrollIntoViewIfNeeded(); }
                    catch (err) { listEntries[i].scrollIntoView(); }
                    scrollTo = false; //only scroll to the first selection
                }
                if (this.multi) {
                    try { //check box if there is one
                        listEntries[i].querySelector('input[type=checkbox').checked = true;
                    } catch (err) { console.log("no checkbox here to check"); }
                }
            }
        }
    } else if (this.currentSelectionIndex >= 0 && this.currentSelectionIndex < listEntries.length) {
        listEntries[this.currentSelectionIndex].classList.add('selected');
        if (scrollTo) {
            try { listEntries[this.currentSelectionIndex].scrollIntoViewIfNeeded(); }
            catch (err) { listEntries[this.currentSelectionIndex].scrollIntoView(); }
        }
    }

    //clear out custom input if not selected
    this.clearInactiveCustom();

    return true;
};

//Clears out current selections and removes selection highlighting/checkboxes
selectionList.prototype.clearSelections = function () {
    //reset current selection tracking
    this.currentSelectionIndex = this.multi ? [] : -1;
    //remove selection highlights and checkboxes
    let selectedEntries = this.listTable.getElementsByClassName('selected');
    while (selectedEntries.length > 0) {
        if (this.multi) {
            try {
                selectedEntries[0].querySelector('input[type=checkbox]').checked = false; //uncheck selection checkbox
            } catch (err) { console.log("no checkbox here to clear"); }
        }
        selectedEntries[0].classList.remove('selected');
    }
};

//moves first selection into view
selectionList.prototype.scrollToSelection = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');

    if (this.multi && this.currentSelectionIndex.length > 0) {
        try { listEntries[this.currentSelectionIndex[0]].scrollIntoViewIfNeeded(); }
        catch (e) { listEntries[this.currentSelectionIndex[0]].scrollIntoView(); }
    } else if ((!this.multi) && this.currentSelectionIndex >= 0) {
        try { listEntries[this.currentSelectionIndex].scrollIntoViewIfNeeded(); }
        catch (e) { listEntries[this.currentSelectionIndex].scrollIntoView(); }
    }
};


//selects the current search selection (if valid)
selectionList.prototype.selectSearchSelection = function () {
    if (this.searchSelectionIndex >= 0) {
        //set selection - add selection on multi selects
        let listEntries = this.listTable.getElementsByClassName('list-entry');
        this.selectHandler(event, listEntries[this.searchSelectionIndex]);
    }
};
//move searchSelection (for use with arrow keys)
selectionList.prototype.moveSearchSelectionUp = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');
    //remove any existing search selection displays
    let selectedEntries = this.listTable.getElementsByClassName('search-selection');
    while (selectedEntries.length > 0) { selectedEntries[0].classList.remove('search-selection'); }

    //try to move up
    if (this.searchSelectionIndex === -1) {//select first entry if there is no selection
        this.searchSelectionIndex = this.listTable.querySelector('.list-entry:not(.hidden)').rowIndex; //NOTE: this should error out if no selection available
    } else { //select the next visible row - start just above current selection and move up looking for visible entry
        for (let i = this.searchSelectionIndex - 1; i >= 0; i--) {
            if (!listEntries[i].classList.contains("hidden")) { //this entry isn't hidden
                this.searchSelectionIndex = i;
                break; //jump out of loop so we only get one return
            }
        }
    }

    //mark whatever the current search selection ended up being
    listEntries[this.searchSelectionIndex].classList.add("search-selection");
    //scroll to current search selection
    try { listEntries[this.searchSelectionIndex].scrollIntoViewIfNeeded(); }
    catch (err) { listEntries[this.searchSelectionIndex].scrollIntoView(false); }
};
selectionList.prototype.moveSearchSelectionDown = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');
    //remove any existing search selection displays
    let selectedEntries = this.listTable.getElementsByClassName('search-selection');
    while (selectedEntries.length > 0) { selectedEntries[0].classList.remove('search-selection'); }

    //try to move down
    if (this.searchSelectionIndex === -1) {//select first entry if there is no selection
        this.searchSelectionIndex = this.listTable.querySelector('.list-entry:not(.hidden)').rowIndex; //NOTE: this should error out if no selection available
    } else { //select the next visible row - start just above current selection and move up looking for visible entry
        for (let i = this.searchSelectionIndex + 1; i < listEntries.length; i++) {
            if (!listEntries[i].classList.contains("hidden")) { //this entry isn't hidden
                this.searchSelectionIndex = i;
                break; //jump out of loop so we only get one return
            }
        }
    }

    //mark whatever the current search selection ended up being
    listEntries[this.searchSelectionIndex].classList.add("search-selection");
    //scroll to current search selection
    try { listEntries[this.searchSelectionIndex].scrollIntoViewIfNeeded(); }
    catch (err) { listEntries[this.searchSelectionIndex].scrollIntoView(); }
};
//clears search box and selection
selectionList.prototype.clearSearchSelection = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');
    if (this.hasSearch) { this.searchInput.value = ""; }
    this.searchSelectionIndex = -1;
    for (let entry of listEntries) {
        entry.classList.remove('hidden');
        entry.classList.remove('search-selection');
    }
};

//assigns value to custom input (for active selections when loaded for example)
selectionList.prototype.setCustom = function (customValue) {
    this.customEntry.value = customValue;
    this.customRow.value = customValue;
    this.customRow.contents = customValue;
};
//clears custom value (for incomplete inputs)
selectionList.prototype.resetCustom = function () {
    //clear custom input and replace with custom value if already there
    this.customEntry.value = this.customRow.value || "";
};
//clears custom value if not selected
selectionList.prototype.clearInactiveCustom = function () {
    if (this.hasCustom) {
        if (this.multi) {
            if (!this.currentSelectionIndex.includes(this.customRow.rowIndex)) { //custom input isn't one of the selections
                this.setCustom("");
            }
        } else {
            if (this.currentSelectionIndex !== this.customRow.rowIndex) { //custom input isn't selected, clear out value
                this.setCustom("");
            }
        }
    }
};


///////////////////////////////////////////////////////////////////////////
//                  Event Handlers
///////////////////////////////////////////////////////////////////////////

/* Listens for clicks on rows to make selection
 * Triggers callback functionality
 * Can be called from other inputs to make selection (ex: enter key could pass selected row into this handler)
 * Inputs: Gets selected row as input since it's not consistently available via event
*/
selectionList.prototype.selectHandler = function (event, selectedRow) {
    //set selection - add selection on multi selects
    this.setSelection(selectedRow.rowIndex, "index", this.multi ? true : false, false);

    //call selectionCallback
    this.returnSelection();
};


// Collects keystrokes from custom input
// Enter: store value and selects custom, Escape: clears (consumes event if not empty)
selectionList.prototype.customInputKeyHandler = function () {
    if (event.key === "Escape" || event.key === "Esc") {
        if (this.customEntry !== "") { event.stopPropagation(); } //use event to clear contents only -> otherwise, event will bubble up and can be used to close modal or other things
        this.resetCustom(); //reset the input - to nothing or to previous value
    } else if (event.key === "Enter" && this.customEntry.value !== "") {
        this.setCustom(this.customEntry.value); //store the value
        this.selectHandler(event, this.customRow);
        //this.setSelection(this.customRow.rowIndex, "index", this.multi ? true : false, false); //set the selection
        ////call selectionCallback
        //this.returnSelection();
    }
};

// Collects keystrokes from search input
// Enter selects, escape clears (consumes event if not empty), arrows intercepted from input and change selection
selectionList.prototype.searchInputKeyHandler = function () {
    if (event.key === "Escape" || event.key === "Esc") {
        if (this.searchInput.value !== "") { event.stopPropagation(); }
        this.clearSearchSelection();
    } else if (event.key === "Enter") {
        event.stopImmediatePropagation(); //prevent key from changing input cursor position, which would be confusing
        event.preventDefault();
        this.selectSearchSelection();
    } else if (event.key === "ArrowDown") {
        event.stopImmediatePropagation(); //prevent key from changing input cursor position, which would be confusing
        event.preventDefault();
        this.moveSearchSelectionDown();
    } else if (event.key === "ArrowUp") {
        event.stopImmediatePropagation(); //prevent key from changing input cursor position, which would be confusing
        event.preventDefault();
        this.moveSearchSelectionUp();
    }
};

// Collects input changes to search to filter display
selectionList.prototype.searchInputHandler = function () {
    let listEntries = this.listTable.getElementsByClassName('list-entry');

    if (event.target.value === "") { //search entry is empty, so display full list
        for (let entry of listEntries) {
            entry.classList.remove('hidden');
            entry.classList.remove('search-selection');
        }
    } else { //filter list based on current search
        for (let entry of listEntries) {
            entry.classList.remove('search-selection'); //remove search indication from all entries so we can add it back safely at the end

            if (entry.contents.toString().toUpperCase().includes(event.target.value.toUpperCase())) {
                entry.classList.remove('hidden');
            } else if (!(this.hasCustom && this.customRow === entry)) { //hide row, unless it is the custom input (because this could be anything!)
                entry.classList.add('hidden');
                if (entry.rowIndex === this.searchSelectionIndex) {
                    this.searchSelectionIndex = -1; //removed current search selection, reset marker to beginning
                }
            }
        }
    }

    //display current search selection
    try {
        if (this.searchSelectionIndex === -1) {
            this.searchSelectionIndex = this.listTable.querySelector('.list-entry:not(.hidden)').rowIndex;
        }
    } catch (e) {
        console.log("out of search results");
    }
    if (this.searchSelectionIndex >= 0) {
        listEntries[this.searchSelectionIndex].classList.add('search-selection');
    }
};