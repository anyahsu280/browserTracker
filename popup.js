var numberOfViews = 10;

    display = function(data, clearVal){
      alert("here");
      var pr = '[{"ranking" :1,"URL" : "www.facebook.com","totalTime": "00:44:30","pageVisits" : 37}, {"ranking" :1,"URL" : "www.facebook.com","totalTime": "00:44:30","pageVisits" : 37}]';
      alert(pr);
      var json = JSON.parse(pr);
      alert(json);
        var old_tbody = document.getElementById("stats_tbody");
        var tbody = document.createElement("tbody");
        tbody.setAttribute("id", "stats_tbody");
        var table = document.getElementById("stats");
        if(!old_tbody){
          alert("it's null");
        }
        table.removeChild(old_tbody);
        table.appendChild(tbody);
        if(!clearVal){        
        for (var key in json) {
          var item = json[key];
          alert(item);
          row = addRow(item["URL"], item["totalTime"], item["pageVisits"]); 
          tbody.appendChild(row);         
        }
      }

    }
    //returns row
    addRow = function(url, time, visits){
     var  row = document.createElement("tr");
      row.appendChild(urlCell(url));
      row.appendChild(getCell(time));
      row.appendChild(getCell(visits));
      return row;
    }
      urlCell = function(url){
      var urlcell = document.createElement("td");
      var cite = document.createElement('a');
      cite.appendChild(document.createTextNode(url));
      cite.title = "Open link";
      cite.href = url;
      cite.target = "_blank";
      urlcell.appendChild(cite);
      return urlcell;
    }
    getCell = function(val){
      cell = document.createElement("td");
      cell.appendChild(document.createTextNode(val));
      return cell;
    }
    document.addEventListener('DOMContentLoaded', function() {
      // --- Send request example: ---
      var server = "http://localhost:8080";
      var resetButton = document.getElementById('reset');
      resetButton.onclick = function(){
        clear();
      };
       //deal with radio buttons
      var radios = document.forms["days"].elements["time"];
      for(radio in radios) {
        radios[radio].onclick = function() {
          getsites(this.value);
        }
      };
      getsites =  function(days){
        //not sure what to do with days
        var val = "/topSites?sites=10&dateRange=1&currentDate=";
        getRequestVal(val);
      }
      
      doSubmit = function(){
        var x = document.getElementById("views").value;
        if(x < 1 || x>20){
          x = 10;
          alert("number has to be larger than zero and smaller than 21");
        }
        numberOfViews = x;
      }
  
       //get the site values. input string
      getRequestVal = function(val){
        var xhr = new XMLHttpRequest();
          //using a hardcoded URL here, need to populate these parameters with values from popup's inputs
          xhr.open("GET", server + val + Date.now());
          xhr.onload = function() {
             display(xhr.response);
          }
          xhr.send();
      }
      clear = function(){
        var xhr = new XMLHttpRequest();
                xhr.open("POST", server + "/reset");
                xhr.onload = function() {
                   display(xhr.response);
                }
                xhr.send();
      }
  
      display(null, false);
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