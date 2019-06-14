var sortieID = 0; //for now just use this fixed value

var sortieData = {
    "SORTIE": {
        "csATO": "LONGNAME01",
        "csATC": "FRIENDLY99"
    },
    "TIMELINE": [{
        "id": 1,
        "name": "OpArea1",
        "schedOn": "8AUG2019T1030Z"
    }]
};

var airfieldList = [
    ["KBAB", "Beale AFB"],
    ["KRDR", "Grand Forks AFB"],
    ["KEDW", "Edwards AFB"],
    ["KWRB", "Warner Robbins"],
    ["LICZ", "Sigonella NAS"],
    ["OMAM", "Al Dhafra AFB"],
    ["PGUA", "Anderson AFB"],
    ["RJTY", "Yakota AFB"],
    ["RJSM", "Misawa AFB"]
];

var statusList = ["PLANNED", "PREFLIGHT", "INFLIGHT", "POSTFLIGHT", "EFFECTIVE", "INEFFECTIVE", "CNX", "OPS CNX", "WX CNX", "MX CNX", "OPS RTB", "MX RTB"];

var deviationList = ["WEATHER", "ATC", "OPS", "MISSION CHANGE"];
//assign sortie ID
sortieID = getParameterByName("ID");

// functions for crontrolling UI elements

window.onload = testFunction;
//window.onload = getSortie;


function testFunction() {
    //assign input listeners to fields labeled as such
    let textInputs = document.getElementsByClassName("editText");
    for (let i of textInputs) {
        i.addEventListener("focus", editFocus);
    }
    let memoInputs = document.getElementsByClassName("editMemo");
    for (let i of memoInputs) {
        i.addEventListener("focus", editFocus);
    }
    let timeInputs = document.getElementsByClassName("editDateTime");
    let logTimeInputs = document.querySelectorAll('#logContainer .logEntry .editDateTime');
    let logContainer = document.getElementById("logContainer");
    for (let i of timeInputs) {
        i.addEventListener('click', () => {
            //event.stopPropagation();
            if (Array.prototype.includes.call(logTimeInputs, i)) {
                addModal(new DateTimeModal((val) => { timeInputAccept(i, val) }, i, logContainer), true);
            } else {
                addModal(new DateTimeModal((val) => { timeInputAccept(i, val) }, i), true);
            }

        });
    }

    //dropdowns
    let takeoffAirfield = document.querySelector('#takeoffRow .dropHolder');
    let takeoffList = new inputDropdown(airfieldList, "KBAB", true, true, true);
    takeoffList.getHTMLNode().setAttribute("data-element-id", "123");
    takeoffList.getHTMLNode().setAttribute("data-table", "SORTIE");
    takeoffList.getHTMLNode().setAttribute("data-field", "TakeoffLocation");
    takeoffList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    takeoffAirfield.appendChild(takeoffList.getHTMLNode());
    //takeoffAirfield.addEventListener('click', () => { dropdownToggle(takeoffList); });
    let landAirfield = document.querySelector('#landRow .dropHolder');
    let landList = new inputDropdown(airfieldList, "KEDW", true, true, true);
    landList.getHTMLNode().setAttribute("data-element-id", "123");
    landList.getHTMLNode().setAttribute("data-table", "SORTIE");
    landList.getHTMLNode().setAttribute("data-field", "LandLocation");
    landList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    landAirfield.appendChild(landList.getHTMLNode());
    //landAirfield.addEventListener('click', () => { dropdownToggle(landList); });
    let stat = document.querySelector('#msnStat.dropHolder');
    let statList = new inputDropdown(statusList, "EFFECTIVE", false, false, true);
    statList.getHTMLNode().setAttribute("data-element-id", "123");
    statList.getHTMLNode().setAttribute("data-table", "SORTIE");
    statList.getHTMLNode().setAttribute("data-field", "status");
    statList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    stat.appendChild(statList.getHTMLNode());


    //tooltip test
    let x = document.querySelector('.tooltip');
    let xList = new inputDropdown(statusList, "EFFECTIVE", false, false, true);
    xList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    x.appendChild(xList.getHTMLNode());

    //deviation tooltip mockup
    let dev = document.querySelector('.deviationLabel');
    let devList = new inputDropdown(deviationList, "", false, true, true);
    devList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    dev.appendChild(devList.getHTMLNode());

    //deviation tooltip mockup
    let ldev = document.querySelector('#landRow .deviationLabel');
    let ldevList = new inputDropdown(deviationList, "", false, true, true);
    ldevList.getHTMLNode().addEventListener("change", (event) => {
        console.log(event);
        showToast(event.target.value);
    });
    ldev.appendChild(ldevList.getHTMLNode());

    // input list modal input
    document.querySelector('.button.logEvent').addEventListener('click', () => { new inputSelectModal(statusList, (o) => { console.log(o); }, true, false, false, true, true, "Flight Events") });
    document.querySelector('.button.logFault').addEventListener('click', () => { new inputSelectModal(statusList, (o) => { console.log(o); }, true, false, true, true, true, "Faults") });

}



