const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/user.controller");

// Configure multer storage using UPLOAD_DIR from environment (resolved relative to project root)
const envUploadDir = process.env.UPLOAD_DIR || 'public/uploads';
const resolvedUploadDir = path.isAbsolute(envUploadDir) ? envUploadDir : path.join(process.cwd(), envUploadDir);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, resolvedUploadDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const upload = multer({ storage });

// READ
router.get("/", userController.getUsers);

// CREATE
router.get("/add", userController.addForm);
router.post("/add", upload.single('image'), userController.createUser);

// UPDATE
router.get("/edit/:id", userController.editForm);
router.post("/update/:id", upload.single('image'), userController.updateUser);

// DELETE
router.get("/delete/:id", userController.deleteUser);

module.exports = router;
