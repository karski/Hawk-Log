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
    this.timeInput.addEventListener('input', this.timeInputHandler);
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
// save parsing to a date value until user hits enter or moves to another input
function timeInputHandler() {
    //make sure input matches accepted pattern - if not, roll back to previous value
    let pattern = /^(\d){0,2}:?(\d){0,2}$/;
    if (!pattern.test(event.target.value)) {
        //reject bad input - roll back to last value
        event.target.value = event.target.prevValue;
        return;
    } else if (event.target.value.length === 0) {
        //allow blank input - return now since other formatting won't apply
        event.target.prevValue = "";
        return;
    } else if (event.inputType === "deleteContentBackward" ||
        ((event.target.prevValue.length === event.target.value.length + 1) && (!event.target.value.includes(":") && event.target.prevValue.includes(":")))) { //respect deleting semi-colons - skip this round and fix formatting after next input
        //save current state and return
        event.target.prevValue = event.target.value;
        return;
    }

    //input contains the right pattern, fix formatting
    //check for a semicolon - add if missing here
    if (!event.target.value.includes(":")) {
        //no semicolon, add one in to fix formatting to help with ranges
        if (event.target.value.length > 0 && Number(event.target.value[0]) > 2) {
            //too big for first number, add a leading zero and trailing colon
            event.target.value = "0" + event.target.value[0] + ":" + event.target.value.slice(1);
        } else if (event.target.value.length > 1) {
            //add colon at third position - fix number ranges in next step
            event.target.value = event.target.value.slice(0, 2) + ":" + event.target.value.slice(2);
        }
    } //if not already fixed, we won't have enough input for semicolon determination, continue

    if (event.target.value.includes(":")) { //now we have a colon, use it to make sure numbers are within range
        //split into hours and minutes and fix ranges
        let iArray = event.target.value.split(":");
        //fix hours
        if (iArray[0].length > 0 && Number(iArray[0]) > 23) { //fit within max range
            let h = iArray[0] % 24;
            iArray[0] = (h < 10 ? "0" : "") + h;
        } else if (iArray[0].length === 1 && Number(iArray[0]) > 2) { //add leading zero for single digit hours
            iArray[0] = "0" + iArray[0];
        }
        //fix minutes
        if (iArray[1].length > 0 && Number(iArray[1]) > 59) { //fit within max range
            let m = iArray[1] % 60;
            iArray[1] = (m < 10 ? "0" : "") + m;
        } else if (iArray[1].length === 1 && Number(iArray[1]) > 5) { //add leading zero for single digit minutes
            iArray[1] = "0" + iArray[1];
        }
        //put the string back together
        event.target.value = iArray.join(":");
    }

    //save current value for next iteration
    event.target.prevValue = event.target.value;
};



function formatDayMonth(d) {
    if (d !== null && typeof d !== 'undefined' && d.valueOf() > 0) {
        return (d.getUTCDate() >= 10 ? d.getUTCDate() : "0" + d.getUTCDate()) + " " + shortMonth[d.getUTCMonth()];
    } else {
        return "";
    }
}