// query server for the sortie specified by the address line parameter
function getSortie() {
    if (typeof(sortieID) === "undefined" || sortieID === null) {
        showToast("Sortie ID not provided.  Try going back to previous page.", "#fff59d");
        return
    }

    let payload = {
        sortieID: sortieID
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", getSortieURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
}

//reverses order of child elements in the provided container - useful for reverse chronological lists
function reverseSort(containerElement) {
    for (i = 1; i < containerElement.childElementCount; i++) {
        containerElement.insertBefore(containerElement.children[i], containerElement.children[0]);
    }
}


function editFocus() {
    event.stopPropagation();

    //restore spellcheck function
    event.target.spellcheck = true;

    //store the current innerHTML
    //event.target.setAttribute("data-old-value", event.target.innerHTML);
    event.target.oldHTML = event.target.innerHTML;

    //assign event listeners
    event.target.addEventListener("keydown", inputKeyCatcher);
    event.target.addEventListener("focusout", inputAccept);
}

function inputKeyCatcher() {
    event.stopPropagation();
    //event.preventDefault();
    //all inputs cancel input on escape
    if (event.key === "Escape" || event.key === "Esc") {
        console.log("Escape key pressed");

        event.target.spellcheck = false;
        inputCancel();
    }
    //text edit fields will accept input on enter key
    if (event.target.classList.contains("editText") && event.key === "Enter") {
        event.preventDefault();

        event.target.spellcheck = false;
        inputAccept();
    }
}

//send time changed data - handled slightly differently than text, 
// since the value isn't stored in the root element value, but an attribute
function timeInputAccept(sourceElement, value) {

    let payload = {
        sortieID: sortieID,
        table: sourceElement.getAttribute("data-table"),
        elementID: sourceElement.getAttribute("data-element-id"),
        field: sourceElement.getAttribute("data-field"),
        value: JSON.stringify(value),
        respond: 'sortie'
    };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));

    // fetch(updateURL, {
    //     method: 'post',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(payload)
    // }).then(response => responseHandler(response));
}

function inputAccept() {
    console.log("Input accepted");

    //will need to use JSON.parse() to turn it back into HTML for the page

    //check to see if input field was changed - if not, we will cancel input
    if (event.target.innerHTML === event.target.oldHTML) {
        inputCancel();
        return;
    }

    //create an update field payload
    //NOTE: assumes all necessary attributes are correctly associated with the field
    let val = event.target.innerHTML;
    let payload = {
        sortieID: sortieID,
        table: event.target.getAttribute("data-table"),
        elementID: event.target.getAttribute("data-element-id"),
        field: event.target.getAttribute("data-field"),
        value: JSON.stringify(val),
        respond: 'sortie'
    };

    //remove event listensers
    event.target.removeEventListener("keydown", inputKeyCatcher);
    event.target.removeEventListener("focusout", inputAccept);
    event.target.classList.add("changed");

    //remove focus and spellcheck
    //add focus listener back after we're finished toggling spellcheck display
    event.target.spellcheck = false;
    event.target.innerHTML = JSON.parse(JSON.stringify(event.target.innerHTML)); //need to redraw contents to clear existing spellcheck marks - also gives us a chance to make values safe for display
    event.target.blur();

    //send update to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", updateURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
}

function inputCancel() {
    event.stopPropagation();
    //remove input event listeners
    event.target.removeEventListener("keydown", inputKeyCatcher);
    event.target.removeEventListener("focusout", inputAccept);
    console.log("Input cancelled");
    //replace value with previous value
    event.target.innerHTML = event.target.oldHTML;
    //remove focus
    event.target.spellcheck = false;
    event.target.blur();
}



//changes the color of the page body background to match COCOM themes
function changeColor(colorTag) {
    removeClassesContaining(document.body, "color");
    document.body.classList.add(colorTag);
}

