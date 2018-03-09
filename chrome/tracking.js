var server = 'http://localhost:8080';

function log(url){
    var data = JSON.stringify({
        url: url,
        time: Date.now()
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", server + "/log");
    xhr.send(data);
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.status === "complete" && tab.active) {
            chrome.windows.get(tab.windowId, {populate: false}, function(window) {
                if (window.focused) {
                    log(tab.url);
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.windows.get(tab.windowId, {populate: false}, function(window) {
            if (window.focused) {
                log(tab.url);
            }
        });
    }
});

//TODO: send end times at appropriate times

// chrome.windows.onFocusChanged.addListener(function (windowId) {
//     if (windowId == chrome.windows.WINDOW_ID_NONE) {
//         //send end time for current record
//         log(null, null, null);
//     } else {
//         //new record
//         chrome.windows.get(windowId, {populate: true}, function(window) {
//             if (window.focused) {
//                 chrome.tabs.query({active: true, windowId: windowId}, function (tabs) {
//                     if (tabs[0].status === "complete") {
//                         log(tabs[0].url, tabs[0].title, tabs[0].favIconUrl || null);
//                     }
//                 });
//             }
//         });
//     }
// });