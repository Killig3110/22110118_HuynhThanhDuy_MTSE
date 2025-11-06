const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// READ
router.get("/", userController.getUsers);

// CREATE
router.get("/add", userController.addForm);
router.post("/add", userController.createUser);

// UPDATE
router.get("/edit/:id", userController.editForm);
router.post("/update/:id", userController.updateUser);

// DELETE
router.get("/delete/:id", userController.deleteUser);

module.exports = router;
