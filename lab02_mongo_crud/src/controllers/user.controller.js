const userService = require("../services/user.service");
const Role = require("../models/role.model");
const Position = require("../models/position.model");
const path = require('path');

exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUser();
        res.render("users/list", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi lấy danh sách người dùng");
    }
};

// Hiển thị form thêm
exports.addForm = async (req, res) => {
    try {
        const roles = await Role.find({}).lean();
        const positions = await Position.find({}).lean();
        res.render("users/create", { roles, positions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tải form');
    }
};

// Thêm user
exports.createUser = async (req, res) => {
    try {
        const data = { ...req.body };
        // If an image file was uploaded, store its public path
        if (req.file) {
            // public folder is served statically, save path relative to /public
            data.image = `/uploads/${req.file.filename}`;
        }
        await userService.createNewUser(data);
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi tạo người dùng");
    }
};

// Hiển thị form sửa
exports.editForm = async (req, res) => {
    try {
        const user = await userService.getUserInfoById(req.params.id);
        if (!user) return res.status(404).send("Người dùng không tồn tại");
        const roles = await Role.find({}).lean();
        const positions = await Position.find({}).lean();
        res.render("users/update", { user, roles, positions });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi lấy thông tin người dùng");
    }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
    try {
        const data = { id: req.params.id, ...req.body };
        if (req.file) {
            data.image = `/uploads/${req.file.filename}`;
        }
        await userService.updateUser(data);
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi cập nhật người dùng");
    }
};

// Xóa user
exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUserById(req.params.id);
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi xóa người dùng");
    }
};
