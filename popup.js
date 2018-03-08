
document.addEventListener('DOMContentLoaded', function() {
    // --- Send request example: ---
    let server = "http://localhost:8080";
    let resetButton = document.getElementById('reset');
    resetButton.onclick = function(){
      clear();
    };
     //deal with radio buttons
    let radios = document.forms["days"].elements["time"];
    for(radio in radios) {
      radios[radio].onclick = function() {
        getsites(this.value);
      }
    };
    getsites =  function(days){
      //not sure what to do with days
      let val = "/topSites?sites=10&dateRange=1&currentDate=";
      getRequestVal(val);
    }
    
    

     //get the site values. input string
    getRequestVal = function(val){
      let xhr = new XMLHttpRequest();
        //using a hardcoded URL here, need to populate these parameters with values from popup's inputs
        xhr.open("GET", server + val + Date.now());
        xhr.onload = function() {
           display(xhr.response);
        }
        xhr.send();
    }
    clear = function(){
      let xhr = new XMLHttpRequest();
              xhr.open("POST", server + "/reset");
              xhr.onload = function() {
                 display(xhr.response);
              }
              xhr.send();
    }

}, false);
    display = function(data, clearVal){
        let old_tbody = document.getElementById("stats_tbody");
        let tbody = document.createElement("tbody");
        tbody.setAttribute("id", "stats_tbody");
        old_tbody.parentNode.replaceChild(tbody, old_tbody);
        if(!clearVal){        
        for (var key in data) {
          var item = data[key];
          row = addRow(item["URL"], item["totalTime"], item["pageVisits"]); 
          tbody.appendChild(row);         
        }
      }

    }
    //returns row
    addRow = function(url, time, visits){
     let  row = document.createElement("tr");
      row.appendChild(urlCell(url));
      row.appendChild(cell(time));
      row.appendChild(cell(visits));
      return row;
    }
      urlCell = function(url){
      let urlcell = document.createElement("td");
      var cite = document.createElement('a');
      cite.appendChild(document.createTextNode(url));
      cite.title = "Open link";
      cite.href = url;
      cite.target = "_blank";
      urlcell.appendChild(cite);
      return urlcell;
    }
    cell = function(val){
      cell = document.createElement("td");
      cell.appendChild(document.createTextNode(val));
      return cell;
    }

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