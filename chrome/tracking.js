var config = config();
var current = {
    siteRecordID: null,
    tabURL: null
}

// --- Data Update Functions ---------------------------------------------------
// logs initial page visit, with initial start time
function log(url){
    var deferred = new $.Deferred();

    //this check handles two cases:
    // - window was unfocused, user clicks tab in window; windows.onFocusChanged
    //   is fired, followed by tabs.onActivated. This check prevents the
    //   tabs.onActivated event listener from re-logging the current page
    // - window was unfocused, user clicks on window element (not on tab), and
    //   then later clicks on the current tab; events would occur in the same
    //   order as the above case, and this prevents the tabs.onActivated event
    //   listener from re-logging the current page
    if (url == current.tabURL) return deferred.reject();
    current.tabURL = url;

    var data = JSON.stringify({
        url: url,
        time: Date.now()
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", config.server + "/log");
    xhr.onload = function() {
        deferred.resolve(JSON.parse(xhr.response).siteRecordID);
    }
    xhr.send(data);

    return deferred.promise();
}

//sends updated "end" time for current.siteRecordID, if current.siteRecordID is not null
function updateTime(siteRecordID) {
    if (!current.siteRecordID) return;

    var data = JSON.stringify({
        siteRecordID: siteRecordID,
        time: Date.now()
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", config.server + "/update");
    xhr.send(data);
}

//updates time for previous siteRecordID, then updates current.siteRecordID to current siteRecordID
function updatePreviousAndSwitchToCurrent(siteRecordID) {
    updateTime(current.siteRecordID); //aka send current time to server
    current.siteRecordID = siteRecordID || null;
};

//updates with current tab -- used if current tab url isn't straightforward to
//determine in the context that this function is being called from
function updateTimeWithCurrentTab() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        if (tabs.length == 1) {
            var url = tabs[0].url;
            var data = JSON.stringify({ url: url,});
            var xhr = new XMLHttpRequest();

            //use POST because I didn't want to send url as parameter in request url
            xhr.open("POST", config.server + "/recordID");
            xhr.onload = function() {
                updatePreviousAndSwitchToCurrent(JSON.parse(xhr.response).siteRecordID);
            }
            xhr.send(data);
        }
    });
};

// --- Event Listeners ---------------------------------------------------------
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.status === "complete" && tab.active) {
            chrome.windows.get(tab.windowId, {populate: false}, function(window) {
                if (window.focused) {
                    log(tab.url).done(updatePreviousAndSwitchToCurrent);
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.windows.get(tab.windowId, {populate: false}, function(window) {
            if (window.focused) {
                log(tab.url).done(updatePreviousAndSwitchToCurrent);
            }
        });
    }
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        //send end time for current record
        updatePreviousAndSwitchToCurrent(null);
    } else {
        //new record
        chrome.windows.get(windowId, {populate: true}, function(window) {
            if (window.focused) {
                chrome.tabs.query({active: true, windowId: windowId}, function (tabs) {
                    if (tabs[0].status === "complete") {
                        log(tabs[0].url).done(updatePreviousAndSwitchToCurrent);
                    }
                });
            }
        });
    }
});

chrome.idle.onStateChanged.addListener(function(idleState) {
    if (idleState == "locked") {
        updatePreviousAndSwitchToCurrent(null);
    }
});

// --- Update At Intervals -----------------------------------------------------
setInterval(function() {
    chrome.windows.getCurrent(function(window) {
        if (window.focused) {
            updateTimeWithCurrentTab();
        } else {
            updatePreviousAndSwitchToCurrent(null);
        }
    });
}, config.updateTimeSeconds * 1000);
