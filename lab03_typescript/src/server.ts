import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import connectDB from './config/db';
import userRoutes from './routes/user.routes';
import homeController from './controllers/home.controller';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static and uploads
app.use(express.static(path.join(__dirname, '..', 'public')));
const uploadUrl = process.env.UPLOAD_URL || '/uploads';
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
app.use(uploadUrl, express.static(uploadDir));

app.use('/users', userRoutes);
app.get('/', homeController.index);

connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server (TS) running on http://localhost:${PORT}`));
