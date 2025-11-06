const User = require("../models/user.model");

exports.createUser = (data) => User.create(data);
exports.getAllUsers = () => User.find();
exports.getUserById = (id) => User.findById(id);
exports.updateUser = (id, data) => User.findByIdAndUpdate(id, data, { new: true });
exports.deleteUser = (id) => User.findByIdAndDelete(id);
