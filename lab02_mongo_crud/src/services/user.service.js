const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Hàm hash mật khẩu
const hashUserPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

// CREATE (thêm user mới)
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await hashUserPassword(data.password);
            const newUser = await User.create({
                ...data,
                password: hashedPassword,
            });
            resolve(newUser);
        } catch (e) {
            reject(e);
        }
    });
};

// READ ALL
let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({}, "-password"); // loại bỏ password khi trả về
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

// READ ONE
let getUserInfoById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id, "-password");
            if (user) resolve(user);
            else resolve(null);
        } catch (e) {
            reject(e);
        }
    });
};

// UPDATE
let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(data.id);
            if (user) {
                user.firstName = data.firstName || user.firstName;
                user.lastName = data.lastName || user.lastName;
                user.address = data.address || user.address;
                user.phoneNumber = data.phoneNumber || user.phoneNumber;
                user.gender = data.gender ?? user.gender;
                user.roleId = data.roleId || user.roleId;
                user.positionId = data.positionId || user.positionId;
                user.image = data.image || user.image;
                if (data.password) {
                    user.password = await hashUserPassword(data.password);
                }
                await user.save();
                resolve(user);
            } else {
                resolve(null);
            }
        } catch (e) {
            reject(e);
        }
    });
};

// DELETE
let deleteUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id);
            if (user) await user.deleteOne();
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createNewUser,
    getAllUser,
    getUserInfoById,
    updateUser,
    deleteUserById,
};
