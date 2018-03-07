
document.addEventListener('DOMContentLoaded', function() {
    // --- Send request example: ---
    var server = "http://localhost:8080";

    var testButton = document.getElementById('test');
    var resetButton = document.getElementById('reset');
    var response = document.getElementById('response');
    testButton.addEventListener('click', function(event) {
        var xhr = new XMLHttpRequest();
        //using a hardcoded URL here, need to populate these parameters with values from popup's inputs
        xhr.open("GET", server + "/topSites?sites=5&dateRange=1&currentDate=" + Date.now());
        xhr.onload = function() {
            response.innerHTML = xhr.response;
        }
        xhr.send();
    });
    resetButton.addEventListener('click', function(event) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", server + "/reset");
        xhr.onload = function() {
            response.innerHTML = xhr.response;
        }
        xhr.send();
    });
}, false);