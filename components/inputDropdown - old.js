// Customizeable dropdown capability
//  provides display of current selected value and a frame for a dropdown overlay behavior

//specialized dropdown that allows multi-column displays
//mostly needed so that dropdown can appear immediately when a span target is clicked

// !!!!!TODO!!!!! it would be easier to keep selected item relevant if this display was created on the fly and then destroyed afterward like a modal
// ALTERNATIVE!!! we could make all the functions prototypes bound to the elementObj so that we can call them with the elementObj instead of always passing inputs

//TODO - register arrow key listener with page that is removed when not visible - wrapper can manipulate by using list.moveUp/moveDown functions

//either assign global listener to close out open dropdowns, or treat dropdowns as modals and let the page listen for it
//This global assignment seems a little simpler for now
document.addEventListener('click', () => {
    let activeDropdowns = document.querySelectorAll('.dropdown-container:not(.hidden)');
    for (let d of activeDropdowns) {
        dropdownHide(d);
    }
});

//create a dropdown display by providing an array for items
//if array entries are arrays (2d array), then each secondary array index defines column contents
//selected is the index of the current selection, -1 or undefined indicates no selection
//callback to handle a new selection - passed as object with index and value
//returns: node containing list with appropriate actions attached
function buildDropdown(listItems, selectCallback, selected, includeSearch, allowCustom) {
    let listContainer = document.createElement('div');
    listContainer.className = "card modal dropdown-container hidden";
    //elements for scrolling selection section
    let listScrollContainer = document.createElement('div');
    listScrollContainer.className = "dropdown-list-container";
    let listTable = document.createElement('table');

    //create search as required - use table as input so that filters can be more easily applied
    if (includeSearch) {
        let searchContainer = document.createElement('div');
        searchContainer.className = "panelShadow";

        let searchInput = document.createElement('input');
        searchInput.type = "text";
        searchInput.className = "dropdown-textinput";
        searchInput.name = "search";
        searchInput.placeholder = "Search...";
        searchInput.autofocus = true;
        searchInput.addEventListener('input', () => { searchInputHandler(listTable); });
        searchInput.addEventListener('keydown', () => { searchKeyHandler(listContainer, listTable, selectCallback); });
        searchInput.searchSelection = -1; //index of selected search result (from list of visible entries)

        searchContainer.appendChild(searchInput);
        listContainer.appendChild(searchContainer);
    }

    //build the list contents - use table so that we can handle extra columns as needed    
    for (let i = 0; i < listItems.length; i++) {
        let listRow = document.createElement('tr');
        listRow.className = "dropdown-entry";
        listRow.index = i;
        listRow.contents = listItems[i];
        listRow.addEventListener('click', () => { dropdownSelect(listContainer, selectCallback); });
        if (i === selected) { listRow.classList.add("selected"); } //indicate current selection
        //add row contents
        if (Array.isArray(listItems[i])) {
            if (listItems[i][0] === selected) { listRow.classList.add("selected"); } //select based on value of first column in case this is the index
            for (let itemCol of listItems[i]) {
                let entry = document.createElement('td');
                entry.innerText = itemCol;
                listRow.appendChild(entry);
            }
        } else {
            if (listItems[i] === selected) { listRow.classList.add("selected"); } //select based on value of row value in case this is the index
            let entry = document.createElement('td');
            entry.innerText = listItems[i];
            listRow.appendChild(entry);
        }
        listTable.appendChild(listRow);
    }
    listScrollContainer.appendChild(listTable);

    if (allowCustom) {
        let customEntry = document.createElement('input');
        customEntry.className = "dropdown-textinput";
        customEntry.type = "text";
        customEntry.name = "custom";
        customEntry.placeholder = "Other";
        customEntry.addEventListener('keydown', () => { customInputKeyHandler(listContainer, selectCallback); });
        listScrollContainer.appendChild(customEntry);
    }

    listContainer.appendChild(listScrollContainer);
    listContainer.addEventListener('click', () => { event.stopPropagation(); }); //prevent clicks from propogating and closing ourselves
    return listContainer;
}

function dropdownChangeSelection(listContainer, selectionIndex) {
    let entryList = listContainer.querySelectorAll('.dropdown-entry');
    for (let entry of entryList) {
        if (entry.index !== selectionIndex) {
            entry.classList.remove('selected');
        } else {
            entry.classList.add('selected');
        }
    }
}

//click handler
function dropdownSelect(listContainer, selectCallback) {
    let response = {
        index: event.target.parentElement.index,
        contents: JSON.stringify(event.target.parentElement.contents)
    };
    selectCallback(response);
    dropdownChangeSelection(listContainer, response.index);
    dropdownHide(listContainer);
}

//dropdown open and close controls
function dropdownToggle(dropdownElement) {
    event.stopPropagation();
    if (dropdownElement.classList.contains('hidden')) {
        dropdownShow(dropdownElement);
    } else {
        dropdownHide(dropdownElement);
    }
}
function dropdownShow(dropdownElement) {
    dropdownElement.classList.remove('hidden');
    dropdownElement.querySelector('.dropdown-container [name=search]').select();
    //enable page-wide key listening for selection inputs

    //dropdownParent.querySelector('.dropdown-container').classList.remove('hidden');
    //dropdownParent.querySelector('.dropdown-container [name=search]').select();
}
function dropdownHide(dropdownElement) {
    dropdownElement.classList.add('hidden');
    //clear out entries
    try {
        let searchInput = dropdownElement.querySelector('[name=search]');
        searchInput.value = "";
        searchInput.searchSelection = -1;
        let selected = dropdownElement.getElementsByClassName("search-selection");
        while (selected.length > 0) {
            selected[0].classList.remove('search-selection');
        }
    } catch (e) {
        console.log("no search bar to clear");
    }
    try {
        let customInput = dropdownElement.querySelector('[name=custom]');
        customInput.value = "";
    } catch (e) {
        console.log("no custom entry to clear");
    }
}

