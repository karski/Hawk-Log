//calendar control that updates a source date display
//operates on UTC dates
// largely inspired and based on "vanillaCalendar" by Chrissy Collins https://github.com/chrisssycollins/vanilla-calendar

const month = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];




//creates calendar instance
//draws calndar display inside calendar element (should be an appropriately sized div)
//selects date passed and calls back any user input to selectDateCallback(date)
//if passed date is null, current month is displayed without selection
function Calendar(selectDateCallback, initialDate, initialMonth) {
    //store inputs so we can reference later
    //this.calendarElement = calendarElement; -we never actually need this after initial draw, so let's manage it ourselves
    this.calendarContainer = document.createElement("div");
    this.calendarContainer.className = "calendar-container";
    this.selectCallback = selectDateCallback;
    //initial values for display (no selection and today)
    this.selected = -1;
    this.displayMonth = new Date();
    //set display month to passed value if it exists
    if (typeof initialMonth !== 'undefined' && initialMonth !== null && !isNaN(initialMonth.valueOf()) && initialMonth.valueOf() > 0) {
        this.displayMonth = initialMonth;
    }

    //construct initial display frames
    //month/year label
    this.monthSelection = new inputDropdown(month, "", "", "", month[this.displayMonth.getUTCMonth()], false, false);
    this.yearSelection = new inputDropdown(generateYearList(this.displayMonth, 3), "", "", "", this.displayMonth.getUTCFullYear(), false, false);

    //add listeners to catch updates from dropdown controls
    this.monthSelection.getHTMLNode().addEventListener('change', () => {
        this.displayMonth.setUTCMonth(month.indexOf(event.target.value));
        this.drawMonth();
    });
    this.monthSelection.getHTMLNode().addEventListener('click', () => {
        this.yearSelection.dropdownHide(); //make sure year is closed if we are opening month
    });
    this.yearSelection.getHTMLNode().addEventListener('change', () => {
        this.displayMonth.setUTCFullYear(event.target.value);
        this.drawMonth();
    });
    this.yearSelection.getHTMLNode().addEventListener('click', () => {
        this.monthSelection.dropdownHide(); //make sure month is closed if we are opening year
    });

    let calendarLabel = document.createElement("div");
    calendarLabel.className = "calendar-monthLabel";
    calendarLabel.appendChild(this.yearSelection.getHTMLNode());
    calendarLabel.appendChild(this.monthSelection.getHTMLNode());

    //calendarLabel.appendChild(this.monthLabel);
    //calendarLabel.appendChild(this.yearLabel);

    //month change buttons
    this.buttonPrev = document.createElement("div");
    this.buttonPrev.className = "button small";
    this.buttonPrev.innerText = "←";
    this.buttonPrev.addEventListener('click', () => {
        //event.stopPropagation();
        this.displayMonth.setUTCMonth(this.displayMonth.getUTCMonth() - 1);
        this.drawMonth();
    });
    this.buttonNext = document.createElement("div");
    this.buttonNext.className = "button small";
    this.buttonNext.innerText = "→";
    this.buttonNext.addEventListener('click', () => {
        //event.stopPropagation();
        this.displayMonth.setUTCMonth(this.displayMonth.getUTCMonth() + 1);
        this.drawMonth();
    });

    //construct header section
    let weekdayLabelRow = document.createElement("div");
    weekdayLabelRow.className = "calendar-weekday-row";
    //weekdayLabelRow.innerHTML = "<div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>";
    weekdayLabelRow.innerHTML = "<div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>";
    let monthLabelRow = document.createElement("div");
    monthLabelRow.className = "calendar-month-row";
    monthLabelRow.appendChild(this.buttonPrev);
    monthLabelRow.appendChild(calendarLabel);
    monthLabelRow.appendChild(this.buttonNext);
    let calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";
    calendarHeader.appendChild(monthLabelRow);
    calendarHeader.appendChild(weekdayLabelRow);
    //day container
    this.dayContainer = document.createElement("div");
    this.dayContainer.className = "calendar-day-container";

    //use input to select current date and draw the calendar
    this.updateSelection(initialDate);

    //add elements created above to the container
    this.calendarContainer.appendChild(calendarHeader);
    this.calendarContainer.appendChild(this.dayContainer);
}

Calendar.prototype.getHTMLNode = function() {
    return this.calendarContainer;
};


