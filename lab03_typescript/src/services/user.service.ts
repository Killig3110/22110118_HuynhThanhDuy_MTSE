import User from '../models/user.model';
import bcrypt from 'bcryptjs';

const hashUserPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

export const createNewUser = async (data: any) => {
    const hashedPassword = await hashUserPassword(data.password);
    const newUser = await User.create({ ...data, password: hashedPassword });
    return newUser;
};

export const getAllUser = async () => {
    const users = await User.find({}, '-password');
    return users;
};

export const getUserInfoById = async (id: string) => {
    const user = await User.findById(id, '-password');
    return user;
};

export const updateUser = async (data: any) => {
    const user = await User.findById(data.id);
    if (!user) return null;
    user.firstName = data.firstName || user.firstName;
    user.lastName = data.lastName || user.lastName;
    user.address = data.address || user.address;
    user.phoneNumber = data.phoneNumber || user.phoneNumber;
    user.gender = data.gender ?? user.gender;
    user.roleId = data.roleId || user.roleId;
    user.positionId = data.positionId || user.positionId;
    user.image = data.image || user.image;
    if (data.password) user.password = await hashUserPassword(data.password);
    await user.save();
    return user;
};

export const deleteUserById = async (id: string) => {
    const user = await User.findById(id);
    if (user) await user.deleteOne();
};
