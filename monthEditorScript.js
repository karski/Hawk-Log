window.onload = getPageMonth;

//test code here
window.onload = test;
function test() {
    monthSortieData = [{ "ID": "1", "Status": "INFLIGHT", "QuickTake": "", "Squadron": "12RS", "COCOM": "LOCAL", "TakeoffAirfield": "KBAB", "LandAirfield": "KEDW", "schedTakeoff": "2019-01-01T05:00Z", "schedLand": "2019-01-02T06:00Z", "MsnNum": "MSN123" }]
    drawPageMonth();
}

//TODO:
// - each time month changes, make request to server for the month's entries


//----------------------------begin page logic------------------------------------//
// Initiate the page month and year displays - default to this month
let monthSortieData = []; //array to hold all sortie info for display in table
let monthSortieTable = document.getElementById("monthTable");
let displayMonth = new Date(); //keeps track of what month we are on
//check URL for preselected date - should be passed as a number representing the month's valueOf value
if (getParameterByName("month") != null) {
    displayMonth = new Date(Number(getParameterByName("month")));
}
//collect and populate page displays
let monthDropdown = new inputDropdown(month, month[displayMonth.getUTCMonth()], false, false, true);
let yearDropdown = new inputDropdown(generateYearList(displayMonth, 3), displayMonth.getUTCFullYear(), false, false, true);
let pageMonthLabel = document.getElementById("pageMonthLabel");
pageMonthLabel.innerHTML = '';
pageMonthLabel.appendChild(monthDropdown.getHTMLNode());
let pageYearLabel = document.getElementById("pageYearLabel");
pageYearLabel.innerHTML = '';
pageYearLabel.appendChild(yearDropdown.getHTMLNode());
//configure dropdown actions
monthDropdown.getHTMLNode().addEventListener('change', () => {
    displayMonth.setUTCMonth(month.indexOf(event.target.value));
    getPageMonth();
    //drawPageMonth(); - done in response handler
});
yearDropdown.getHTMLNode().addEventListener('change', () => {
    displayMonth.setUTCFullYear(event.target.value);
    getPageMonth();
    //drawPageMonth();
});
//configure button actions
document.getElementById("pageLeftButton").addEventListener('click', () => {
    displayMonth.setUTCMonth(displayMonth.getUTCMonth() - 1);
    getPageMonth();
    //drawPageMonth();
});
document.getElementById("pageRightButton").addEventListener('click', () => {
    displayMonth.setUTCMonth(displayMonth.getUTCMonth() + 1);
    getPageMonth();
    //drawPageMonth();
});



//requests current month data from server
function getPageMonth() {
    //display month should always have a value, so we'll assume it is a valid date
    // build a start value and end value at the beginning and end of the month
    let start = new Date(Date.UTC(displayMonth.getUTCFullYear(), displayMonth.getUTCMonth(), 1));
    let end = new Date(Date.UTC(displayMonth.getUTCFullYear(), displayMonth.getUTCMonth() + 1, 1));

    let payload = {
        startDate: JSON.stringify(start),
        endDate: JSON.stringify(end),
        COCOM: '*',
        Squadron: '*'
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", getSortieCollectionURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
}



//received response data from the server and then calls draw month
function responseHandler() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        monthSortieData = JSON.parse(this.responseText).Sorties; //save the array of sorties into data variable
        drawPageMonth(); //redraw the page
        console.log(rJSON);
        showToast("Log Server Accepted Update!", "#81f363");

    } else if (this.readyState === XMLHttpRequest.DONE) {
        //toast error notice
        showToast("Error communicating with the server.  Your update was not saved.");
        if (this.statusText !== "") { showToast(this.status + " " + this.statusText); } else { showToast("⚠ Check Network Connection and Try Again ⚠", "#fff59d"); }
    }
}

