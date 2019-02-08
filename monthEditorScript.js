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
if(getParameterByName("month")!=null){
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
    addParamter("month",displayMonth.valueOf());
    //set up month/year labels
    monthDropdown.setValue(month[displayMonth.getUTCMonth()]);
    yearDropdown.list.buildList(generateYearList(displayMonth,3));
    yearDropdown.setValue(displayMonth.getUTCFullYear());
    //clear out table entries
    monthSortieTable.innerHTML = '';
    //fill in info from local data array
    for (let sortie of monthSortieData) {
        let row = createSortieRow(sortie);
        //find the right spot for it in the table

    }
    // create one empty new sortie row at the end
    monthSortieTable.appendChild(createNewEntryRow());
}

//---------------Row Building functions-----------------------------------------//
// * NOTE: may want to consider treating rows as objects to more easily record and pass info...

//creates a sortie table row from the sortie data object passed
// returns HTML node for table row
function createSortieRow(sortie){

}

//creates an empty table row for creating new sorties
// returns HTML node for table row
function createNewEntryRow(){
    let entryRow = document.createElement("tr");
    entryRow.className="sortieRow";
    //create components to add to table cells
    let unitDropdown = new inputDropdown(lists.unitList,"","SORTIE","squadron","",false,true,true);
    let typeDropdown = new inputDropdown(lists.flightTypeList,"","SORTIE","COCOM","",false,true,true);
    let takeoffAfldDropdown = new inputDropdown(lists.airfieldList,"","SORTIE","takeoffLoc","",true,true,true);
    let landAfldDropdown = new inputDropdown(lists.airfieldList,"","SORTIE","landLoc","",true,true,true);
    let msnNumInput = document.createElement("input");
    let noteInput = document.createElement("input");
    let takeoffDateInput = document.createElement("input");
    let takeoffTimeInput= document.createElement("input");
    let landDateInput= document.createElement("input");
    let landTimeINput= document.createElement("input");
    //new sortie buttons - accept or delete
    let acceptButton = document.createElement("div");
    acceptButton.className = "button accept tooltipHolder"
    let deleteButton = document.createElement("div");
    deleteButton.className = "button delete tooltipHolder"

    //create table cells to hold all the components built above
let unitCol = document.createElement("td");
unitCol.className = "smallCol";
let msnCol = document.createElement("td");
msnCol.className = "smallCol";
let timeCol = document.createElement("td");
timeCol.className = "timeCol";
let noteCol = document.createElement("td");
let actionCol = document.createElement("td");
actionCol.className = "actionCol";

    //arrange elements
    unitCol.appendChild(document.createElement("p").appendChild(unitDropdown.getHTMLNode()));
    unitCol.appendChild(document.createElement("p").appendChild(typeDropdown.getHTMLNode()));

    entryRow.appendChild(unitCol);


    return entryRow;
}