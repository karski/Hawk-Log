// handles creation and input through date/time modals, which have mroe complexity than normal input methods

const shortMonth = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
];

//creates a new modal with reference to the launching display so that inputs can be pushed back
//if dateTime value is not passed or is unparsable, current date/time will be used
//scheduled time (if provided) will be used to display time offset (early/late) and determine need for rationale
//container element - optional, but if included, modal display will avoid overflowing *upward* out of it
function DateTimeModal(changeCallback, inputElement, containerElement) {
    this.callback = changeCallback;
    //initialize variables for the dateTime display
    this.inputElement = inputElement;
    this.containerElement = containerElement || null; //safely assign to known bad state
    this.dateTimeValue = new Date(Date.parse(inputElement.getAttribute("data-value")));
    let blankStart = false; //indicate whether value started out blank or invalid so that we can get input from user
    if (this.dateTimeValue.valueOf() === 0 || isNaN(this.dateTimeValue.valueOf())) {
        //bad time input - set up with current time (down to the minute)
        let now = new Date();
        this.dateTimeValue = new Date(""); //ensure value is NaN for future error checks
        this.newValue = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()));
        blankStart = true;
    } else { //valid time value - use it as changed value starting point
        this.newValue = new Date(this.dateTimeValue);
    }


    //create time, date, and calendar input fields
    this.timeHourInput = document.createElement("input");
    this.timeHourInput.className = "editTime";
    this.timeHourInput.setAttribute("type", "number");
    this.timeHourInput.setAttribute("name", "hours");
    this.timeHourInput.setAttribute("placeholder", "H");
    this.timeHourInput.value = isNaN(this.dateTimeValue.getUTCHours()) ? "" : ((this.dateTimeValue.getUTCHours() < 10 ? "0" : "") + this.dateTimeValue.getUTCHours());
    this.timeHourInput.oldValue = this.timeHourInput.value;
    this.timeHourInput.prevValue = this.timeHourInput.value;
    this.timeMinuteInput = document.createElement("input");
    this.timeMinuteInput.className = "editTime";
    this.timeMinuteInput.setAttribute("type", "number");
    this.timeMinuteInput.setAttribute("name", "minutes");
    this.timeMinuteInput.setAttribute("placeholder", "M");
    this.timeMinuteInput.value = isNaN(this.dateTimeValue.getUTCMinutes()) ? "" : ((this.dateTimeValue.getUTCMinutes() < 10 ? "0" : "") + this.dateTimeValue.getUTCMinutes());
    this.timeMinuteInput.oldValue = this.timeMinuteInput.value;
    this.timeMinuteInput.prevValue = this.timeMinuteInput.value;
    this.dateInput = document.createElement("input");
    this.dateInput.className = "editDate";
    this.dateInput.setAttribute("inputType", "text");
    this.dateInput.setAttribute("name", "date");
    this.dateInput.setAttribute("placeholder", "DATE");
    this.dateInput.value = formatShortDate(this.dateTimeValue);
    this.timeMinuteInput.oldValue = this.timeMinuteInput.value;
    //let calendarContainer = document.createElement("div");
    //calendarContainer.className = "calendar-container";
    //initialize calendar
    this.cal = new Calendar((d) => {
        this.calendarSelectionHandler(d);
    }, this.dateTimeValue);



    //build modal framework
    this.modal = document.createElement("div");
    this.modal.className = "card timeCard modal";
    this.modal.addEventListener('click', () => {
        event.stopPropagation(); //prevents clicks on modal from bubbling up to document level (which would trigger modal close)
        //make sure all dropdowns are closed if a click happens outside of them
        this.cal.monthSelection.dropdownHide();
        this.cal.yearSelection.dropdownHide();
    });
    //let closeButton = document.createElement("div");
    //closeButton.className = "button small";
    //closeButton.innerText = "⨯";
    //closeButton.addEventListener('click', modalEscapeHandler);
    let label = document.createElement("h2");
    label.innerText = this.inputElement.getAttribute("data-name");
    label.className = "modalHeader";
    let timeParagraph = document.createElement("p");
    let timeLabel = document.createElement("span");
    timeLabel.style.font = "2.5em Arial";
    timeLabel.innerText = ":";
    timeParagraph.appendChild(this.timeHourInput);
    timeParagraph.appendChild(timeLabel);
    timeParagraph.appendChild(this.timeMinuteInput);
    let dateParagraph = document.createElement("p");
    dateParagraph.appendChild(this.dateInput);
    //this.differenceReason = differenceReason || '';
    //if (this.scheduledTime.valueOf() > 0) {
    //    let differenceParagraph = document.createElement("p");
    //    this.timeDifference = document.createElement("span");
    //    this.timeDifference.className = "timeDiff";
    //    this.timeDifference.innerText = formatTimeDifference(this.dateTimeValue, this.scheduledTime);

    //    this.differenceReasonInput = document.createElement("span");
    //    this.differenceReasonInput.className = "editDropdown";
    //    this.differenceReasonInput.innerText = this.differenceReason;
    //    if (isDev(this.dateTimeValue, this.scheduledTime)) {
    //        this.timeDifference.classList.add("red");
    //        if (differenceReason === '') {
    //            this.differenceReason.classList.add("inputAlert");
    //            this.inputElement.classList.add("inputAlert");
    //        }
    //    }
    //    differenceParagraph.appendChild(this.timeDifference);
    //    differenceParagraph.appendChild(this.differenceReason);
    //}
    let clearButton = document.createElement("div");
    clearButton.className = "button small left";
    clearButton.innerText = "🗙 clear";
    clearButton.addEventListener('click', () => {
        this.clearEntry();
    });
    let buttonToday = document.createElement("div");
    buttonToday.className = "button small";
    buttonToday.innerText = "📆";
    buttonToday.title = "Jump to Today";
    buttonToday.addEventListener('click', () => {
        event.stopPropagation();
        this.cal.displayToday();
    });
    let buttonSelected = document.createElement("div");
    buttonSelected.className = "button small";
    buttonSelected.innerText = "📅";
    buttonSelected.title = "Jump to Selected Date";
    buttonSelected.addEventListener('click', () => {
        event.stopPropagation();
        this.cal.displaySelected();
    });

    //construct the modal
    this.modal.appendChild(label);
    this.modal.appendChild(timeParagraph);
    this.modal.appendChild(dateParagraph);
    this.modal.appendChild(this.cal.getHTMLNode());
    this.modal.appendChild(clearButton);
    this.modal.appendChild(buttonSelected);
    this.modal.appendChild(buttonToday);

    //add key and focus listeners
    //this.inputTimeHandler = this.inputTimeHandler.bind(this);
    this.inputKeyHandler = this.inputKeyHandler.bind(this);
    this.focusHandler = this.focusHandler.bind(this);

    this.timeHourInput.addEventListener('keydown', this.inputKeyHandler);
    this.timeHourInput.addEventListener('focusout', this.focusHandler);
    this.timeHourInput.addEventListener('input', (event) => {
        this.inputTimeHandler(event, 24, 2);
    });
    this.timeHourInput.addEventListener('focus', () => {
        this.timeHourInput.select();
    });
    this.timeMinuteInput.addEventListener('keydown', this.inputKeyHandler);
    this.timeMinuteInput.addEventListener('focusout', this.focusHandler);
    this.timeMinuteInput.addEventListener('input', (event) => {
        this.inputTimeHandler(event, 60, 5);
    });
    this.timeMinuteInput.addEventListener('focus', () => {
        this.timeMinuteInput.select();
    });
    this.dateInput.addEventListener('focus', () => {
        this.dateInput.select();
    });
    this.dateInput.addEventListener('keydown', this.inputKeyHandler);
    this.dateInput.addEventListener('focusout', this.focusHandler);

    //resize listener to shift sides as needed
    this.shiftHandler = () => this.reposition(); //bind the listener to a named value so we can remove it when closing
    window.addEventListener('resize', this.shiftHandler);

    //add the whole modal to the parent object
    //correct position so that it fits onto page
    inputElement.appendChild(this.modal);
    this.reposition();

    //started without input, set up display to collect user input with current time as default
    if (blankStart) {
        //    this.timeInput.innerText = formatTime(this.newValue, true);
        //    this.dateInput.innerText = formatShortDate(this.newValue);
        //    this.timeInputFocusBox();
        this.timeHourInput.select();
    }

    //**!**Note: parent creating this modal should add to modal manager - this allows positioning to determine if other modals should be closed or not
}

