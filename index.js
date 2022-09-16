const express = require("express");
const app = express();
const path = require("path");
const readLastLines = require("read-last-lines");

// open the file /data/wallofshame.log for reading
const fs = require("fs");

// get path from environment variable
const logPath = process.env.DATA_PATH || "wallofshame.log";

// get port from environment variable
const port = process.env.PORT || 8080;

var lines = [];

// every night at 12:00 AM delete the log file
var CronJob = require("cron").CronJob;
new CronJob(
  "0 0 0 * * *",
  function () {
    fs.unlinkSync(logPath);
    lines = [];
  },
  null,
  true,
  "America/Los_Angeles"
);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/latest", function (req, res, next) {
  // clear lines array
  output_lines = [];

  // read the last 40 lines from the file and split contents by newline
  readLastLines.read(logPath, 40).then((lines) => {
    // split lines by cross platform newline
    lines = lines.split(/\r?\n/);

    lines.forEach(function (line) {
      // check if line contains ACCEPT
      if (line.includes("ACCEPT")) {
        // add to lines array
        output_lines.unshift(line);
      }
    });

    // build html list from lines
    var html = "<ul>";
    output_lines.forEach(function (line) {
      // split by space
      var parts = line.split(" ");

      // get the first part
      var timestamp = parts[0];
      // convert unix timestamp to human readable
      var date = new Date(timestamp);
      var date_str = date.toUTCString();

      // get ip
      var ip = parts[2];
      // remove first 12 characters
      ip = ip.substring(12);

      html += `<li><span class="timestamp">${date_str}</span> <span class="ip">${ip}</span><br><span class="message">Bot was banished to endless torment in the SSH pit of shame.</span></li>`;
    });
    html += "</ul>";
    res.send(html);
    next();
  });
});

app.listen(port, () => {
  console.log(`Wall of Shame listening on port ${port}`);
});
