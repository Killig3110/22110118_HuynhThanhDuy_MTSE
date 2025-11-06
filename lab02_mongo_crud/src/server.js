require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const homeController = require("./controllers/home.controller");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Serve static files (uploaded images, CSS, etc.) from /public
app.use(express.static("public"));

app.use("/users", userRoutes);

// Home route handled by controller
app.get("/", homeController.index);

connectDB();
app.listen(process.env.PORT, () =>
    console.log(`Server running on http://localhost:${process.env.PORT}`)
);