//displays Date/Time selection defined by newValue
//this will show all changes made
DateTimeModal.prototype.displayNewValue = function() {
    this.timeHourInput.value = isNaN(this.newValue.getUTCHours()) ? "" : (this.newValue.getUTCHours() < 10 ? "0" : "") + this.newValue.getUTCHours();
    this.timeMinuteInput.value = isNaN(this.newValue.getUTCMinutes()) ? "" : (this.newValue.getUTCMinutes() < 10 ? "0" : "") + this.newValue.getUTCMinutes();
    this.dateInput.value = formatShortDate(this.newValue);
    this.inputElement.querySelector('span.timeDisplay').innerText = formatTime(this.newValue);
    this.cal.updateSelection(this.newValue);
};

//consolidated event handlers
//handles loss of focus by processing input, and submitting or allowing focus to pass to other input field
DateTimeModal.prototype.focusHandler = function() {

    //process input and display result
    let isGood = false;
    if (event.target === this.timeHourInput || event.target === this.timeMinuteInput) {
        isGood = this.parseTimeInput(event);
    } else if (event.target === this.dateInput) {
        isGood = this.parseDateInput(event.target.value);
    }
    //if good input and focus is not on input field, accept updated value
    if (event.relatedTarget !== this.dateInput && event.relatedTarget !== this.timeHourInput && event.relatedTarget !== this.timeMinuteInput) {
        if (isGood) {
            this.inputAccept();
        }
        //for now, we will just ignore submissions that are not good
        //else {
        //    this.inputCancel();
        //}
    }
};