// redraws the sorties for the month (erases everything first)
//   this is a more expensive approach, but probably fine since there are not going to be an excessive number of sorties per month
function drawPageMonth() {
    //update the url parameter
    addParamter("month", displayMonth.valueOf());
    //set up month/year labels
    monthDropdown.setValue(month[displayMonth.getUTCMonth()]);
    yearDropdown.list.buildList(generateYearList(displayMonth, 3));
    yearDropdown.setValue(displayMonth.getUTCFullYear());
    //clear out table entries
    monthSortieTable.innerHTML = '';
    //fill in info from local data array
    for (let sortie of monthSortieData) {
        let row = new SortieRow(sortie);
        //find the right spot for it in the table --> for now just assume it is in order already
        monthSortieTable.appendChild(row.getHTMLNode());
    }
    // create one empty new sortie row at the end
    monthSortieTable.appendChild(new SortieRow().getHTMLNode());
}

//---------------Row Object functionality-----------------------------------------//

/**
 * creates a sortie table row from the sortie data object passed
 * -if no object is passed, an empty row for input will be created
 * returns HTML node for table row
 * @param {*} sortie
 */
function SortieRow(sortie) {
    this.hasData = !(typeof sortie === 'undefined');
    this.entryRow = document.createElement("tr");
    this.entryRow.className = "sortieRow";
    this.ID = this.hasData ? sortie.ID : ""; //needed for updates

    //link callback to current context
    this.takeoffTimeChangeHandler = this.takeoffTimeChangeHandler.bind(this);
    this.landTimeChangeHandler = this.landTimeChangeHandler.bind(this);

    //create table cells to hold all the components built below
    let unitCol = document.createElement("td");
    unitCol.className = "smallCol";
    let msnCol = document.createElement("td");
    msnCol.className = "smallCol";
    let timeCol = document.createElement("td");
    timeCol.className = "timeCol";
    let durCol = document.createElement("td");
    durCol.className = "durCol";
    let noteCol = document.createElement("td");
    let actionCol = document.createElement("td");
    actionCol.className = "actionCol";

    //create components to add to table cells
    this.unitDropdown = new inputDropdown(lists.unitList, (this.hasData ? sortie.Squadron : ""), false, true, true);
    this.unitDropdown.getHTMLNode().setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.unitDropdown.getHTMLNode().setAttribute("data-table", "SORTIE");
    this.unitDropdown.getHTMLNode().setAttribute("data-field", "Squadron");
    unitCol.appendChild(document.createElement("p").appendChild(this.unitDropdown.getHTMLNode()));
    this.typeDropdown = new inputDropdown(lists.flightTypeList, (this.hasData ? sortie.COCOM : ""), false, true, true);
    this.typeDropdown.getHTMLNode().setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.typeDropdown.getHTMLNode().setAttribute("data-table", "SORTIE");
    this.typeDropdown.getHTMLNode().setAttribute("data-field", "Type");
    unitCol.appendChild(document.createElement("p").appendChild(this.typeDropdown.getHTMLNode()));
    this.entryRow.appendChild(unitCol);

    this.msnNumInput = document.createElement("input");
    this.msnNumInput.className = "msnInput";
    this.msnNumInput.setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.msnNumInput.setAttribute("data-table", "SORTIE");
    this.msnNumInput.setAttribute("data-field", "MsnNumber");
    this.msnNumInput.spellcheck = false;
    msnCol.appendChild(this.msnNumInput);
    this.entryRow.appendChild(msnCol);

    this.takeoffAfldDropdown = new inputDropdown(lists.airfieldList, (this.hasData ? sortie.TakeoffAirfield : ""), true, true, true);
    this.takeoffAfldDropdown.getHTMLNode().setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.takeoffAfldDropdown.getHTMLNode().setAttribute("data-table", "SORTIE");
    this.takeoffAfldDropdown.getHTMLNode().setAttribute("data-field", "TakeoffAirfield");
    this.takeoffAfldDropdown.getHTMLNode().classList.add("airfieldDropdown");
    this.takeoffDateTimeInput = new DateTimeInput(null, displayMonth, this.takeoffTimeChangeHandler);
    let tmpP = document.createElement("p");
    tmpP.appendChild(this.takeoffAfldDropdown.getHTMLNode());
    tmpP.appendChild(this.takeoffDateTimeInput.getHTMLNode());
    timeCol.appendChild(tmpP);

    this.landAfldDropdown = new inputDropdown(lists.airfieldList, (this.hasData ? sortie.LandAirfield : ""), true, true, true);
    this.landAfldDropdown.getHTMLNode().setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.landAfldDropdown.getHTMLNode().setAttribute("data-table", "SORTIE");
    this.landAfldDropdown.getHTMLNode().setAttribute("data-field", "LandAirfield");
    this.landAfldDropdown.getHTMLNode().classList.add("airfieldDropdown");
    this.landDateTimeInput = new DateTimeInput(null, displayMonth, this.landTimeChangeHandler);
    tmpP = document.createElement("p");
    tmpP.appendChild(this.landAfldDropdown.getHTMLNode());
    tmpP.appendChild(this.landDateTimeInput.getHTMLNode());
    timeCol.appendChild(tmpP);
    this.entryRow.appendChild(timeCol);

    this.durTime = document.createElement("p");
    this.durTime.textContent = "-";

    tmpP = document.createElement("p");
    tmpP.className = "label";
    tmpP.textContent = "hours"
    durCol.appendChild(this.durTime);
    durCol.appendChild(tmpP);
    this.entryRow.appendChild(durCol);

    this.noteInput = document.createElement("input");
    this.noteInput.className = "noteInput";
    this.noteInput.setAttribute("data-element-id", (this.hasData ? sortie.ID : ""));
    this.noteInput.setAttribute("data-table", "SORTIE");
    this.noteInput.setAttribute("data-field", "QuickTake");
    noteCol.appendChild(this.noteInput);
    this.entryRow.appendChild(noteCol);

    if (this.hasData) {
        //fill in data passed to components (dropdowns should already have data from initialization parameters)
        this.msnNumInput.value = sortie.MsnNum;
        this.takeoffDateTimeInput.setDateTime(new Date(sortie.schedTakeoff));
        this.landDateTimeInput.setDateTime(new Date(sortie.schedLand));
        this.timeChangeHandler(); //calculate and format the duration display
        this.noteInput.value = sortie.QuickTake || "";

        //add listeners to handle updates to individual fields (time inputs already have callbacks assigned from creation)
        this.unitDropdown.getHTMLNode().addEventListener("change", sendDropdownUpdate);
        this.typeDropdown.getHTMLNode().addEventListener("change", sendDropdownUpdate);
        this.takeoffAfldDropdown.getHTMLNode().addEventListener("change", sendDropdownUpdate);
        this.landAfldDropdown.getHTMLNode().addEventListener("change", sendDropdownUpdate);
        //text box input changes
        this.msnNumInput.addEventListener("focus",focusTextInput);
        this.msnNumInput.addEventListener("focusout",acceptTextInput);
        this.msnNumInput.addEventListener("keydown",keyCatcherTextInput);
        this.noteInput.addEventListener("focus",focusTextInput);
        this.noteInput.addEventListener("focusout",acceptTextInput);
        this.noteInput.addEventListener("keydown",keyCatcherTextInput);

        //if sortie is canceled, format row to match status
        if (sortie.Status.includes("CNX")) {
            this.entryRow.classList.add("canceled")
        } else {
            this.entryRow.classList.remove("canceled");
        }
        //existing sortie buttons - menu, delete, and cancel
        let menuButton = document.createElement("div");
        menuButton.className = "button";
        menuButton.innerHTML = '⋯';
        menuButton.addEventListener('click', () => { this.menuButtonHandler(); });
        let deleteButton = document.createElement("div");
        deleteButton.className = "button delete tooltipHolder"
        deleteButton.innerHTML = '🗙<div class="tooltip shiftDown shiftLeft" onclick="event.stopPropagation()"><b>Delete</b><br>Permanently remove this sortie<br>and all associated data</div>';
        deleteButton.addEventListener('click', () => { this.deleteSortie(); });
        let cnxButton = document.createElement("div");
        cnxButton.className = "button cnx tooltipHolder"
        cnxButton.innerHTML = 'CNX<div class="tooltip shiftDown shiftLeft" onclick="event.stopPropagation()"><b>Cancel</b><br>Mark this sortie canceled</div>';
        cnxButton.addEventListener('click', () => { this.cancelSortie(); });
        actionCol.appendChild(menuButton);
        actionCol.appendChild(deleteButton);
        actionCol.appendChild(cnxButton);
        this.entryRow.appendChild(actionCol);
    } else {
        //add event listener to fill in blank land airfield to match takeoff by default
        this.takeoffAfldDropdown.getHTMLNode().addEventListener('change', () => {
            if (this.landAfldDropdown.value === "") { this.landAfldDropdown.setValue(this.takeoffAfldDropdown.value); }
        });
        //new sortie buttons - accept or delete
        let acceptButton = document.createElement("div");
        acceptButton.className = "button accept tooltipHolder"
        acceptButton.innerHTML = '✔<div class="tooltip shiftDown shiftLeft" onclick="event.stopPropagation()"><b>Accept</b><br>Create new sortie</div>';
        acceptButton.addEventListener('click', () => { this.acceptNewSortie(); });
        let deleteButton = document.createElement("div");
        deleteButton.className = "button delete tooltipHolder"
        deleteButton.innerHTML = '🗙<div class="tooltip shiftDown shiftLeft" onclick="event.stopPropagation()"><b>Delete</b><br>Permanently remove this sortie<br>and all associated data</div>';
        deleteButton.addEventListener('click', () => { this.deleteSortie(); });
        actionCol.appendChild(acceptButton);
        actionCol.appendChild(deleteButton);
        this.entryRow.appendChild(actionCol);
    }
}

