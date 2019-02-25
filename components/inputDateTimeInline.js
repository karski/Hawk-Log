// handles an inline date/time input 
// - a little simpler than the modal, but will also make use of calendar and controlled input fields

//creates the input object to keep track of state
// inputs: initial value = date value to display in the field - passed as date object
//         displayMonth = date value for the month that should be displayed by the calendar when no selection has been made
//          changeCallback = function that will be called when date or time value is changed - function will be passed DateTime object
function DateTimeInput(initialValue, displayMonth, changeCallback) {
    this.value = null; //begin blank
    this.oldValue = null;
    this.defaultMonth = new Date(); //default to current month
    this.callback = changeCallback;

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
    dateContainer.addEventListener('click', () => {
        event.stopPropagation(); //prevent clicks from closing our own modal
    });
    this.inputContainer.appendChild(dateContainer);

    //create inputs and add them to the containers
    this.dateInput = document.createElement("input");
    this.dateInput.className = "dateInput";
    this.dateInput.setAttribute("placeholder", "date");
    this.dateInput.addEventListener('keydown', () => {
        this.dateKeyHandler();
    });
    this.dateInput.addEventListener('blur', () => {
        this.updateDate(event.target.value, true);
    });
    dateContainer.appendChild(this.dateInput);

    this.timeInput = document.createElement("input");
    this.timeInput.className = "timeInput";
    this.timeInput.setAttribute("placeholder", "time");
    this.timeInput.prevValue = ""; //for handling bad user inputs
    this.timeInput.addEventListener('input', this.timeInputHandler);
    this.timeInput.addEventListener('keydown', () => {
        this.timeKeyHandler();
    });
    this.timeInput.addEventListener('blur', () => {
        this.updateTime(event.target.value, true);
    });
    this.inputContainer.appendChild(this.timeInput);

    //create modal display for calendar
    this.calendarModal = document.createElement("div");
    this.calendarModal.className = "card timeCard modal hidden";
    dateContainer.appendChild(this.calendarModal);
    //create calendar display
    this.calendar = new Calendar((d) => {
        this.calendarSelectionHandler(d);
    }, this.value, this.defaultMonth);
    this.calendarModal.appendChild(this.calendar.getHTMLNode());
    this.dateInput.addEventListener('focus', () => {
        this.calendarModal.classList.remove("hidden");
        addModal(this, true); //add ourselves to modal manager, since this is the only modal we're monitoring
    });

    //display the current value
    this.displayValue();
}

DateTimeInput.prototype.getHTMLNode = function() {
    return this.inputContainer;
};

//fills in displays with current value
DateTimeInput.prototype.displayValue = function() {
    this.dateInput.value = formatDayMonth(this.value);
    this.timeInput.value = formatTimeValue(this.value);
    this.timeInput.prevValue = this.timeInput.value;
    this.calendar.updateSelection(this.value);
};



//-----------------Value updaters----------------------------------//
// accepts time string for parsing
//  if unable to parse, defaults to 00:00
//  if good value, updates value (filling in date as required) and triggers change event
// doChangeEvent is boolean - indicates if change should be pushed as event or witheld
DateTimeInput.prototype.updateTime = function(t, doChangeEvent) {
    doChangeEvent = doChangeEvent || false; //default to *not* event for changes
    let tVal = parseTimeString(t);
    //fill in date, if no value selected
    if (this.value === null) { //There is no date selection made yet
        //if today is within the default month, use today as the date guess
        let today = new Date();
        if (today.getUTCMonth() === this.defaultMonth.getUTCMonth() && today.getUTCFullYear() === this.defaultMonth.getUTCFullYear()) {
            tVal.setUTCFullYear(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
        } else { //otherwise, use the first day of the default month
            tVal.setUTCFullYear(this.defaultMonth.getUTCFullYear(), this.defaultMonth.getUTCMonth(), 1);
        }
    } else { //date portion already exists, append onto time
        tVal.setUTCFullYear(this.value.getUTCFullYear(), this.value.getUTCMonth(), this.value.getUTCDate());
    }

    if (this.value === null || this.value.valueOf() !== tVal.valueOf()) {
        //we have date and time now, use to fill in value
        this.oldValue = this.value;
        this.value = tVal;
        this.displayValue();

        if (doChangeEvent) {
            this.callback(this.value);
        }
    }
};

// accepts date string for parsing
//  if unable to parse, reverts to old value
//  if good value, updates value (filling in time as required) and triggers change event
// doChangeEvent is boolean - indicates if change should be pushed as event or witheld
DateTimeInput.prototype.updateDate = function(d, doChangeEvent) {
    doChangeEvent = doChangeEvent || false; //default to *not* event for changes
    let dVal = parseDateString(d);

    //if date value is invalid, revert to old value
    if (!dVal.valueOf() > 0) {
        this.displayValue(); //simply show the current value
        return;
    }

    //merge date value and time value
    if (this.value !== null) {
        dVal.setUTCHours(this.value.getUTCHours() || 0, this.value.getUTCMinutes() || 0);
    }

    if (this.value === null || this.value.valueOf() !== dVal.valueOf()) {
        this.oldValue = this.value;
        this.value = dVal;
        this.displayValue();

        if (doChangeEvent) {
            this.callback(this.value);
        }
    }
};

// uses date time object to set current value and update display
//  (use for setting up the initial display or other external updates)
DateTimeInput.prototype.setDateTime = function(d) {
    if (typeof d !== "undefined" && d.valueOf() > 0) {
        this.oldValue = this.value;
        this.value = d;
        this.displayValue();
    }
};



///////////////////////////////////////////////////////////////////////////
//                  Event Handlers
///////////////////////////////////////////////////////////////////////////


//handles close calls for the date modal
DateTimeInput.prototype.close = function() {
    this.calendarModal.classList.add("hidden");
};

// gets input from the calendar and applies the selected date to the text input field
DateTimeInput.prototype.calendarSelectionHandler = function(d) {
    //save current value
    this.oldValue = this.value;
    //set value of date field here (if no time set, use 00:00)
    if (this.value !== null) {
        this.value = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), this.value.getUTCHours() || 0, this.value.getUTCMinutes() || 0));
    } else {
        this.value = d;
    }
    this.dateInput.value = formatDayMonth(d);
    //close modal and change focus to time field
    removeSpecificModal(this);
    this.close();
    this.timeInput.focus();
    //trigger change event
    this.callback(this.value);
};

