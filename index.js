const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const shortid = require("shortid");
require("dotenv").config();

// Basic Configuration
const port = process.env.PORT || 3000;
var url_data;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

// API Requests

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function (req, res) {
  try {
    var hostname = new URL(req.body.url).hostname;
    dns.lookup(hostname, function (err) {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        url_data = {
          original_url: req.body.url,
          short_url: shortid.generate(),
        };
        res.json(url_data);
      }
    });
  } catch (err) {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  if (req.params.short_url == url_data.short_url) {
    res.redirect(url_data.original_url);
  }
});

// Listen to Port

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});