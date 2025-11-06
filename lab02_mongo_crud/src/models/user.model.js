const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: String,
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },
});

module.exports = mongoose.model("User", userSchema);
