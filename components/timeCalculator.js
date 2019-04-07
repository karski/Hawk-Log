// simple modal that will provide a one-time calculation using 2 date/time modals and a text field (for duration)
//   has no callbacks - only displays info
//   destroyed after closing

function timeCalcModal(containerElement) {
    //internal state variables
    let today = new Date(); //throw away variable to build initial values
    this.startTime = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    this.endTime = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    this.duration = "0.0";
    this.openModal = null; //store time selection modal here so it can be closed before the next is opened
    //create elements
    this.modal = document.createElement("div");
    this.modal.className = "modal card diffCalc";
    this.modal.addEventListener('click', () => {
        event.stopPropagation(); //prevents clicks on modal from bubbling up to document level (which would trigger modal close)
        //make sure all dropdowns are closed if a click happens outside of them
        this.closeSubModal();
    });
    let header = document.createElement("h1");
    header.className = "modalHeader";
    header.innerText = "Time Calc";
    let content = document.createElement("div");
    content.style.display = "flex";
    content.style.alignItems = "flex-start";
    let separator = document.createElement("span");
    separator.innerText = "⇢";
    separator.style.padding = "0 5px";
    let equals = document.createElement("span");
    equals.innerText = "=";
    equals.style.padding = "0 5px";
    let answers = document.createElement("div");
    let duration
    let label = document.createElement("span");
    label.innerText = " hrs";
    this.startInput = document.createElement("div");
    this.startInput.className = "editDateTime";
    this.startInput.setAttribute("data-name", "Start Time");
    this.startInput.setAttribute("data-value", this.startTime.toString());
    this.startInput.addEventListener("click", () => {
        this.closeSubModal();
        this.openModal = new DateTimeModal((val) => { this.startTimeChangeHandler(val) }, this.startInput);
        addModal(this.openModal, false);
    });
    this.startTimeDisp = document.createElement("span");
    this.startTimeDisp.className = "timeDisplay";
    this.startTimeDisp.innerText = "0000";
    this.endInput = document.createElement("div");
    this.endInput.className = "editDateTime";
    this.endInput.setAttribute("data-name", "End Time");
    this.endInput.setAttribute("data-value", this.endTime.toString());
    this.endInput.addEventListener("click", () => {
        //close any existing time input modals so they don't overlap
        this.closeSubModal();
        this.openModal = new DateTimeModal((val) => { this.endTimeChangeHandler(val) }, this.endInput);
        addModal(this.openModal, false);
    });
    this.endTimeDisp = document.createElement("span");
    this.endTimeDisp.className = "timeDisplay";
    this.endTimeDisp.innerText = "0000";
    this.durationInput = document.createElement("div");
    this.durationInput.className = "editText";
    this.durationInput.setAttribute("contentEditable", "true");
    this.durationInput.setAttribute("spellcheck", "false");
    this.durationInput.innerText = "0.0";
    this.durationInput.addEventListener("keydown", () => { this.durationKeyHandler(event) });
    this.durationInput.addEventListener("focusout", () => { this.durationChangeHandler(event.target.innerText) });
    //add to page
    this.modal.appendChild(header);
    this.startInput.appendChild(this.startTimeDisp);
    content.appendChild(this.startInput);
    content.appendChild(separator);
    this.endInput.appendChild(this.endTimeDisp);
    content.appendChild(this.endInput);
    content.appendChild(equals);
    content.appendChild(this.durationInput);
    content.appendChild(label);
    this.modal.appendChild(content);
    containerElement.appendChild(this.modal);
    addModal(this, true);
}

//cleans up after modal for closing
timeCalcModal.prototype.close = function() {
    this.modal.outerHTML = '';
};

//ensures only one modal is open before opening a second
timeCalcModal.prototype.closeSubModal = function() {
    //todo: add some error handling since the modal display may not even exist
    if (this.openModal !== null) {
        try {
            this.openModal.close();
            removeSpecificModal(this.openModal);
            this.openModal = null;
        } catch (err) {
            this.openModal = null;
        }
    }
};

//handles time changes
timeCalcModal.prototype.startTimeChangeHandler = function(newVal) {
    this.startTime = cleanTimeValue(newVal);
    //clear changed value formatting
    for (let e of this.modal.querySelectorAll(".changed")) { e.classList.remove("changed") }
    //run calculation and display values
    this.duration = formatTimeDuration(this.startTime, this.endTime);
    this.updateDisplayValues();
};
timeCalcModal.prototype.endTimeChangeHandler = function(newVal) {
    this.endTime = cleanTimeValue(newVal);
    //clear changed value formatting
    for (let e of this.modal.querySelectorAll(".changed")) { e.classList.remove("changed") }
    //run calculation and display values
    this.duration = formatTimeDuration(this.startTime, this.endTime);
    this.updateDisplayValues();
};

//handles duration changes
timeCalcModal.prototype.durationKeyHandler = function(event) {
    if (event.key === "Escape" || event.key === "Esc") { //on escape, display current duration value
        event.stopPropagation();
        event.target.innerText = this.duration;
        event.target.blur();
    } else if (event.key === "Enter") {
        event.target.blur();
    }
};
timeCalcModal.prototype.durationChangeHandler = function(newVal) {
    //force value to a number and round to one decimal place
    let val = parseFloat(newVal).toFixed(1);
    console.log(val);
    if (isNaN(val)) { //bad input - don't change any values, just redraw current
        this.updateDisplayValues();
        return
    } else { //now do some fuzzy math to figure out what the end time should be...
        this.duration = val;
        let hours = Math.floor(Number(val));
        let minutes = decimalMinutes(Math.abs(Number(val)));
        this.endTime = new Date(Date.UTC(this.startTime.getUTCFullYear(), this.startTime.getUTCMonth(), this.startTime.getUTCDate(), this.startTime.getUTCHours() + hours, this.startTime.getUTCMinutes() + minutes, 0));
    }
    this.updateDisplayValues();
};

//update display based on current values
timeCalcModal.prototype.updateDisplayValues = function() {
    this.durationInput.innerText = this.duration;
    this.startTimeDisp.innerText = formatTime(this.startTime);
    this.startInput.setAttribute("data-value", this.startTime.toString());
    this.startInput.title = formatShortDate(this.startTime) + " " + formatTime(this.startTime) + "z";
    this.endTimeDisp.innerText = formatTime(this.endTime);
    this.endInput.setAttribute("data-value", this.endTime.toString());
    this.endInput.title = formatShortDate(this.endTime) + " " + formatTime(this.endTime) + "z";
    console.log("display updated");
};


//handles returned values from datetimemodal since they can be NAN
function cleanTimeValue(val) {
    if (isNaN(val.valueOf())) { //input was cleared - reset to initial value
        let today = new Date();
        return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
    } else {
        return new Date(val.valueOf());
    }
}