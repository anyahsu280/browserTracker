from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta
from urlparse import urlparse, parse_qs
import sqlite3
import operator

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
# update = '' TODO
getAll = 'SELECT * FROM History'
getRowID = '''SELECT rowid FROM History
              WHERE URL = ?
              ORDER BY StartTime DESC'''
getTopSites = '''SELECT URL FROM History
                 WHERE StartTime > ?'''
drop = 'DROP TABLE History'

# array of base URLs to ignore
ignoreBaseURLS = ['newtab']

# get top X sites from the sqlite cursor
def getTopX(sites, cursor):
    topURLs = {}

    # iterate through rows, counting instances of each base URL
    for row in cursor:
        baseURL = str(urlparse(row[0])[1])
        if baseURL not in ignoreBaseURLS:
            if not topURLs.has_key(baseURL):
                topURLs[baseURL] = 0;
            topURLs[baseURL] += 1;

    # sort topURLs by pageVisits in descending order
    topURLs = sorted(topURLs.items(), key=operator.itemgetter(1), reverse=True)

    # convert only top X sites into response payload
    topX = []
    for i in range(sites):
        topX.append({
            "ranking" : i + 1,
            "URL" : topURLs[i][0],
            "totalTime" : None, #need to implement
            "pageVisits" : topURLs[i][1]
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
            response = self.con.execute(getAll).fetchall();
        elif self.path.startswith("/topSites"):
            data = parse_qs(self.path.split('?')[1]);
            today = datetime.utcfromtimestamp(int(data['currentDate'][0]) / 1000.)
            startDate = today - timedelta(days=int(data['dateRange'][0]))
            input = (str(startDate),)
            response = self.con.execute(getTopSites, input)
            response = getTopX(int(data['sites'][0]), response)

        self.wfile.write(response)
        self.con.commit()
        return

    def do_POST(self):
        response = ""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == "/log": # log page visit
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length))
            time = datetime.utcfromtimestamp(data["time"] / 1000.)
            self.con.execute(insert, (data["url"], time, ""));
            response = json.dumps({
                "siteRecordID" : self.con.execute(getLastInsertID).fetchone()[0]
            })
        elif self.path == "/recordID":
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length))
            response = json.dumps({
                "siteRecordID" : self.con.execute(getRowID, (data["url"],)).fetchone()[0]
            })
        #elif self.path == "/update" TODO
        elif self.path == "/reset": #drops and recreates table
            self.con.execute(drop)
            self.con.execute(create)
            response = "Reset history."

        self.wfile.write(response);
        self.con.commit()
        return

if __name__ == "__main__":
    connection = sqlite3.connect(database)
    with connection as con:
        Handler.con = con
        con.execute(create)
        server = HTTPServer((server, port), Handler)
        server.serve_forever()