//key handlers - watches for escape to cancel or enter to accept
//based on solution provided by emkey08 on https://stackoverflow.com/questions/469357/html-text-input-allows-only-numeric-input
DateTimeModal.prototype.inputKeyHandler = function() {
    if (event.key === "Enter") {
        //prevent enter key from making input
        event.stopPropagation();
        event.target.blur();

        //process input and display result
        let isGood = false;
        if (event.target === this.timeHourInput || event.target === this.timeMinuteInput) {
            isGood = this.parseTimeInput(event);
        } else if (event.target === this.dateInput) {
            isGood = this.parseDateInput(event.target.value);
        }
        //if good input, accept updated value - if not, then we will ignore the submission
        if (isGood) {
            this.inputAccept();
        }
    } else if (event.key === "Escape" || event.key === "Esc") {
        //cancel input
        event.target.blur();
        this.inputCancel();
    } else if (event.key === "ArrowUp") { //Use arrow keys to increment/decrement current field!
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        if (event.target === this.dateInput && this.parseDateInput(event.target.value)) { //valid date input, try incrementing
            this.newValue.setUTCDate(this.newValue.getUTCDate() + 1);
            this.displayNewValue();
        } else if (event.target === this.timeHourInput && this.parseTimeInput(event)) { //increment hours
            this.newValue.setUTCHours(this.newValue.getUTCHours() + 1);
            this.displayNewValue();
        } else if (event.target === this.timeMinuteInput && this.parseTimeInput(event)) { //increment minutes
            this.newValue.setUTCMinutes(this.newValue.getUTCMinutes() + 1);
            this.displayNewValue();
        }
    } else if (event.key === "ArrowDown") {
        event.stopImmediatePropagation(); //prevent arrow key from triggering input field actions, which could contradict what we want to do
        event.preventDefault();
        if (event.target === this.dateInput && this.parseDateInput(event.target.value)) { //valid date input, try decrementing
            this.newValue.setUTCDate(this.newValue.getUTCDate() - 1);
            this.displayNewValue();
        } else if (event.target === this.timeHourInput && this.parseTimeInput(event)) { //decrement hours
            this.newValue.setUTCHours(this.newValue.getUTCHours() - 1);
            this.displayNewValue();
        } else if (event.target === this.timeMinuteInput && this.parseTimeInput(event)) { //decrement minutes
            this.newValue.setUTCMinutes(this.newValue.getUTCMinutes() - 1);
            this.displayNewValue();
        }
    }
};

