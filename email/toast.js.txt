//draws toasts onscreen for short-term notificatoins

//keeps track of all current toasts
var toastList = [];


//displays a toast to the user
//background color is optional
function showToast(message, backgroundColor, duration) {
    //create toast element and add to page (without show class)
    let newToast = document.createElement("div");
    newToast.classList.add("toast");
    newToast.innerText = message;
    if (backgroundColor !== undefined) {
        newToast.style.backgroundColor = backgroundColor;
    }
    document.body.appendChild(newToast);

    //add to front of toastList
    toastList.unshift(newToast);

    repositionToasts();


    //add show and slide in classes to toast
    newToast.classList.add("show", "movein");

    

    //assign timeout to remove
    if (duration === undefined) { duration = 5000; }
    setTimeout(removeToast, duration, newToast);
}

function removeToast(oldToast) {
    //remove show class
    oldToast.classList.remove("show");
    
    //wait then remove element from page and list
    setTimeout(function (t) { t.parentNode.removeChild(t); toastList.splice(toastList.indexOf(t), 1); repositionToasts();}, 500, oldToast);
}

function repositionToasts() {
    //reposition all the toasts to reflect their position in the queue
    for (let i = 0; i < toastList.length; i++) {
        toastList[i].style.transform = "translate(-50%," + (10 + (50 * i)) + "px)";
    }
}