SortieRow.prototype.getHTMLNode = function () {
    return this.entryRow;
};


//---------------Row Event Handlers-------------------------------//
//accepts updates to takeoffTime
SortieRow.prototype.takeoffTimeChangeHandler = function (d) {
    this.timeChangeHandler(); //update display
    //for entries that have data (and a valid time was passed in), send the udpate to the server
    if (d !== null && !isNaN(d.valueOf()) && this.hasData) {
        console.log("sending takeoff date time update: " + d.toDateString());
        sendTimeUpdate(this.takeoffDateTimeInput.getHTMLNode(), d);
    }
};
//accepts updates to landTime
SortieRow.prototype.landTimeChangeHandler = function (d) {
    this.timeChangeHandler(); //update display
    //for entries that have data (and a valid time was passed in), send the udpate to the server
    if (d !== null && !isNaN(d.valueOf()) && this.hasData) {
        console.log("sending land date time update: " + d.toDateString());
        sendTimeUpdate(this.landDateTimeInput.getHTMLNode(), d);
    }
};

function sendTimeUpdate(element, d) {
    //for entries that have data (and a valid time was passed in), send the udpate to the server
    //if (d !== null && !isNaN(d.valueOf()) && this.hasData) { <-- already checked by the calling functions that are tied to the event element
    console.log("sending date time update: " + d.toDateString());

    let payload = {
        sortieID: element.getAttribute("data-element-id"),
        table: element.getAttribute("data-table"),
        elementID: element.getAttribute("data-element-id"),
        field: element.getAttribute("data-field"),
        value: JSON.stringify(d),
        respond: 'month'
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
    //}
}


//takeoff time changes --> set empty land time into future - add flags to existing land time if in past
//   set to next day, unless that is within 3 hours, then push out 2 days
// update duration
//land time changes --> update duration
//handle all time changes here
SortieRow.prototype.timeChangeHandler = function (d, element) {
    //update duration
    this.durTime.textContent = formatTimeDuration(
        (this.takeoffDateTimeInput.value === null ? null : this.takeoffDateTimeInput.value.valueOf()),
        (this.landDateTimeInput.value === null ? null : this.landDateTimeInput.value.valueOf()));
    if (Number(this.durTime.textContent) <= 0 || Number(this.durTime.textContent) > 30) {
        this.durTime.classList.add("deviation")
    } else {
        this.durTime.classList.remove("deviation")
    }
    //for new entries: when takeoff time is entered, use to fill in baseline land date
    if (this.takeoffDateTimeInput.value !== null && this.landDateTimeInput.value === null) {
        let landDate = new Date(this.takeoffDateTimeInput.value.valueOf());
        landDate.setUTCDate(landDate.getUTCDate() + (landDate.getUTCHours() > 20 ? 2 : 1)); //1 day ahead, unless takeoff time is near end of day
        landDate.setUTCHours(0, 0); //set time to 0
        this.landDateTimeInput.setDateTime(landDate);
    }

};

//sends changes from any dropdown to the server
// the dropdown HTML element contains all the data required to take action
function sendDropdownUpdate(event) {
    console.log("sending dropdown update: " + event.target.value);

    let payload = {
        sortieID: event.target.getAttribute("data-element-id"),
        table: event.target.getAttribute("data-table"),
        elementID: event.target.getAttribute("data-element-id"),
        field: event.target.getAttribute("data-field"),
        value: event.target.value,
        respond: 'month'
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
}


// Text entry functionality - gain focus, cancel input, keypress watcher, and accept input
function acceptTextInput(){ //send current value to server
    //update if value has changed
    if (event.target.value !== event.target.oldValue){
        let val = event.target.value;
        let payload = {
            sortieID: event.target.getAttribute("data-element-id"),
            table: event.target.getAttribute("data-table"),
            elementID: event.target.getAttribute("data-element-id"),
            field: event.target.getAttribute("data-field"),
            value: JSON.stringify(val),
            respond: 'month'
        };
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = responseHandler;
        xhttp.open("POST", updateURL, true);
        xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhttp.send(JSON.stringify(payload));
    }
}

function focusTextInput(){ //got focus - simply store existing value in case of cancel
    event.target.oldValue = event.target.value;
}

//watch for keys:
// Enter - accept
// Escape - cancel
function keyCatcherTextInput(){
    event.stopPropagation();
    if (event.key === "Escape" || event.key === "Esc") {
        console.log("Escape key pressed");
        cancelTextInput();
    }
    //text edit fields will accept input on enter key
    if (event.key === "Enter") {
        event.preventDefault();
        event.target.blur(); //this will auto-trigger accept
    }

}

function cancelTextInput(){ //revert to previous value
    event.stopPropagation();
    event.target.value = event.target.oldValue;
}




//---------------Row Button Actions--------------------------------//
// Accept new entry
//  -check for blank/invalid inputs
//  -submit to server
//  -set up receiver to redraw page
SortieRow.prototype.acceptNewSortie = function () {
    //clear out previous markers to prevent confusion
    let alerts = this.getHTMLNode().getElementsByClassName("inputAlert");
    while (alerts.length > 0) {
        alerts[0].classList.remove("inputAlert");
    }

    //explicitly check each entry
    let dataMissing = false;
    let payload = { table: "SORTIE" };
    if (this.unitDropdown.value === "" || this.unitDropdown.value === null) {
        dataMissing = true;
        this.unitDropdown.getHTMLNode().parentElement.classList.add("inputAlert");
    }
    if (this.typeDropdown.value === "" || this.typeDropdown.value === null) {
        dataMissing = true;
        this.typeDropdown.getHTMLNode().parentElement.classList.add("inputAlert");
    }
    if (this.msnNumInput.value === "" || this.msnNumInput.value === null || this.msnNumInput.value.length < 4) {
        dataMissing = true;
        this.msnNumInput.parentElement.classList.add("inputAlert");
    }
    if (this.takeoffAfldDropdown.value === "" || this.takeoffAfldDropdown.value === null) {
        dataMissing = true;
        this.takeoffAfldDropdown.getHTMLNode().parentElement.classList.add("inputAlert");
    }
    if (this.landAfldDropdown.value === "" || this.landAfldDropdown.value === null) {
        dataMissing = true;
        this.landAfldDropdown.getHTMLNode().parentElement.classList.add("inputAlert");
    }
    if (this.takeoffDateTimeInput.value === null) {
        dataMissing = true;
        this.takeoffDateTimeInput.getHTMLNode().parentElement.classList.add("inputAlert");
    }
    if (this.landDateTimeInput.value === null) {
        dataMissing = true;
        this.landDateTimeInput.getHTMLNode().parentElement.classList.add("inputAlert");
    }

    if (dataMissing) {
        showToast('All required fields must be filled in', "#fff59d")
    } else {
        //build payload - using JSON.stringify to remove any inline scripting or bad formatting
        let payload = {
            table: "SORTIE",
            Status: "PLANNED",
            Squadron: JSON.stringify(this.unitDropdown.value),
            COCOM: JSON.stringify(this.typeDropdown.value),
            MsnNum: JSON.stringify(this.msnNumInput.value),
            TakeoffAirfield: JSON.stringify(this.takeoffAfldDropdown.value),
            LandAirfield: JSON.stringify(this.landAfldDropdown.value),
            schedTakeoff: JSON.stringify(this.takeoffDateTimeInput.value),
            schedLand: JSON.stringify(this.landDateTimeInput.value),
            QuickTake: JSON.stringify(this.noteInput.value)
        }; //TODO: this payload should probably have some info about what it wants to get back from the server (a whole month of basic info instead of lots of detail on a single sortie)
        //submit to server
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = responseHandler;
        xhttp.open("POST", createURL, true);
        xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhttp.send(JSON.stringify(payload));
    }
};


// Delete Row
// -confirm action with user
//  *New Entry Row
//    -delete input row object and replace with a brand new one
//  *Row with existing date
//    -send delete info to server
//    -set up receiver to redraw page
SortieRow.prototype.deleteSortie = function () {
    if (confirm("You are about to delete " + (this.msnNumInput.value === "" ? "this sortie" : this.msnNumInput.value) + "\nThis action cannot be undone")) { //first confirm with user
        if (this.hasData) {
            //send delete request to server - server will need to cascade delete related records according to schema
            let payload = {
                table: "SORTIE",
                id: this.ID
            }
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = responseHandler;
            xhttp.open("POST", deleteURL, true);
            xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhttp.send(JSON.stringify(payload));

        } else {
            //this was a new entry that wasn't sent to the server yet, just delete the row and make a new one
            monthSortieTable.removeChild(this.getHTMLNode());
            monthSortieTable.appendChild(new SortieRow().getHTMLNode());
        }
    }
};


//Cancel flight
// -toggle cancel status and send to server
SortieRow.prototype.cancelSortie = function () {
    //if sortie is already canceled, change status to planned
    //sortie is not cancelled yet, set status to cancelled
    this.entryRow.classList.contains("canceled") ? this.entryRow.classList.remove("canceled") : this.entryRow.classList.add("canceled");

    //send new status to server
    let payload = {
        sortieID: this.ID,
        table: "SORTIE",
        elementID: this.ID,
        field: "Status",
        value: this.entryRow.classList.contains("canceled") ? "PLANNED" : "CNX",
        respond: 'month'
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
};

//details button
// provide interface for adding:
//  -timeline opAreas
//  -collection entries
//  -ground stations
//  -tail number
SortieRow.prototype.menuButtonHandler = function () {
    showToast('This functionality has not been built yet...', "#fff59d");
};