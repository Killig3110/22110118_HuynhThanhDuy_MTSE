const userService = require("../services/user.service");

exports.getUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.render("users/list", { users });
};

// Hiển thị form thêm
exports.addForm = (req, res) => {
    res.render("users/create");
};

// Thêm user
exports.createUser = async (req, res) => {
    await userService.createUser(req.body);
    res.redirect("/users");
};

// Hiển thị form sửa
exports.editForm = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.render("users/update", { user });
};

// Cập nhật user
exports.updateUser = async (req, res) => {
    await userService.updateUser(req.params.id, req.body);
    res.redirect("/users");
};

// Xóa user
exports.deleteUser = async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.redirect("/users");
};
