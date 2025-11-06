const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: { type: String },
        phoneNumber: { type: String },
        gender: { type: Boolean, default: true }, // true = male, false = female
        image: { type: String }, // lưu link ảnh (Cloudinary, base64,...)
        roleId: { type: String, default: "R1" },
        positionId: { type: String, default: "P0" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
