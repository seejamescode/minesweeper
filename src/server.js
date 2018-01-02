import compression from "compression";
import ensure from "connect-ensure-login";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import passport from "passport";
import path from "path";
import request from "request";
import session from "express-session";
const Strategy = require("passport-twitter").Strategy;

let keys;
if (process.env.NODE_ENV === "production") {
  keys = require("./.env.prod.json");
} else {
  keys = require("../.env.local.json");

  const os = require("os");
  const ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function(ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function(iface) {
      if ("IPv4" !== iface.family || iface.internal !== false) {
        return;
      }

      if (alias >= 1) {
        console.log(ifname + ":" + alias, iface.address);
      } else {
        console.log(`Access at http://${iface.address}:${port}`);
      }
      ++alias;
    });
  });
}

const app = express();
const port = process.env.PORT || 8080;
app.use(compression());
app.use(
  session({
    secret: keys.secret,
    resave: true,
    saveUninitialized: true
  })
);
app.enable("trust proxy");

passport.use(
  new Strategy(
    {
      consumerKey: keys["twitter-key"],
      consumerSecret: keys["twitter-secret"],
      callbackURL: `${keys["twitter-callback"]}/twitter/return`,
      passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(keys.mlab);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const Schema = mongoose.Schema;
const ScoreModelSchema = new Schema({
  date: Date,
  level: Number,
  name: String,
  picture: String,
  score: Number,
  time: Number,
  twitter: String
});
ScoreModelSchema.plugin(mongoosePaginate);
const ScoreModel = mongoose.model("Scores", ScoreModelSchema);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.secure || req.headers.host === `localhost:${port}`) {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}

app.get("/scores/:level/:page", (req, res) => {
  const level = isNaN(req.params.level) ? 1 : req.params.level;
  const page = isNaN(req.params.page) ? 1 : req.params.page;

  ScoreModel.paginate(
    {
      level: { $gte: level }
    },
    { limit: 10, page, sort: { time: "ascending" } },
    function(err, result) {
      res.send(result);
    }
  );
});

app.get("/login/:level/:time", function(req, res, next) {
  req.session.state = req.params;
  passport.authenticate("twitter")(req, res, next);
});

app.get(
  "/twitter/return",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function(req, res) {
    const newScore = new ScoreModel({
      date: Date.now(),
      level: parseInt(req.session.state.level),
      name: req.user.username,
      picture: req.user.photos[0].value,
      time: parseInt(req.session.state.time)
    });
    newScore.save(function(err) {
      if (err) return handleError(err);
    });
    const redirect =
      req.headers.host === `localhost:${port}` ? `http://localhost:3000` : "/";
    res.redirect(`${redirect}?submittedFor=${req.session.state.level}`);
  }
);

app.use(express.static("./build"));

app.listen(port, err => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`App and API is live at http://localhost:${port}`);
});