//time field input handlers - filter out bad input and auto-advance focus
DateTimeModal.prototype.inputTimeHandler = function(event, maxValue, firstDigitLimit) {
    let timePattern = /^-?\d{0,2}$/;
    if (timePattern.test(event.target.value)) {
        //input contains numbers, so force them into range
        if (Number(event.target.value) >= maxValue) {
            event.target.value = Number(event.target.value) % maxValue;
        }
        if (Number(event.target.value) < 0) {
            event.target.value = maxValue + Number(event.target.value);
        }
        if (Number(event.target.value) === 0 && event.target.value !== "") {
            event.target.value = "0";
        } //fix -0 awkwardness
        //save good value
        event.target.prevValue = event.target.value;
        //check for finished input conditions
        if (event.target.value.length === 2 || (event.target.value.length === 1 && event.target.value > firstDigitLimit)) {
            if (event.target.name === "hours") {
                this.timeMinuteInput.select();
            } else if (event.target.name === "minutes") {
                this.dateInput.select();
            }
        }
    } else if (typeof event.target.prevValue !== "undefined") {
        event.target.value = event.target.prevValue;
    } else if (typeof event.target.oldValue !== "undefined") {
        event.target.value = event.target.oldValue;
    }
};


//handles selection of time input - used for giving focus first
//Since divs can't accept focus, we'll swap out a text entry.  Updating the value will replace the text input element and return operation to normal contentEditable behavior
//DateTimeModal.prototype.timeInputFocusBox = function () {
//    let tbox = document.createElement("input");
//    tbox.type = "text"; //time isn't supported on IE and isn't consistent format across browsers, so we'll keep control here
//    tbox.className = "editTime-focusInput";
//    tbox.setAttribute("value", this.timeInput.innerText);
//    //make size and formatting match parent
//    tbox.style.font = window.getComputedStyle(this.timeInput).font;

//    //attach key and focus listeners
//    tbox.addEventListener('keydown', () => { this.inputKeyHandler(); });
//    tbox.addEventListener('focusout', () => { this.focusHandler(); });

//    this.timeInput.innerHTML = '';
//    this.timeInput.appendChild(tbox);
//    tbox.select();
//};


//updates date value based on calendar input
//input: date object representing selected day
DateTimeModal.prototype.calendarSelectionHandler = function(d) {
    //set newValue to the selection - if current newValue doesn't have time assigned, it will receive 0's
    this.newValue = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), this.newValue.getUTCHours() || 0, this.newValue.getUTCMinutes() || 0));

    //pass new value to update method
    this.inputAccept();
};

//clears the current value since removing data from 2 fields is kind of hard
DateTimeModal.prototype.clearEntry = function() {
    //if field was already blank, then there's nothing to change
    if (isNaN(this.dateTimeValue.valueOf())) {
        this.newValue = new Date(""); //reset newValue as well
        this.displayNewValue();
        return;
    }

    //pass update to server
    this.newValue = new Date(""); //null value
    this.inputAccept();
};

