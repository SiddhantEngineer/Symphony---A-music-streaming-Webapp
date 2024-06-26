const mongoose = require("mongoose");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const UserDB = require("./db/user");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const adminRoute = require("./routes/admin");

//mongo db setup
const uri =
  "mongodb+srv://qqqqqq:qqqqqq@cluster0.fcdv1mo.mongodb.net/symphony?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    console.log("WAITING FOR CONNECTIOn");
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    await UserDB.Init(mongoose);
    // UserDB.AddUser("123", "123@gmail.com", toHash("123"));
  } catch (err) {
    console.log("ERROR in connection", err);
  }
}

run();

const app = express();
const PORT = 5000;

//some security related things
//i dont know what this is but without this cookies not working
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

// const upload = multer();
app.use(multer().any());
app.use(express.static("./public"));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use("/login", bodyParser.json());
app.use(cookieParser());

//check if user has already logged in once and stored data in cookies
app.get("/cookielogin", (req, res) => {
  if (req.cookies.userID) {
    res.end(req.cookies.userID);
  } else {
    res.end("NO");
  }
});

//login procedure
app.post("/login", async (req, res) => {
  console.log("GOT REQ");
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

app.get("/logout", (req, res) => {
  res.clearCookie("userID");
  res.end();
});

app.use("/admin", adminRoute);

app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});

//implemented some cryptography methods to securely store passwords
function toHash(string) {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  return hash.digest("hex");
}

process.on("SIGINT", async () => {
  console.log("Received SIGINT signal. Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM signal. Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
  process.exit(0);
});
