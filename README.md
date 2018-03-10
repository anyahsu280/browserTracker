# BrowserTracker
## About
This is a simple Chrome extension that tracks a user's page visits and total time on a page, and is able to produce a report about the user's top sites by total time. `tracker.js` runs in the background to record page information and send it to a Python server, which stores the data in a SQLite database. The popup accessible through the extension's browser action allows the user to request different numbers of top sites over a variety of time ranges.

## Setup
1. Download repository
2. Install `python`
3. Install extension:
    1. Navigate to `chrome://extensions` in chrome
    2. Check the "Developer mode" checkbox, so that the "Load unpacked extension..." option appears
    3. Either use the "Load unpacked extension..." to select and load the `browserTracker/chrome` directory
4. In the command line, navigate to this project's root folder and start the server: `$ python server.py`
    - This server uses `localhost:8080` -- if you need to change the port or server address, it needs to be changed in `server.py`, `chrome/popup.js`, and `chrome/config.js`.
5. Start accessing different pages/tabs in Chrome, and the command line window should be logging basic info about the requests coming in if it is working correctly.

## Acknowledgements
The tracking and server code is based on GitHub user Thibauth's [browsing-activity-tracker](https://github.com/Thibauth/browsing-activity-tracker). The code for keeping track of the total time on a page borrows from GitHub user navjagpal's [browser-timetracker](https://github.com/navjagpal/browser-timetracker).
