# Lab 04 - Full-stack React + Express + MySQL Application

A comprehensive full-stack web application built with React.js frontend, Express.js backend, and MySQL database with authentication features.

## 🚀 Features

### Authentication
- **User Registration** with email validation
- **User Login** with JWT tokens
- **Password Reset** functionality via email
- **Protected Routes** with role-based access control
- **Auto-logout** on token expiration

### User Management (CRUD)
- **Create Users** with profile information and avatar upload
- **Read/View Users** with search and pagination
- **Update Users** with partial profile updates
- **Delete Users** (soft delete with status toggle)
- **Role & Position Management** (Admin, Manager, Employee, User)

### Security Features
- **Password Hashing** with bcryptjs
- **JWT Authentication** with secure token storage
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** with express-validator
- **File Upload Security** with multer restrictions
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers

### User Interface
- **Responsive Design** with modern CSS
- **React Router** for client-side routing
- **Form Validation** with react-hook-form and yup
- **Toast Notifications** for user feedback
- **Role-based UI** showing features based on permissions
- **Avatar Upload** with preview functionality

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **nodemailer** - Email sending
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### Frontend
- **React.js** - Frontend library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **js-cookie** - Cookie handling

### Database
- **MySQL** - Primary database
- **Sequelize** - ORM with migrations and seeders

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd lab04_fullstack_react_express
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# DB_NAME=lab04_fullstack
# DB_USERNAME=root
# DB_PASSWORD=your_password
# JWT_SECRET=your_super_secret_jwt_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# Create MySQL database
mysql -u root -p
CREATE DATABASE lab04_fullstack;
exit;

# Seed the database (creates tables and sample data)
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
lab04_fullstack_react_express/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Authentication logic
│   │   │   └── user.controller.js   # User CRUD operations
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── upload.js            # File upload handling
│   │   ├── models/
│   │   │   ├── User.js              # User model
│   │   │   ├── Role.js              # Role model
│   │   │   ├── Position.js          # Position model
│   │   │   └── index.js             # Model associations
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Auth endpoints
│   │   │   └── user.routes.js       # User CRUD endpoints
│   │   ├── seeders/
│   │   │   └── index.js             # Database seeding
│   │   └── server.js                # Express app entry point
│   ├── uploads/                     # File uploads directory
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Navbar.jsx       # Navigation component
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # Login page
│   │   │   │   ├── Register.jsx     # Registration page
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── users/
│   │   │   │   ├── UserList.jsx     # User management
│   │   │   │   ├── UserCreate.jsx   # Create user form
│   │   │   │   └── UserEdit.jsx     # Edit user form
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   └── Profile.jsx          # User profile
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── .gitignore
│   └── package.json
├── .gitignore
└── README.md
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `firstName`, `lastName`
- `email` (Unique)
- `password` (Hashed)
- `phone`, `address`, `dateOfBirth`
- `avatar` (File path)
- `roleId` (Foreign Key)
- `positionId` (Foreign Key)
- `isActive`
- `lastLogin`
- `resetPasswordToken`, `resetPasswordExpires`
- `createdAt`, `updatedAt`

### Roles Table
- `id` (Primary Key)
- `name` (Admin, Manager, Employee, User)
- `description`
- `isActive`

### Positions Table
- `id` (Primary Key)
- `title`
- `description`
- `department`
- `salary`
- `isActive`

## 🔐 Authentication Flow

1. **Registration**: User provides details → Password hashed → JWT token issued
2. **Login**: Email/password verification → JWT token issued → User data returned
3. **Protected Routes**: JWT verification middleware → User object attached to request
4. **Password Reset**: Email → Reset token → New password → Token invalidated
5. **Logout**: Client removes token → Server validates token expiration

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User CRUD operations
- Role and position management

### Manager
- View all users
- Limited user management
- No create/delete permissions

### Employee/User
- View own profile
- Update own profile
- Basic dashboard access

## 📧 Test Credentials

After running the seeder, you can use these test accounts:

```
Admin Account:
Email: admin@example.com
Password: admin123

Manager Account:
Email: manager@example.com
Password: manager123

Employee Account:
Email: alice@example.com
Password: alice123
```

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### User Management Routes
- `GET /api/users` - List users with pagination (Manager+)
- `GET /api/users/:id` - Get user by ID (Manager+)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (Admin only)
- `GET /api/users/roles` - Get all roles (Public)
- `GET /api/users/positions` - Get all positions (Public)

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token generation and validation
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevents brute force attacks
- **File Upload Security**: Restricted file types and sizes
- **CORS**: Configured for frontend domain only
- **Helmet**: Security headers for XSS protection
- **SQL Injection**: Protected via Sequelize ORM

## 🌐 Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lab04_fullstack
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Upload Settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif
```

## 📝 Development Commands

### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🚀 Deployment

### Backend Deployment
1. Set up MySQL database on your server
2. Configure environment variables for production
3. Run database seeding: `npm run seed`
4. Start the server: `npm start`

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Serve the `dist` folder using a web server (nginx, Apache, etc.)
3. Configure API proxy to backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is for educational purposes as part of the MTSE course.

## 📞 Support

If you encounter any issues, please check:
1. Database connection and credentials
2. Node.js and MySQL versions
3. Environment variables configuration
4. Port availability (3000, 5000)

For additional help, refer to the documentation of the individual technologies used.