//accepts user input and passes update to server
//this is very similar to other update functions and could probably be refactored - only field value source changes really
DateTimeModal.prototype.inputAccept = function() {
    console.log("Date/Time Input accepted " + this.dateTimeValue + " --> " + this.newValue);

    //if new value is the same as current, nothing to change
    if (this.newValue !== null && this.dateTimeValue !== null) {
        if (this.newValue.valueOf() === this.dateTimeValue.valueOf() ||
            (isNaN(this.newValue.valueOf()) && isNaN(this.dateTimeValue.valueOf()))) {
            inputCancel();
            return;
        }
    }

    //update display and store previous value
    this.displayNewValue();
    this.dateInput.oldValue = formatShortDate(this.dateTimeValue);
    this.dateInput.classList.add("changed");
    this.timeHourInput.oldValue = isNaN(this.dateTimeValue.getUTCHours()) ? "" : ((this.dateTimeValue.getUTCHours() < 10 ? "0" : "") + this.dateTimeValue.getUTCHours());
    this.timeHourInput.classList.add("changed");
    this.timeMinuteInput.oldValue = isNaN(this.dateTimeValue.getUTCMinutes()) ? "" : ((this.dateTimeValue.getUTCMinutes() < 10 ? "0" : "") + this.dateTimeValue.getUTCMinutes());
    this.timeMinuteInput.classList.add("changed");
    this.inputElement.querySelector('span.timeDisplay').oldText = formatTime(this.dateTimeValue);
    this.inputElement.querySelector('span.timeDisplay').classList.add("changed");

    // use callback to let parent make the server calls (or other)
    // *Note, may need to pass a reference to this object so that source info can be determined?
    this.callback(this.newValue);

    //Should be able to move everything below up to the parent - the response handler lived in sortieDetailScript anyway

    //create an update field payload
    //NOTE: assumes all necessary attributes are correctly associated with the field
    /* let val = this.newValue;
    let payload = {
        sortieID: sortieID,
        table: this.inputElement.getAttribute("data-table"),
        elementID: this.inputElement.getAttribute("data-element-id"),
        field: this.inputElement.getAttribute("data-field"),
        value: JSON.stringify(val)
    }; */ //looks like stringify does pretty well with time values, too! - should default to Z time to avoid timezone ambiguity

    //send update to server
    /* let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload)); */
};

//user cancels input, revert to previous value
DateTimeModal.prototype.inputCancel = function() {
    event.stopPropagation();
    //reset newValue = current dateTimeValue
    if (this.dateTimeValue.valueOf() > 0) {
        this.newValue = new Date(this.dateTimeValue);
    } else {
        this.newValue = new Date(""); //reset to null
        this.dateTimeValue = new Date("");
    }
    //display the current dateTimeValue
    this.displayNewValue();
};


//move modal to avoid overflowing window
DateTimeModal.prototype.reposition = function() {
    //shift left/right
    if (this.modal.getBoundingClientRect().right > window.innerWidth) {
        this.modal.classList.add("shiftLeft");
    }
    if (this.modal.getBoundingClientRect().left < 0) {
        this.modal.classList.remove("shiftLeft");
    }

    //shift up/down
    if (this.modal.getBoundingClientRect().bottom > window.innerHeight - 25) {
        this.modal.classList.add("shiftUp");
        //test that modal is within container (if required)
        if (this.containerElement !== null) {
            if (this.containerElement.getBoundingClientRect().top > this.modal.getBoundingClientRect().top) {
                this.modal.classList.remove("shiftUp");
            }
        }
    }
    if (this.modal.getBoundingClientRect().top < 50) {
        this.modal.classList.remove("shiftUp");
    }
};

//cleans up after modal for closing
DateTimeModal.prototype.close = function() {
    //remove resize listener - since this is attached to the window, it won't ever be removed otherwise
    window.removeEventListener('resize', this.shiftHandler);
    this.modal.outerHTML = '';
};

//parses time input input fields - requires event to determine which value was updated
//updates newValue and displays interpreted input
//return: true if value was valid --> only blank inputs (or no digits) should return false
DateTimeModal.prototype.parseTimeInput = function(event) {
    if (Number(event.target.value) >= 0) {
        if (isNaN(this.newValue.valueOf())) {
            //no existing input, create a new value
            let now = new Date();
            this.newValue = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                Number(this.timeHourInput.value) >= 0 && Number(this.timeHourInput.value) < 24 ? Number(this.timeHourInput.value) : 0,
                Number(this.timeMinuteInput.value) >= 0 && Number(this.timeMinuteInput.value) < 60 ? Number(this.timeMinuteInput.value) : 0));
            //correct date if it seems like the user may want tomorrow
            if (this.newValue.valueOf() - now.valueOf() < -4320000) {
                //newValue is > 12 hours in the past, add a day for a better new date value
                this.newValue.setUTCDate(this.newValue.getUTCDate() + 1);
            }
        } else {
            //add time to existing input
            this.newValue.setUTCHours(Number(this.timeHourInput.value) >= 0 && Number(this.timeHourInput.value) < 24 ? Number(this.timeHourInput.value) : 0,
                Number(this.timeMinuteInput.value) >= 0 && Number(this.timeMinuteInput.value) < 60 ? Number(this.timeMinuteInput.value) : 0);
        }
    } else {
        return false; //bad input, don't update values
    }

    this.displayNewValue(); //update display
    return true; //if we got here, then we succeeded
};

