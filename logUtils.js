// collection of functions and constants that are not bound to a specific page or component that are useful across several areas of the log
const getSortieURL = "./api/post/read_single.php";
const updateURL = "./api/post/update.php";
const createURL = "./api/post/create.php";
const deleteURL = "./api/post/delete.php";


//uses regular expression to get parameter from URL
//if parameter is not found, returns NULL
//Source: Jolly.exe's answer on https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//adds parameter to location or updates the existing value
//modified regexp from Jolly.exe's answer on https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
function addParamter(name, value, addParamHeader) {
    var url = window.location.href.substr(window.location.href.lastIndexOf("/") + 1); //window.location.href;
    //check if already in location
    var regex = new RegExp("([?&]" + name + "=)(([^&#]*)|&|#|$)");
    if (regex.test(url)) {
        //replace the existing value
        //window.location.href = url.replace(regex, '$1' + value);
        history.replaceState(null, "", url.replace(regex, '$1' + value));
    } else {
        //append to the end of the url
        //window.location.href = url + (/\?/.test(url) ? "&" : "?") + name + "=" + value;
        history.replaceState(null, "", url + (/\?/.test(url) ? "&" : "?") + name + "=" + value);
    }
}

//given a value in minutes, provides 781 rounding to hours
//for example: 62 -> 1.0
function roundMinutes(t) {
    let sign = (t >= 0 ? 1 : -1)
    let h = Math.floor(Math.abs(t) / 60) * sign;
    let m = Math.abs(t) % 60;
    if (m <= 2) {
        return h;
    } else if (m <= 8) {
        return h + (0.1 * sign);
    } else if (m <= 14) {
        return h + (0.2 * sign);
    } else if (m <= 20) {
        return h + (0.3 * sign);
    } else if (m <= 26) {
        return h + (0.4 * sign);
    } else if (m <= 33) {
        return h + (0.5 * sign);
    } else if (m <= 39) {
        return h + (0.6 * sign);
    } else if (m <= 45) {
        return h + (0.7 * sign);
    } else if (m <= 51) {
        return h + (0.8 * sign);
    } else if (m <= 57) {
        return h + (0.9 * sign);
    } else {
        return h + sign;
    }
}


//determines if a time difference is a deviation (default is > +-30 minutes)
//devTime is in minutes
function isDev(actualTime, schedTime, devTime) {
    if (devTime === undefined) {
        devTime = 30;
    }
    if (typeof actualTime !== 'undefined' && typeof schedTime !== 'undefined') {
        //get the difference in minutes, then round down to the nearest minute
        if (Math.floor(Math.abs((actualTime - schedTime) / 60000)) > devTime) {
            return true;
        }
    }
    return false; //can't be a deviation if both numbers don't exist (or if it doesn't meet the condition)

}


//determines difference between two times (valueOf) and returns formatted string
function formatTimeDifference(actualTime, schedTime) {
    if (typeof actualTime !== 'undefined' && typeof schedTime !== 'undefined') {
        if (actualTime === schedTime) {
            return "On Time";
        } else {
            let diff = roundMinutes((actualTime - schedTime) / 60000);
            return Math.abs(diff) + (diff % 1 === 0 ? ".0 " : "hr ") + (diff > 0 ? "late" : "early");
        }
    } else {
        return "-";
    }
}

//determines duration of time between two times (valueOf) and returns formatted string
function formatTimeDuration(startTime, endTime) {
    if (typeof startTime !== 'undefined' && typeof endTime !== 'undefined' &&
        startTime !== null && endTime !== null &&
        !isNaN(startTime) && !isNaN(endTime)) {
        if (startTime === endTime) {
            return "0.0";
        } else {
            let diff = roundMinutes((endTime - startTime) / 60000);
            return diff + (diff % 1 === 0 ? ".0 " : "");
        }
    } else {
        return "-";
    }
}