// control user time input to prevent bad characters entering the string and add colon formatting
// save parsing to a date value until user hits enter or moves to another input
DateTimeInput.prototype.timeInputHandler = function() {
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

//handle special key presses for time field
// enter accepts input, esc rolls back to stored value, up and down adjust time in 30 min increments
DateTimeInput.prototype.timeKeyHandler = function() {
    if (event.key === "Enter") {
        //prevent enter key from making input
        event.stopPropagation();
        event.target.blur();
        //*allow blur to trigger time parsing
    } else if (event.key === "Escape" || event.key === "Esc") {
        //cancel input
        //this.value = this.oldValue;
        this.displayValue();
        event.target.blur();
    } else if (event.key === "ArrowUp") { //Use arrow keys to increment/decrement
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        //first, attempt to udpate the value
        this.updateTime(event.target.value, false);
        //now increment by +30 and redraw
        if (this.value !== null) {
            this.value.setUTCMinutes(this.value.getUTCMinutes() + 30);
            this.displayValue();
        }
    } else if (event.key === "ArrowDown") { //Use arrow keys to increment/decrement
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        //first, attempt to udpate the value
        this.updateTime(event.target.value, false);
        //now increment by +30 and redraw
        if (this.value !== null) {
            this.value.setUTCMinutes(this.value.getUTCMinutes() - 30);
            this.displayValue();
        }
    }
};

//handle special key presses for time field
// enter accepts input, esc rolls back to stored value, up and down adjust date in 1 day increments
DateTimeInput.prototype.dateKeyHandler = function() {
    if (event.key === "Enter") {
        //prevent enter key from making input
        event.stopPropagation();
        event.target.blur();
        //*allow blur to trigger time parsing
    } else if (event.key === "Escape" || event.key === "Esc") {
        //cancel input
        //this.value = this.oldValue;
        this.displayValue();
        event.target.blur();
    } else if (event.key === "ArrowUp") { //Use arrow keys to increment/decrement
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        //first, attempt to udpate the value
        this.updateDate(event.target.value, false);
        //now increment by +30 and redraw
        if (this.value !== null) {
            this.value.setUTCHours(this.value.getUTCHours() + 1);
            this.displayValue();
        }
    } else if (event.key === "ArrowDown") { //Use arrow keys to increment/decrement
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        //first, attempt to udpate the value
        this.updateDate(event.target.value, false);
        //now increment by +30 and redraw
        if (this.value !== null) {
            this.value.setUTCHours(this.value.getUTCHours() - 1);
            this.displayValue();
        }
    }
};

//-----------------------------------------formatting tools---------------------------------------------//

function formatTimeValue(t) {
    if (t !== null && t.valueOf() > 0 && typeof t !== 'undefined') {
        return (t.getUTCHours() < 10 ? "0" : "") + t.getUTCHours() + ":" + (t.getUTCMinutes() < 10 ? "0" : "") + t.getUTCMinutes();
    } else {
        return "";
    }
}

function formatDayMonth(d) {
    if (d !== null && typeof d !== 'undefined' && d.valueOf() > 0) {
        return (d.getUTCDate() >= 10 ? d.getUTCDate() : "0" + d.getUTCDate()) + " " + shortMonth[d.getUTCMonth()];
    } else {
        return "";
    }
}