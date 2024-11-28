const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const shortid = require("shortid");
require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB / Mongoose config
const Schema = mongoose.Schema;
const urlInfoSchema = new Schema({
  original_url: { type: "string", required: true },
  short_url: { type: "string", required: true },
});
const UrlInfo = mongoose.model("url", urlInfoSchema);
connect_to_db();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

function connect_to_db() {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const create_and_save_url = (url_info = {}) => {
  let url_model = new UrlInfo({
    original_url: url_info.original_url,
    short_url: url_info.short_url,
  });
  url_model.save((err, data) => {
    if (err) return console.error(err);
  });
};

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
        var url = {
          original_url: req.body.url,
          short_url: shortid.generate(),
        };
        create_and_save_url(url);
        res.json(url);
      }
    });
  } catch (err) {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  UrlInfo.findOne({ short_url: req.params.short_url }, function (err, data) {
    if (err) return console.error(err);
    if (data && data.original_url) res.redirect(data.original_url);
  });
});

// Listen to Port
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});