//search list and select first entry
//refilters list when search value changes
function searchInputHandler(listTable) {
    for (let entry of listTable.children) {
        entry.classList.remove('search-selection'); //remove search indication from all entries so we can add it back safely at the end
        if (entry.contents.toString().toUpperCase().includes(event.target.value.toUpperCase())) {
            entry.classList.remove('hidden');
        } else {
            entry.classList.add('hidden');
            if (entry.rowIndex === event.target.searchSelection) {
                event.target.searchSelection = -1;
            }
        }
    }

    try {
        if (event.target.searchSelection === -1) {
            event.target.searchSelection = listTable.querySelector('.dropdown-entry:not(.hidden)').rowIndex;
        }
    } catch (e) {
        console.log("out of search results");
    }
    if (event.target.searchSelection >= 0) {
        listTable.children[event.target.searchSelection].classList.add('search-selection');
    }

}
//watches for ENTER (select), ESC (clear search) and ARROW (change selection) inputs
function searchKeyHandler(listContainer, listTable, selectCallback) {
    if (event.key === "Escape" || event.key === "Esc") {
        if (event.target.value !== "") { //use escape to clear search input
            event.target.value = "";
            event.target.searchSelection = -1;
            //create an event to make search box treat this like user input
            let inputEvent = new Event('input', {
                'bubbles': true,
                'cancelable': true
            });
            event.target.dispatchEvent(inputEvent);
            //for (let entry of listTable.children) {
            //    entry.classList.remove('hidden');
            //}
        } else { //search already empty, use this opportunity to close all dropdowns
            let dropdowns = document.querySelectorAll('.dropdown-container');
            for (let d of dropdowns) {
                dropdownHide(d);
            }
        }
    } else if (event.key === "Enter" && event.target.searchSelection >= 0) {
        //send the search selection back
        let response = {
            index: event.target.searchSelection,
            contents: JSON.stringify(listTable.children[event.target.searchSelection].contents)
        };
        dropdownChangeSelection(listContainer, response.index);
        selectCallback(response);
        dropdownHide(listContainer);
    } else if (event.key === "ArrowDown") {
        try {
            if (event.target.searchSelection === -1) {//select first entry if there is no selection
                event.target.searchSelection = listTable.querySelector('.dropdown-entry:not(.hidden)').rowIndex;
            } else { //select the next visible row
                let searchList = listTable.querySelectorAll('.dropdown-entry:not(.hidden)');
                //loop through until we find selection and move one row
                for (let i = 0; i < searchList.length - 1; i++) {
                    if (searchList[i].index === event.target.searchSelection) {
                        searchList[i].classList.remove('search-selection'); //remove current search indication
                        //searchList[i + 1].classList.add('search-selection'); //highlight next visible entry
                        event.target.searchSelection = searchList[i + 1].index;//update searchSelection Index
                        break; //don't keep doing it
                    }
                }
            }
        } catch (e) {
            console.log("out of search results");
        }

        if (event.target.searchSelection >= 0) {
            listTable.children[event.target.searchSelection].classList.add('search-selection');
        }

    } else if (event.key === "ArrowUp") {
        try {
            if (event.target.searchSelection === -1) {//select first entry if there is no selection
                event.target.searchSelection = listTable.querySelector('.dropdown-entry:not(.hidden)').rowIndex;
            } else { //select the next visible row
                let searchList = listTable.querySelectorAll('.dropdown-entry:not(.hidden)');
                //loop through until we find selection and move one row
                for (let i = searchList.length - 1; i > 0; i--) {
                    if (searchList[i].index === event.target.searchSelection) {
                        searchList[i].classList.remove('search-selection'); //remove current search indication
                        //searchList[i + 1].classList.add('search-selection'); //highlight next visible entry
                        event.target.searchSelection = searchList[i - 1].index;//update searchSelection Index
                        break; //don't keep doing it
                    }
                }
            }
        } catch (e) {
            console.log("out of search results");
        }

        if (event.target.searchSelection >= 0) {
            listTable.children[event.target.searchSelection].classList.add('search-selection');
        }
    }
}


//listen for custom input accept
function customInputKeyHandler(listContainer, selectCallback) {
    if (event.key === "Enter" && event.target.value !== "") {
        let response = {
            index: -1,
            contents: JSON.stringify(event.target.value)
        };
        dropdownChangeSelection(listContainer, response.index);
        selectCallback(response);
        dropdownHide(listContainer);
    } else if (event.key === "Escape" || event.key === "Esc") {
        if (event.target.value !== "") { //use escape to clear custom input
            event.target.value = "";
            event.target.parentElement.parentElement.parentElement.querySelector('[name=search]').focus();
        } else { //input already empty, use this opportunity to close all dropdowns
            let dropdowns = document.querySelectorAll('.dropdown-container');
            for (let d of dropdowns) {
                dropdownHide(d);
            }
        }
    }
}