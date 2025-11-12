import express from 'express';
import multer from 'multer';
import path from 'path';
import userController from '../controllers/user.controller';

const router = express.Router();

const envUploadDir = process.env.UPLOAD_DIR || 'public/uploads';
const resolvedUploadDir = path.isAbsolute(envUploadDir) ? envUploadDir : path.join(process.cwd(), envUploadDir);
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, resolvedUploadDir);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const upload = multer({ storage });

router.get('/', userController.getUsers);
router.get('/add', userController.addForm);
router.post('/add', upload.single('image'), userController.createUser);
router.get('/edit/:id', userController.editForm);
router.post('/update/:id', upload.single('image'), userController.updateUser);
router.get('/delete/:id', userController.deleteUser);

export default router;