//parses date input from String to Date
//updates newValue and displays interpreted input
//return: true if value was valid
//NOTE: IE date format is very picky and this will not work well there -> this works in Chrome only for now
DateTimeModal.prototype.parseDateInput = function(d) {
    //let inDate = new Date(Date.parse(d)); //get date string into date format (note: local value will need to be converted to Z)
    let inDate = parseDateString(d);

    //if valid date was not created, quit
    if (!(inDate.valueOf() > 0)) {
        //revert to previous value (if there was one)
        this.displayNewValue();
        return false;
    }


    //combine with existing value, or set the UTC date value at 0 time if current value is empty
    this.newValue = new Date(Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate(), (this.newValue.getUTCHours() || 0), (this.newValue.getUTCMinutes() || 0)));

    this.displayNewValue(); //update display
    return true; //if we got here, then we succeeded
};






//functions for formatting time (calendar includes date formatting tool)
function formatTime(t, colon) {
    if (typeof colon === 'undefined') {
        colon = false;
    }
    if (t !== null && t.valueOf() > 0 && typeof t !== 'undefined') {
        return (t.getUTCHours() < 10 ? "0" : "") + t.getUTCHours() + (colon ? ":" : "") + (t.getUTCMinutes() < 10 ? "0" : "") + t.getUTCMinutes();
    } else if (colon) {
        return "HH:MM";
    } else {
        return "----";
    }
}

function formatShortDate(d) {
    if (d !== null && typeof d !== 'undefined' && d.valueOf() > 0) {
        return (d.getUTCDate() >= 10 ? d.getUTCDate() : "0" + d.getUTCDate()) + "-" + shortMonth[d.getUTCMonth()] + "-" + d.getUTCFullYear().toString(); //.substr(-2); <--if you only want last 2 digits
    } else {
        return "";
    }
}

//formats string into date
//returns invalid date object if not able to determine correct date
//accepts following formats:
//d* mmm*, d* mmm* yy, d* mmm* yyyy
//mmm* d, mmm* d yy, mmm* dd yy, mmm* d yyyy, mmm* dd yyyy
//m*/d*, m*/d*/yy, m*/d*/yyyy
function parseDateString(dateStr) {
    let dmmmy = /(\d{1,2})[^A-Z0-9]*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[^A-Z0-9]*(\d{0,4})/i;
    let mmmdy = /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[^A-Z0-9]*(\d{1,2})[^A-Z0-9]*(\d{0,4})/i;
    let mmddyy = /(\d{1,2})[^A-Z0-9]+(\d{1,2})[^A-Z0-9]*(\d{0,4})/i;
    let d, m, y; //set aside our variables for month,day, and year - remain unassigned until we find an input pattern
    let blankYear = false; //indicates if we filled in empty year value with current value
    let fullYear = false; //indicates user provided full year input
    let now = new Date(); //current date for filling in blanks
    //check string against each pattern
    if (dmmmy.test(dateStr)) {
        let match = dmmmy.exec(dateStr);
        d = Number(match[1]);
        m = Number(shortMonth.indexOf(match[2].toUpperCase()));
        y = Number(match[3] || now.getUTCFullYear());
        blankYear = !(match[3]);
        fullYear = (match[3].length === 4);
    } else if (mmmdy.test(dateStr)) {
        let match = mmmdy.exec(dateStr);
        m = Number(shortMonth.indexOf(match[1].toUpperCase()));
        d = Number(match[2]);
        y = Number(match[3] || now.getUTCFullYear());
        blankYear = !(match[3]);
        fullYear = (match[3].length === 4);
    } else if (mmddyy.test(dateStr)) {
        let match = mmddyy.exec(dateStr);
        m = Number(match[1]) - 1; //subtract 1 to get to base 0 month count
        d = Number(match[2]);
        y = Number(match[3] || now.getUTCFullYear());
        blankYear = match[3].length < 2;
        fullYear = (match[3].length === 4);
        if (m > 11 || m < 0) {
            return new Date('');
        } //check for month input error
    } else {
        return new Date(''); //return invalid date because none of the parsing patterns matched
    }

    //try to fix major errors
    //try to interpret a 2-digit year input
    if (!fullYear) {
        y = Number(now.getUTCFullYear().toString().substring(0, 2) + y.toString()); //get first 2 digits of the year to add to front of input
        if (y < now.getUTCFullYear() - 99 || y > now.getUTCFullYear() + 99) { //year off by more than 99 (probably decimal error)
            y = now.getUTCFullYear();
            blankYear = true; //we just completely overwrote year, so adjust as if the user didn't provide anything
        } else if (y > now.getUTCFullYear() + 50) { //probably referring to previous century
            y -= 100;
        } else if (y < now.getUTCFullYear() - 50) { //probably referring to next century
            y += 100;
        }
    }
    //this is for new user input, so adjust year if an early month is entered late in the year
    //first two months of the year entered during last two months of the year, use next year if year was not explicitly provided
    if (blankYear && now.getUTCMonth() > 9 && m < 2) {
        y += 1;
    }

    return new Date(Date.UTC(y, m, d));
}

