const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const BASE_URL = process.env.BASE_URL;

const app = express();
app.use(express.json());
app.use(cors());

require("dotenv").config();
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.witeqrj.mongodb.net/users`;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(`Error connecting to the database:\n${err}`);
  });

// Schema for users of the app
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    link: {
      type: String,
    },
    topic: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);
const User = mongoose.model("users", UserSchema);
User.createIndexes();

// Express routes
app.get("/", (req, res) => {
  res.send("App is working");
});

app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    if (result) {
      delete result.password;
      res.send(req.body);
      console.log(result);
    } else {
      console.log("User already registered");
    }
  } catch (e) {
    res.send("Something went wrong");
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Something went wrong");
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = BASE_URL;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
