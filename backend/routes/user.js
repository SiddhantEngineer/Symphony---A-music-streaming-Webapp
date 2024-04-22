const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const UserDB = require("../db/user");
UserDB.Init(mongoose);

router.use(bodyParser.json());
router.use(cookieParser());

//check if user has already logged in once and stored data in cookies
router.get("/cookielogin", (req, res) => {
  if (req.cookies.userID) {
    res.end(req.cookies.userID);
  } else {
    res.end("NO");
  }
});

//login procedure
router.post("/login", async (req, res) => {
  console.log("GOT REQ");
  console.log(req.body);
  if (req.body.name == "") {
    //if user is using email for login
    await UserDB.LoginEmail(req.body.email, toHash(req.body.password)).then(
      (data) => {
        if (data.isValid) {
          //setup cookie for future logins
          res.cookie("userID", data.userID, {
            maxAge: 5000000,
            httpOnly: true,
          });
        }
        res.json(data);
      }
    );
  } else {
    //if user is using name for login
    await UserDB.LoginUsername(req.body.name, toHash(req.body.password)).then(
      (data) => {
        console.log(req.body.name);
        if (data.isValid) {
          //setup cookie for future logins
          res.cookie("userID", data.userID, {
            maxAge: 5000000,
            httpOnly: true,
          });
        }
        res.json(data);
      }
    );
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("userID");
  res.end();
});

function toHash(string) {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  return hash.digest("hex");
}

module.exports = router;