//Note - This function is no longer used by datetimeInput, since we split up the time string, but it could be useful elsewhere, so keeping until new home is found
//parses time input from String to Date - bad input will be returned as 0000
//returns date value with only hour and minute values (date portion is 0)
function parseTimeString(t) {
    //start out with hours and minutes set to 0
    let h = 0;
    let m = 0;

    if (String(t).indexOf(':') >= 0) {
        //semicolons exist, use to split
        let tA = t.split(':');
        for (let i = 0; i <= 1; i++) {
            if (typeof tA[i] === 'undefined') {
                tA[i] = "0";
            }
            tA[i] = parseInt(String(tA[i]).replace(/\D/g, ''));
        }
        if (tA[0] >= 0 && tA[0] < 24) {
            h = tA[0];
        } //else { return false; } //use this if we want to fail the entire transaction instead of resetting to 0
        if (tA[1] >= 0 && tA[1] < 60) {
            m = tA[1];
        }
    } else {
        //remove non-number characters
        t = String(t).replace(/\D/g, '');
        //no semicolon, use length to determine hours/minutes
        if (t.length > 0 && t.length <= 2) { //H,HH - just hours
            t = parseInt(t);
            if (t >= 0 && t < 24) {
                h = t;
            }
        } else if (t.length > 0 && t.length <= 4) { //Hmm, HHmm - count from right to get hours and minutes (since minutes should always be 2 digits)
            let tH = parseInt(t.slice(0, -2));
            let tM = parseInt(t.slice(-2));
            if (tH >= 0 && tH < 24) {
                h = tH;
            }
            if (tM >= 0 && tM < 60) {
                m = tM;
            }
        } else if (t.length > 4) { //HHmm* -count from left since it appears we have some extra garbage on here
            let tH = parseInt(t.slice(0, 2));
            let tM = parseInt(t.slice(2, 4));
            if (tH >= 0 && tH < 24) {
                h = tH;
            }
            if (tM >= 0 && tM < 60) {
                m = tM;
            }
        }
    }

    return new Date(Date.UTC(0, 0, 0, h, m));
}

//uses current page selection to highlight all text
//Required for content editable inputs because they don't have a select() method
// function selectAll(target) {
//     let sel = window.getSelection();
//     let r = new Range();
//     r.setStart(target.firstChild, 0);
//     r.setEnd(target.firstChild, target.firstChild.length);
//     sel.removeAllRanges();
//     sel.addRange(r);
// }