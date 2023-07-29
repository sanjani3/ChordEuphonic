const http = require("http");
const express = require("express");
const path = require("path");
const app = express();
const request = require("request");
const querystring = require("querystring");
const FieldValue = require("firebase-admin").firestore.FieldValue;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");
const { name } = require("ejs");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/loginSubmit", (req, res) => {
   username = req.query.email;
   password = req.query.password;
  db.collection("users")
    .where("username", "==", username)
    .where("password", "==", password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        var userData = [];
        db.collection("users")
          .get()
          .then((docs) => {
            docs.forEach((doc) => {
              userData.push(doc.data());
            });
          })
          .then(() => {
            res.render("dashboard");
          });
      } else {
        res.send(
          '<center><h1 style="padding-top: 50px;">LOGIN FAILED</h1> <h1>Enter correct credentials</h1><br><h2>OR</h2><br><h1>If not registered </h1><a href = "/signup"><h2>Register Here</h2></a></center>'
        );
      }
    });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signupSubmit", (req, res) => {
  const username = req.query.email;
  const password = req.query.password;
  const confirmpwd = req.query.confirmpwd;
  const name = req.query.usrname;
  const dob = req.query.dob;
  if (password === confirmpwd) {
    db.collection("users")
      .add({
        name: name,
        username: username,
        password: password,
        confirmpwd: confirmpwd,
        name: username,
        dob: dob,
      })
      .then(() => {
        res.render("login");
      });
  } else {
    res.send(
      '<center><h1 style="padding-top: 20%">PASSWORD AND CONFIRMED PASSWORD SHOULD BE SAME</h1></center>'
    );
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/musicSubmit", (req, res) => {
  const m = req.query.music;
  var link = "https://www.youtube.com/results?search_query=" + m;
  res.render("music", { link: link });
  db.collection("searches").add({
    email: username,
    search: m,
    searchLink: link,
  });
});

app.get("/recent", (req, res) => {
  db.collection("searches")
    .where("email", "==", username)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        var searchData = [];
        db.collection("searches")
          .get()
          .then((docs) => {
            docs.forEach((doc) => {
              searchData.push(doc.data());
            });
          })
          .then(() => {
            res.render("recent", {SearchData: searchData });
          });
      } else {
        res.send(
          '<center><h1 style="padding-top: 50px; ">NO RECENTS</h1><br></center>'
        );
      }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
