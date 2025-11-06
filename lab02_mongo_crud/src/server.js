require("dotenv").config();
const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const homeController = require("./controllers/home.controller");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Serve static files (CSS, client assets) from /public if exists
app.use(express.static("public"));

// Serve uploads from configurable directory and URL prefix
const uploadUrl = process.env.UPLOAD_URL || '/uploads';
let uploadDir = process.env.UPLOAD_DIR || 'public/uploads';
if (!path.isAbsolute(uploadDir)) {
    // resolve relative to project root
    uploadDir = path.join(process.cwd(), uploadDir);
}
app.use(uploadUrl, express.static(uploadDir));

app.use("/users", userRoutes);

// Home route handled by controller
app.get("/", homeController.index);

connectDB();
app.listen(process.env.PORT, () =>
    console.log(`Server running on http://localhost:${process.env.PORT}`)
);
