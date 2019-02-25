//test code here

function stopActions() {
    event.stopImmediatePropagation();
}

function buttonAction() {
    console.log("button pressed!");
}

//make sure that clicking on the tooltip doesn't accidentally click the button
let buttonList = document.getElementsByClassName("button delete");
let tooltipList = document.getElementsByClassName("tooltip");

for (let tooltip of tooltipList) {
    tooltip.addEventListener('click', stopActions);
}
for (let button of buttonList) {
    button.addEventListener('click', buttonAction);
}


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
    this.hasData = sortie || false;
    this.entryRow = document.createElement("tr");
    this.entryRow.className = "sortieRow";

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
    this.unitDropdown = new inputDropdown(lists.unitList, "*callback*", "SORTIE", "squadron", "", false, true, true);
    unitCol.appendChild(document.createElement("p").appendChild(this.unitDropdown.getHTMLNode()));
    this.typeDropdown = new inputDropdown(lists.flightTypeList, "", "SORTIE", "COCOM", "", false, true, true);
    unitCol.appendChild(document.createElement("p").appendChild(this.typeDropdown.getHTMLNode()));
    this.entryRow.appendChild(unitCol);

    this.msnNumInput = document.createElement("input");
    this.msnNumInput.className = "msnInput";
    msnCol.appendChild(this.msnNumInput);
    this.entryRow.appendChild(msnCol);

    this.takeoffAfldDropdown = new inputDropdown(lists.airfieldList, "*callback*", "SORTIE", "takeoffLoc", "", true, true, true);
    // let takeoffDateInput = document.createElement("input");
    // takeoffDateInput.className = "dateInput";
    // let takeoffTimeInput = document.createElement("input");
    // takeoffTimeInput.className = "timeInput";
    this.takeoffDateTimeInput = new DateTimeInput(null, displayMonth, );
    //TODO: add event listeners to move focus and set land time when takeoff is selected
    let tmpP = document.createElement("p");
    tmpP.appendChild(this.takeoffAfldDropdown.getHTMLNode());
    tmpP.appendChild(this.takeoffDateTimeInput.getHTMLNode());
    timeCol.appendChild(tmpP);

    this.landAfldDropdown = new inputDropdown(lists.airfieldList, "*callback*", "SORTIE", "landLoc", "", true, true, true);
    this.landDateTimeInput = new DateTimeInput(null, displayMonth);
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
        //fill in data passed to components


        //if sortie is canceled, format row to match status

        //existing sortie buttons - menu, delete, and cancel
        let menuButton = document.createElement("div");
        menuButton.className = "button tooltipHolder";
        menuButton.innerHTML = '⋯';
        let deleteButton = document.createElement("div");
        deleteButton.className = "button delete tooltipHolder"
        deleteButton.innerHTML = '🗙<div class="tooltip shiftDown shiftLeft"><b>Delete</b><br>Permanently remove this sortie<br>and all associated data</div>';
        let cnxButton = document.createElement("div");
        cnxButton.className = "button cnx tooltipHolder"
        cnxButton.innerHTML = 'CNX<div class="tooltip shiftDown shiftLeft"><b>Cancel</b><br>Mark this sortie canceled</div>';
        actionCol.appendChild(menuButton);
        actionCol.appendChild(deleteButton);
        actionCol.appendChild(cnxButton);
        this.entryRow.appendChild(actionCol);
    } else {
        //new sortie buttons - accept or delete
        let acceptButton = document.createElement("div");
        acceptButton.className = "button accept tooltipHolder"
        acceptButton.innerHTML = '✔<div class="tooltip shiftDown shiftLeft"><b>Accept</b><br>Create new sortie</div>';
        let deleteButton = document.createElement("div");
        deleteButton.className = "button delete tooltipHolder"
        deleteButton.innerHTML = '🗙<div class="tooltip shiftDown shiftLeft"><b>Delete</b><br>Permanently remove this sortie<br>and all associated data</div>';
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


//land time changes
// update duration



//---------------Row Button Actions--------------------------------//
// Accept new entry
//  -check for blank/invalid inputs
//  -submit to server
//  -set up receiver to redraw page


// Delete Row
// -confirm action with user
//  *New Entry Row
//    -delete input row object and replace with a brand new one
//  *Row with existing date
//    -send delete info to server
//    -set up receiver to redraw page

//Cancel flight
// -submit cancel status to server