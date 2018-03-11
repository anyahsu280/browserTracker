(function () {
  //how many sites displayed and how many days to consider
  var numberOfViews = 5;
  var days = 1;
  var server = "http://localhost:8080";

 //takes in string json object and boolean - to clear or not
  display = function (data, clearVal) {
    var json = JSON.parse(data);
    var old_tbody = document.getElementById("stats_tbody");
    var tbody = document.createElement("tbody");
    tbody.setAttribute("id", "stats_tbody");
    var table = document.getElementById("stats");
    table.removeChild(old_tbody);
    table.appendChild(tbody);
    if (!clearVal) {
      for (var key in json) {
        var item = json[key];
        row = addRow(item["URL"], item["totalTime"], item["pageVisits"]);
        tbody.appendChild(row);
      }
    }
  }
  // take in image, and url, time and visits as string, returns a row object
  addRow = function (url, time, visits) {
    var row = document.createElement("tr");
    row.appendChild(urlCell(url));
    row.appendChild(getCell(time));
    row.appendChild(getCell(visits));
    return row;
  }
  //returns cell with url, url opens in new tab
  urlCell = function (url) {
    var urlcell = document.createElement("td");
    var cite = document.createElement('a');
    cite.appendChild(document.createTextNode(url));
    cite.title = "Open link";
    cite.href = url;
    cite.target = "_blank";
    urlcell.appendChild(cite);
    return urlcell;
  }
  //return cell with string val
  getCell = function (val) {
    cell = document.createElement("td");
    cell.appendChild(document.createTextNode(val));
    return cell;
  }
  //gets websites that are stored in the database
  getWebsites = function () {
    //not sure what to do with days
    var val = "/topSites?sites=" + numberOfViews + "&dateRange=" + days + "&currentDate="+Date.now();
    RequestDatabase(val);
  }
  //respose for submit number of websites to show -> create new display
  doSubmit = function () {
    var x = document.getElementById("views").value;
    if (x < 1 || x > 20) {
      x = 10;
      alert("number has to be larger than 0 and smaller than 21");
    }
    numberOfViews = x;
    getWebsites();
  }
  //get request database and display data
  RequestDatabase = function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", server + url);
    xhr.onload = function () {
      display(xhr.response, false);
    }
    xhr.send();
  }
  //clear out database and display no data
  clear = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", server + "/reset");
    xhr.onload = function () {
      display(null, true);
    }
    xhr.send();
  }
  //set up buttons and initial view
  document.addEventListener('DOMContentLoaded', function () {
    var resetButton = document.getElementById('reset');
    resetButton.onclick = function () {
      clear();
    };
    //deal with radio buttons
    var radios = document.forms["days"].elements["time"];
    for (radio in radios) {
      radios[radio].onclick = function () {
        days = this.value;
        getWebsites();
      }
    };

    var change = document.getElementById('change');
    change.onclick = doSubmit;
    doSubmit();
  }, false);
})();
