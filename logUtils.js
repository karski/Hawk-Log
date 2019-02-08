// collection of functions that are not bound to a specific page or component that are useful across several areas of the log

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