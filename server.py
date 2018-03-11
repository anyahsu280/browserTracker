from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
import sqlite3
import operator
millisecondsPerDay = 86400000

# Connection Info
server = 'localhost'
port = 8080
database = 'browserTracker.db'

# SQL Queries
create = '''CREATE TABLE IF NOT EXISTS History (
                    URL TEXT NOT NULL,
                    StartTime TEXT NOT NULL,
                    EndTime TEXT
            );'''
insert = 'INSERT INTO History values (?, ?, ?)'
getLastInsertID = 'SELECT last_insert_rowid();'
update = '''UPDATE History
            SET EndTime = ?
            WHERE rowid = ?'''
getAll = 'SELECT * FROM History'
getRowID = '''SELECT rowid FROM History
              WHERE URL = ?
              ORDER BY StartTime DESC'''
getTopSites = '''SELECT * FROM History
                 WHERE StartTime > ?'''
drop = 'DROP TABLE History'

# array of base URLs to ignore
ignoreBaseURLs = ['newtab']

def millisecondsToHoursMinutesSecondsString(milliseconds):
    seconds = (milliseconds/1000) % 60
    seconds = int(seconds)
    seconds = "0" + str(seconds) if seconds < 10 else str(seconds)
    minutes = (milliseconds/(1000*60)) % 60
    minutes = int(minutes)
    minutes = "0" + str(minutes) if minutes < 10 else str(minutes)
    hours = (milliseconds/(1000*60*60)) % 24
    hours = int(hours)
    hours = "0" + str(hours) if hours < 10 else str(hours)
    return "%s:%s:%s" % (hours, minutes, seconds)

# get top X sites from the sqlite cursor
def getTopX(sites, cursor):
    topBaseURLsByTime = {}
    baseURLPageVisits = {}

    for row in cursor:
        baseURL = str(urlparse(row[0])[1])
        time = int(row[2]) - int(row[1])
        if baseURL not in ignoreBaseURLs:
            if baseURL not in topBaseURLsByTime:
                topBaseURLsByTime[baseURL] = 0
                baseURLPageVisits[baseURL] = 0
            topBaseURLsByTime[baseURL] += time
            baseURLPageVisits[baseURL] += 1

    topBaseURLsByTime = sorted(list(topBaseURLsByTime.items()), key=operator.itemgetter(1), reverse=True)

    # convert only top X sites into response payload
    topX = []
    for i in range(sites if sites <= len(topBaseURLsByTime) else len(topBaseURLsByTime)):
        topX.append({
            "URL" : topBaseURLsByTime[i][0],
            "totalTime" : millisecondsToHoursMinutesSecondsString(topBaseURLsByTime[i][1]),
            "pageVisits" : baseURLPageVisits[topBaseURLsByTime[i][0]]
        })
    return json.dumps(topX)

# request handler
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        response = ""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == "/all": # /all is for testing purposes only
            response = json.dumps(self.con.execute(getAll).fetchall())
        elif self.path.startswith("/topSites"):
            data = parse_qs(self.path.split('?')[1])
            today = data['currentDate'][0]
            startDate = int(today) - (int(data['dateRange'][0]) * millisecondsPerDay)
            input = (str(startDate),)
            response = self.con.execute(getTopSites, input)
            response = getTopX(int(data['sites'][0]), response)
        elif self.path == "/reset": #drops and recreates table
            self.con.execute(drop)
            self.con.execute(create)
            response = "Reset history."

        self.wfile.write(response.encode())
        self.con.commit()
        return

    def do_POST(self):
        response = ""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(length).decode("utf-8")) if self.path != "/reset" else ""

        if self.path == "/log": # log page visit
            self.con.execute(insert, (data["url"], data["time"], data["time"]))
            response = json.dumps({
                "siteRecordID" : self.con.execute(getLastInsertID).fetchone()[0]
            })
        elif self.path == "/recordID":
            response = json.dumps({
                "siteRecordID" : self.con.execute(getRowID, (data["url"],)).fetchone()[0]
            })
        elif self.path == "/update":
            self.con.execute(update, (data["time"], data["siteRecordID"]))
        elif self.path == "/reset": #drops and recreates table
            self.con.execute(drop)
            self.con.execute(create)
            response = "Reset history."

        self.wfile.write(response.encode())
        self.con.commit()
        return

if __name__ == "__main__":
    connection = sqlite3.connect(database)
    with connection as con:
        Handler.con = con
        con.execute(create)
        server = HTTPServer((server, port), Handler)
        server.serve_forever()