//fills in the month - requires container and header to be prebuilt already
Calendar.prototype.drawMonth = function() {
    this.clearCal();
    //display month & year for user
    this.monthSelection.setValue(month[this.displayMonth.getUTCMonth()]);
    //this.monthLabel.innerText = month[this.displayMonth.getUTCMonth()];
    this.yearSelection.list.buildList(generateYearList(this.displayMonth, 3));
    this.yearSelection.setValue(this.displayMonth.getUTCFullYear());
    //this.yearLabel.innerText = this.displayMonth.getUTCFullYear();

    //determine end of current month or find a way to wrap month around year
    let monthEnd = new Date(Date.UTC(this.displayMonth.getUTCFullYear(), this.displayMonth.getUTCMonth() + 1, 1));
    monthEnd.setUTCDate(monthEnd.getUTCDate() - 1);
    //set up day loop by creating a new date at the beginning of the month
    let day = new Date(Date.UTC(this.displayMonth.getUTCFullYear(), this.displayMonth.getUTCMonth(), 1));
    //reset day to the beginning of the week
    day.setUTCDate(day.getUTCDate() - day.getUTCDay());
    //fill in month days - exit contidion: first sunday past current month
    while (!(day.valueOf() > monthEnd.valueOf() && day.getUTCDay() === 0)) {
        this.drawDay(day);
        day.setUTCDate(day.getUTCDate() + 1);
    }
};

//draws a single day entry with date input
Calendar.prototype.drawDay = function(d) {
    let dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.setAttribute('data-calendar-date', d.valueOf());
    dayElement.innerText = d.getUTCDate();

    //add formatting for selected, today, or date in adjacent month
    if (d.valueOf() === this.selected.valueOf()) {
        dayElement.classList.add("calendar-day-selected");
    }
    if (d.getUTCMonth() !== this.displayMonth.getUTCMonth()) {
        dayElement.classList.add("calendar-day-otherMonth");
    }
    let today = new Date();
    if (d.getUTCDate() === today.getUTCDate() && d.getUTCMonth() === today.getUTCMonth() && d.getUTCFullYear() === today.getUTCFullYear()) {
        dayElement.classList.add("calendar-day-today");
    }

    //add click listener
    dayElement.addEventListener('click', () => {
        this.selectDate(event);
    });

    //append element to day container
    this.dayContainer.appendChild(dayElement);
};

//clears all calendar elements to prep for new month or selection
Calendar.prototype.clearCal = function() {
    //this.monthLabel.innerHTML = '';
    //this.yearLabel.innerHTML = '';
    this.dayContainer.innerHTML = '';
};

//user selects date using calendar
// updates date display value and highlights desired date
Calendar.prototype.selectDate = function() {
    //save selected date into calendar object
    this.selected = new Date(Number(event.target.getAttribute("data-calendar-date"))); //parseUTCDate(event.target.getAttribute("data-calendar-date"));
    //clear formatting on old selection
    let oldSelection = this.dayContainer.querySelectorAll(".calendar-day-selected");
    for (let i = 0; i < oldSelection.length; i++) {
        oldSelection[i].classList.remove("calendar-day-selected");
    }
    //mark current selection
    event.target.classList.add("calendar-day-selected");
    //make callback
    this.selectCallback(this.selected);
};

//Display today in calendar view
Calendar.prototype.displayToday = function() {
    this.displayMonth = new Date();
    this.drawMonth();
};

//Display selected day in calendar view
Calendar.prototype.displaySelected = function() {
    this.displayMonth = (this.selected > 0 ? new Date(this.selected) : new Date());
    this.drawMonth();
};


//updates selected date - requires input to be a correct date object
Calendar.prototype.updateSelection = function(d) {
    if (typeof d !== 'undefined' && d !== null && !isNaN(d.valueOf()) && d.valueOf() > 0) {
        //should be valid date input - set up the calendar to display it
        //ensure selected is a day value (no time)
        this.selected = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        this.displayMonth = new Date(d.valueOf());
    } else {
        this.selected = -1; //no selection will be displayed
    }
    this.drawMonth();
};

// builds a list of year values around the year of a given date
// d = date currently selected
// numYears is the number of years on either side to display
function generateYearList(d, numYears) {
    let yearList = [];
    for (let i = d.getUTCFullYear() - numYears; i <= d.getUTCFullYear() + numYears; i++) {
        yearList.push(i);
    }
    return yearList;
}