// handles an inline date/time input 
// - a little simpler than the modal, but will also make use of calendar and controlled input fields

//creates the input object to keep track of state
// inputs: initial value = date value to display in the field - passed as date object
//         displayMonth = date value for the month that should be displayed by the calendar when no selection has been made
function DateTimeInput(initialValue, displayMonth) {
    this.value = null; //begin blank
    this.defaultMonth = new Date(); //default to current month

    //set initial values based on input (if valid)
    if (typeof initialValue !== 'undefined' && initialValue !== null && !isNaN(initialValue.valueOf()) && initialValue.valueOf() > 0) {
        this.value = initialValue;
    }
    if (typeof displayMonth !== 'undefined' && displayMonth !== null && !isNaN(displayMonth.valueOf()) && displayMonth.valueOf() > 0) {
        this.defaultMonth = displayMonth;
    }


    //create container
    this.inputContainer = document.createElement("div");
    this.inputContainer.className = "dateTimeContainer";
    let dateContainer = document.createElement("span");
    dateContainer.className = "dateContainer";
    this.inputContainer.appendChild(dateContainer);

    //create inputs and add them to the containers
    this.dateInput = document.createElement("input");
    this.dateInput.className = "dateInput";
    this.dateInput.setAttribute("placeholder", "date");
    dateContainer.appendChild(this.dateInput);
    this.timeInput = document.createElement("input");
    this.timeInput.className = "timeInput";
    this.timeInput.setAttribute("placeholder", "time");
    this.timeInput.prevValue = ""; //for handling bad user inputs
    this.inputContainer.appendChild(this.timeInput);

    //create modal display for calendar
    this.calendarModal = document.createElement("div");
    this.calendarModal.className = "card timeCard modal hidden";
    dateContainer.appendChild(this.calendarModal);
    //create calendar display
    this.calendar = new Calendar((d) => {
        this.calendarSelectionHandler(d)
    }, this.value, this.defaultMonth);
    this.calendarModal.appendChild(this.calendar.getHTMLNode());
}

DateTimeInput.prototype.getHTMLNode = function () {
    return this.inputContainer;
};

// gets input from the calendar and applies the selected date to the text input field
DateTimeInput.prototype.calendarSelectionHandler = function (d) {

};

// control user time input to prevent bad characters entering the string and add colon formatting
DateTimeInput.prototype.timeInputHandler = function () {

}

function formatDayMonth(d) {
    if (d !== null && typeof d !== 'undefined' && d.valueOf() > 0) {
        return (d.getUTCDate() >= 10 ? d.getUTCDate() : "0" + d.getUTCDate()) + " " + shortMonth[d.getUTCMonth()];
    } else {
        return "";
    }
}