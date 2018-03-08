
document.addEventListener('DOMContentLoaded', function() {
    // --- Send request example: ---
    var server = "http://localhost:8080";
    let resetButton = document.getElementById('reset');
    resetButton.onclick = function(){
      alert("cleared History");
    };
     //deal with radio buttons
    let radios = document.forms["days"].elements["time"];
    for(radio in radios) {
      radios[radio].onclick = function() {
          alert(this.value);
          //call getsites
      }
    };
    getsites =  function(){
      let val = "/topSites?sites=5&dateRange=1&currentDate=";
      getRequestVal(val);
    }
    
    

     //get the site values. input string
    getRequestVal = function(val){
      var xhr = new XMLHttpRequest();
        //using a hardcoded URL here, need to populate these parameters with values from popup's inputs
        xhr.open("GET", server + val + Date.now());
        xhr.onload = function() {
           alert(xhr.response);
        }
        xhr.send();
    }
    clear = function(){
      var xhr = new XMLHttpRequest();
              xhr.open("POST", server + "/reset");
              xhr.onload = function() {
                 alert(xhr.response);
              }
              xhr.send();
    }

}, false);

  // var testButton = document.getElementById('test');
  //     var resetButton = document.getElementById('reset');
  //     var response = document.getElementById('response');
  //     testButton.addEventListener('click', function(event) {
  //         var xhr = new XMLHttpRequest();
  //         //using a hardcoded URL here, need to populate these parameters with values from popup's inputs
  //         xhr.open("GET", server + "/topSites?sites=5&dateRange=1&currentDate=" + Date.now());
  //         xhr.onload = function() {
  //             response.innerHTML = xhr.response;
  //         }
  //         xhr.send();
  //     });
  //     resetButton.addEventListener('click', function(event) {
  //         var xhr = new XMLHttpRequest();
  //         xhr.open("POST", server + "/reset");
  //         xhr.onload = function() {
  //             response.innerHTML = xhr.response;
  //         }
  //         xhr.send();
  //     });