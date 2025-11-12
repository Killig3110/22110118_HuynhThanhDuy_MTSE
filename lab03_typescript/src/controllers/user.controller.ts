import * as userService from '../services/user.service';
import Role from '../models/role.model';
import Position from '../models/position.model';
import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUser();
        res.render('users/list', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy danh sách người dùng');
    }
};

export const addForm = async (req: Request, res: Response) => {
    try {
        const roles = await Role.find({}).lean();
        const positions = await Position.find({}).lean();
        res.render('users/create', { roles, positions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tải form');
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const data = { ...req.body };
        if ((req as any).file) {
            const uploadUrl = process.env.UPLOAD_URL || '/uploads';
            data.image = `${uploadUrl}/${(req as any).file.filename}`;
        }
        await userService.createNewUser(data);
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tạo người dùng');
    }
};

export const editForm = async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserInfoById(req.params.id);
        if (!user) return res.status(404).send('Người dùng không tồn tại');
        const roles = await Role.find({}).lean();
        const positions = await Position.find({}).lean();
        res.render('users/update', { user, roles, positions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy thông tin người dùng');
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const data: any = { id: req.params.id, ...req.body };
        if ((req as any).file) {
            const uploadUrl = process.env.UPLOAD_URL || '/uploads';
            data.image = `${uploadUrl}/${(req as any).file.filename}`;
        }
        await userService.updateUser(data);
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi cập nhật người dùng');
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await userService.deleteUserById(req.params.id);
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi xóa người dùng');
    }
};

export default {
    getUsers,
    addForm,
    createUser,
    editForm,
    updateUser,
    deleteUser,
};
