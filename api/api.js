// JavaScript source code
function getMission() {
    if (document.getElementById("textSortieID").value === "") {
        alert("All entries must have a Sortie ID");
        return false;
    }

    let payload = {
        id: document.getElementById("textSortieID").value
    };

    sendMessage(payload, "php_rest_myblog-master/api/post/read_single.php");
}

function updateField() {
    if (document.getElementById("textSortieID").value === "") {
        alert("All entries must have a Sortie ID");
        return false;
    }

    let payload = collectInputs();
    payload.action = "updateEntry";
    console.log(payload);

    sendMessage(payload, "php_rest_myblog-master/api/post/update.php");
}

function createEntry() {
    if (document.getElementById("textSortieID").value === "") {
        alert("All entries must have a Sortie ID");
        return false;
    }

    let payload = collectInputs();
    payload.action = "newEntry";
    console.log(payload);

    sendMessage(payload, "php_rest_myblog-master/api/post/create.php");
}


//AJAX functionality-------------------------------------------------------------------

function sendMessage(payload, targetURL) {
    document.getElementById("resultContainer").innerText = "Waiting for Response...";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;
    xhttp.open("POST", targetURL, true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(payload));
}

function responseHandler() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let rJSON = JSON.parse(this.responseText);
        console.log(rJSON);
        let rFormat = "";
        for(let entry in rJSON){
            rFormat += "<p>" + entry +":"+rJSON[entry] + "<p>";
        }
        document.getElementById("resultContainer").innerHTML = rFormat;//this.responseText;

    } else if (this.readyState === 4) {
        document.getElementById("resultContainer").innerText = "An error occurred";
    }
}


//Functions for managing the input table----------------------------------------------------

function collectInputs() {
    payload = {
        id: document.getElementById("textSortieID").value,
        table: document.getElementById("tableSelect").value
    };
    //loop through input fields
    let iFields = document.getElementsByClassName("textField");
    let iValues = document.getElementsByClassName("textValue");
    for (i = 0; i < iFields.length; i++) {
        //add entry if field name and value fields both exist
        if (iFields[i].value !== "" && iValues[i].value !== "") {
            payload[iFields[i].value] = iValues[i].value;
        }
    }

    return payload;
}


function addInputRow() {
    let iTable = event.target.parentElement.parentElement.parentElement;
    let iRow = event.target.parentElement.parentElement.rowIndex;
    if (iRow === (iTable.rows.length - 1)) {
        let newRow = document.createElement("tr");
        newRow.classList.add("inputRow");
        newRow.innerHTML = '<td><input class="textField" type="text" onfocus="addInputRow()" /></td>' +
            '<td> <input class="textValue" type="text" onfocus="addInputRow()" /></td>' +
            '<td><button style="color:red;" onclick="removeInputRow()">X</button></td>';
        iTable.appendChild(newRow);
    }
}

function removeInputRow() {
    let iTable = event.target.parentElement.parentElement.parentElement;
    let iRow = event.target.parentElement.parentElement.rowIndex;
    iTable.rows[iRow].outerHTML = "";
}