//removes any class that contains "removeClass" from classlist
function removeClassesContaining(targetElement, removeClass) {
    for (let i = 0; i < targetElement.classList.length; i++) {
        if (targetElement.classList[i].includes(removeClass)) {
            targetElement.classList.remove(targetElement.classList[i]);
            i--;
        }
    }
}

//expands a panel
function expandPanel(panelID) {
    document.getElementById(panelID).classList.toggle("expand");
}



//displays the header panel sections when they have been collapsed for size
function headerNav(navSource, sectionClass) {
    //unselect all links
    let navLinks = document.querySelectorAll("#headerPanel nav a");
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove("current");
    }
    //select current link
    navSource.classList.add("current");
    //unselect all header sections
    let headerSections = document.getElementsByClassName("headerSection");
    for (let i = 0; i < headerSections.length; i++) {
        headerSections[i].classList.remove("selected");
    }
    //select header half indicated
    headerSections = document.getElementsByClassName(sectionClass);
    for (let i = 0; i < headerSections.length; i++) {
        headerSections[i].classList.add("selected");
    }
}



//Use this to highlight tabs as we scroll past specific cards
//source: https://css-tricks.com/sticky-smooth-active-nav/
var mainNavLinks = document.querySelectorAll("#navPanel a");
var mainPanel = document.getElementById("mainPanel");
var navPanel = document.getElementById("navPanel");

mainPanel.addEventListener("scroll", highlightMainNavLinks);

function highlightMainNavLinks() {
    //cut short if nav panel isn't visible
    if (window.getComputedStyle(navPanel).display !== "none") {
        let fromTop = mainPanel.scrollTop;

        for (let i = 0; i < mainNavLinks.length; i++) {
            let section = document.querySelector(mainNavLinks[i].hash);

            if ((section.offsetTop - 10) <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop) {
                mainNavLinks[i].classList.add("current");
            } else {
                mainNavLinks[i].classList.remove("current");
            }
        }

    }
}


//apply listener for timeline filter changes
let logFilters = document.querySelectorAll("input[name='filter']");
for (let i = 0; i < logFilters.length; i++) {
    logFilters[i].addEventListener("change", filterChange);
}
//filter timeline based on filter inputs
function filterChange() {
    let filterSelection = document.querySelector("input[name='filter']:checked");
    let logEntries = document.getElementsByClassName("logEntry");

    if (filterSelection.id === "filterAll") {
        //remove all hidden tags
        for (let i = 0; i < logEntries.length; i++) {
            logEntries[i].classList.remove("hidden");
        }
    } else {
        let tgtClass = filterSelection.getAttribute("data-target-class");

        //filter for tgtClass (hide all others)
        for (let i = 0; i < logEntries.length; i++) {
            if (logEntries[i].classList.contains(tgtClass)) {
                logEntries[i].classList.remove("hidden");
            } else {
                logEntries[i].classList.add("hidden");
            }

        }

    }
}

function responseHandler() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let rJSON = JSON.parse(this.responseText);
        console.log(rJSON);
        showToast("Log Server Accepted Update!", "#81f363");

        //render page
        //TODO!  All the Drawings!

    } else if (this.readyState === XMLHttpRequest.DONE) {
        //toast error notice
        showToast("Error communicating with the server.  Your update was not saved.");
        if (this.statusText !== "") { showToast(this.status + " " + this.statusText); } else { showToast("⚠ Check Network Connection and Try Again ⚠", "#fff59d"); }

        //mark bad changes so that user can attempt to save or send again
        let changes = document.getElementsByClassName("changed");
        while (changes.length > 0) {
            changes[0].classList.add("error");
            changes[0].classList.remove("changed");
        }

        //return changed fields to previous values 
        //TODO: *- this could be done by re-rendering page with existing data
        //Note - this doesn't work very well with the current dateTime fields, since replacing the inner HTML obliterates the modal (plus calendar date will get out of sync)
        //let changes = document.getElementsByClassName("changed");
        //while (changes.length > 0) {
        //    if (typeof changes[0].oldHTML !== "undefined") {
        //        changes[0].innerHTML = changes[0].oldHTML;
        //    } else if (typeof changes[0].oldValue !== "undefined") {
        //        changes[0].value = changes[0].oldValue;
        //    } else if (typeof changes[0].oldText !== "undefined") {
        //        changes[0].innerText = changes[0].oldText;
        //    }
        //    changes[0].classList.remove("changed");
        //}

    }
}