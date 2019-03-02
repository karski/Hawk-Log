//test code here

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
let monthDropdown = new inputDropdown(month, "", "", "", month[displayMonth.getUTCMonth()], false, false, true);
let yearDropdown = new inputDropdown(generateYearList(displayMonth, 3), "", "", "", displayMonth.getUTCFullYear(), false, false, true);
let pageMonthLabel = document.getElementById("pageMonthLabel");
pageMonthLabel.innerHTML = '';
pageMonthLabel.appendChild(monthDropdown.getHTMLNode());
let pageYearLabel = document.getElementById("pageYearLabel");
pageYearLabel.innerHTML = '';
pageYearLabel.appendChild(yearDropdown.getHTMLNode());
//configure dropdown actions
monthDropdown.getHTMLNode().addEventListener('change', () => {
    displayMonth.setUTCMonth(month.indexOf(event.target.value));
    drawPageMonth();
});
yearDropdown.getHTMLNode().addEventListener('change', () => {
    displayMonth.setUTCFullYear(event.target.value);
    drawPageMonth();
});
//configure button actions
document.getElementById("pageLeftButton").addEventListener('click', () => {
    displayMonth.setUTCMonth(displayMonth.getUTCMonth() - 1);
    drawPageMonth();
});
document.getElementById("pageRightButton").addEventListener('click', () => {
    displayMonth.setUTCMonth(displayMonth.getUTCMonth() + 1);
    drawPageMonth();
});

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
// TODO: * NOTE: may want to consider treating rows as objects to more easily record and pass info...

//creates a sortie table row from the sortie data object passed
// -if no object is passed, an empty row for input will be created
// returns HTML node for table row
function SortieRow(sortie) {
    this.hasData = !(typeof sortie === 'undefined');
    this.entryRow = document.createElement("tr");
    this.entryRow.className = "sortieRow";
    this.ID = sortie.ID || ""; //needed for updates

    //link callback to current context
    this.timeChangeHandler = this.timeChangeHandler.bind(this);

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
    this.unitDropdown = new inputDropdown(lists.unitList, (this.hasData ? sortie.ID : ""), "SORTIE", "Squadron", (this.hasData ? sortie.Squadron : ""), false, true, true);
    unitCol.appendChild(document.createElement("p").appendChild(this.unitDropdown.getHTMLNode()));
    this.typeDropdown = new inputDropdown(lists.flightTypeList, (this.hasData ? sortie.ID : ""), "SORTIE", "COCOM", (this.hasData ? sortie.COCOM : ""), false, true, true);
    unitCol.appendChild(document.createElement("p").appendChild(this.typeDropdown.getHTMLNode()));
    this.entryRow.appendChild(unitCol);

    this.msnNumInput = document.createElement("input");
    this.msnNumInput.className = "msnInput";
    msnCol.appendChild(this.msnNumInput);
    this.entryRow.appendChild(msnCol);

    this.takeoffAfldDropdown = new inputDropdown(lists.airfieldList, (this.hasData ? sortie.ID : ""), "SORTIE", "TakeoffAirfield", (this.hasData ? sortie.TakeoffAirfield : ""), true, true, true);
    this.takeoffDateTimeInput = new DateTimeInput(null, displayMonth, this.timeChangeHandler);
    let tmpP = document.createElement("p");
    tmpP.appendChild(this.takeoffAfldDropdown.getHTMLNode());
    tmpP.appendChild(this.takeoffDateTimeInput.getHTMLNode());
    timeCol.appendChild(tmpP);

    this.landAfldDropdown = new inputDropdown(lists.airfieldList, (this.hasData ? sortie.ID : ""), "SORTIE", "LandAirfield", (this.hasData ? sortie.LandAirfield : ""), true, true, true);
    this.landDateTimeInput = new DateTimeInput(null, displayMonth, this.timeChangeHandler);
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
    noteCol.appendChild(this.noteInput);
    this.entryRow.appendChild(noteCol);

    if (this.hasData) {
        //fill in data passed to components (dropdowns should already have data from initialization parameters)
        this.msnNumInput.value = JSON.parse(sortie.MsnNum);
        this.takeoffDateTimeInput.setDateTime(new Date(JSON.parse(sortie.schedTakeoff)));
        this.landDateTimeInput.setDateTime(new Date(JSON.parse(sortie.schedLand)));
        this.timeChangeHandler(); //calculate and format the duration display
        this.noteInput.value = JSON.parse(sortie.QuickTake);

        //TODO: add listeners to handle updates to individual fields

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

SortieRow.prototype.getHTMLNode = function() {
    return this.entryRow;
};


//---------------Row Event Handlers-------------------------------//

//takeoff time changes --> set empty land time into future - add flags to existing land time if in past
//   set to next day, unless that is within 3 hours, then push out 2 days
// update duration
//land time changes --> update duration
//handle all time changes here
SortieRow.prototype.timeChangeHandler = function() {
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




//---------------Row Button Actions--------------------------------//
// Accept new entry
//  -check for blank/invalid inputs
//  -submit to server
//  -set up receiver to redraw page
SortieRow.prototype.acceptNewSortie = function() {
    //explicitly check each entry
    let dataMissing = false;
    let payload = { table: "SORTIES" };
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
            table: "SORTIES",
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
SortieRow.prototype.deleteSortie = function() {
    confirm("You are about to delete " + (this.msnNumInput.value === "" ? "this sortie" : this.msnNumInput.value) + "\nThis action cannot be undone"); //first confirm with user
    if (this.hasData) {
        //send delete request to server - server will need to cascade delete related records according to schema
        let payload = {
            table: "SORTIES",
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
};


//Cancel flight
// -toggle cancel status and send to server
SortieRow.prototype.cancelSortie = function() {
    //if sortie is already canceled, change status to planned

    //sortie is not cancelled yet, set status to cancelled

};

//details button
// provide interface for adding:
//  -timeline opAreas
//  -collection entries
//  -ground stations
//  -tail number
SortieRow.prototype.menuButtonHandler = function() {
    showToast('This functionality has not been built yet...', "#fff59d");
};