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

// Initiate the page month and year displays - default to this month
let displayMonth = new Date();
let monthDropdown = new inputDropdown(month, "", "", "", month[displayMonth.getUTCMonth()], false, false, true);
let yearDropdown = new inputDropdown(generateYearList(displayMonth, 3), "", "", "", displayMonth.getUTCFullYear(), false, false, true);
let pageMonthLabel = document.getElementById("pageMonthLabel");
pageMonthLabel.innerHTML = '';
pageMonthLabel.appendChild(monthDropdown.getHTMLNode());
let pageYearLabel = document.getElementById("pageYearLabel");
pageYearLabel.innerHTML = '';
pageYearLabel.appendChild(yearDropdown.getHTMLNode());