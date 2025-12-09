# 🧠 BÀI TẬP MÔN CÔNG NGHỆ PHẦN MỀM MỚI – LỚP 03CLC

## 👤 Thông tin sinh viên
- **Họ tên:** Huỳnh Thanh Duy  
- **MSSV:** 22110118  
- **Lớp:** 03CLC – Khoa Công nghệ phần mềm  
- **Môn học:** Công nghệ phần mềm mới (Modern Software Engineering)  

---

## 📘 Giới thiệu repo
Repository này dùng để lưu trữ toàn bộ **bài tập thực hành môn Công nghệ phần mềm mới**, bao gồm các bài tập ExpressJS và MongoDB.

Mỗi thư mục tương ứng với một bài tập riêng biệt, có cấu trúc và hướng dẫn cụ thể trong từng thư mục con.

---

## 📚 Danh sách bài tập

| Bài tập | Tên thư mục | Mô tả ngắn |
|----------|--------------|------------|
| **BT01** | `lab02_mongo_crud` | Làm quen với ExpressJS + MongoDB, tạo server cơ bản và render template EJS với CRUD operations. |
| **BT02** | `lab03_typescript` | Port từ BT01 sang **TypeScript**: Express + Mongoose + EJS, hỗ trợ upload ảnh, role/position models và seeder. |
| **BT03** | `lab04_fullstack_react_express` | Full-stack authentication system với **React** (frontend) + **Express + MySQL/Sequelize** (backend), JWT authentication, protected routes. |
| **BT04-08** | `lab05_ManageBuilding` | **Enterprise Building Management System** - Full-stack React + Express + MySQL với GraphQL, role-based access control, engagement features (favorites, reviews, views, cart), marketplace, interactive 3D building map. |
| **BT09** | `lab07_CartComponent` | Reusable **React Cart Component Library** - Standalone UI components cho apartment rental/purchase cart với custom hooks. |
| **Portfolio** | `my-portfolio` | Personal portfolio website sử dụng **React 19 + Vite**. |

---

## ⚙️ Công nghệ sử dụng

### Backend
- **Node.js / ExpressJS** – REST API server và backend framework
- **MongoDB / Mongoose** – NoSQL database cho lab02, lab03
- **MySQL / Sequelize** – Relational database cho lab04, lab05
- **GraphQL / Apollo Server** – API layer cho cart operations (lab05)
- **TypeScript** – Type safety cho lab03
- **JWT (jsonwebtoken)** – Authentication và authorization
- **bcryptjs** – Password hashing
- **Multer** – File upload handling
- **Express-validator** – Input validation
- **Helmet** – Security headers
- **Express-rate-limit** – Rate limiting

### Frontend
- **React 18/19** – UI library
- **React Router** – Client-side routing
- **Vite** – Build tool và dev server
- **Tailwind CSS** – Utility-first CSS framework
- **Heroicons** – Icon library
- **React Hot Toast** – Toast notifications
- **Fuse.js** – Fuzzy search
- **Axios** – HTTP client

### Tools & DevOps
- **dotenv** – Environment variables
- **nodemon / ts-node-dev** – Auto-reload dev server
- **ESLint** – Code linting
- **Postman** – API testing  

---

## 🧩 Cấu trúc repo tổng quát
```
/22110118_HuynhThanhDuy_MTSE/
│
├── lab02_mongo_crud/                    # Express + MongoDB CRUD
├── lab03_typescript/                    # TypeScript Express + MongoDB
├── lab04_fullstack_react_express/       # React + Express + MySQL Auth System
│   ├── backend/                         # Express API
│   └── frontend/                        # React App
├── lab05_ManageBuilding/                # Enterprise Building Management
│   ├── backend/                         # Express + MySQL + GraphQL
│   └── frontend/                        # React + Vite + Tailwind
├── lab07_CartComponent/                 # Reusable Cart Component Library
├── my-portfolio/                        # Personal Portfolio (React + Vite)
│
└── README.md
```

---

## 🌟 Điểm nổi bật của lab05_ManageBuilding

### Core Features
- **4-Layer Security Architecture**: Rate limiting → Helmet headers → Input validation → JWT auth + RBAC
- **Role-Based Access Control**: Admin, Building Manager, Resident, Security, Technician, Accountant, User
- **Hierarchical Data Model**: Block → Building → Floor → Apartment → Household Member
- **Interactive 3D Building Map**: CSS 3D transforms visualization
- **Marketplace with Advanced Search**: Fuzzy search với Fuse.js, exact match cho apartment numbers
- **GraphQL Integration**: Apollo Server cho cart operations với transactions

### Engagement Features
- **Favorites System**: Users can favorite apartments, check favorite status
- **Reviews & Ratings**: 5-star rating system, only tenants/owners can review
- **View Tracking**: Track apartment views với IP-based và user-based deduplication (1hr)
- **Apartment Stats**: Real-time stats (buyers count, reviews count, avg rating, views, favorites)
- **Similar Apartments**: Recommendation engine dựa trên type, bedrooms, area, price

### Cart & Lease Workflow
- **Shopping Cart**: Select approved apartments → Checkout via GraphQL mutation
- **Lease Request System**: Guest/User submit request → Manager approve → Auto-create cart → User checkout → Upgrade to resident
- **Payment Processing**: Simulated payment với automatic role upgrade và apartment status update

### Technical Highlights
- **Hybrid Search**: Exact match + fuzzy search fallback, optimized cho apartment number searches
- **Security**: bcryptjs hashing, JWT tokens, helmet CSP, express-rate-limit, express-validator
- **Database**: MySQL với Sequelize ORM, associations với aliases, transaction support
- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Context API, Axios interceptors
- **Testing Documentation**: Comprehensive test guides (`TEST_ENGAGEMENT_FEATURES.md`, `QUICK_TEST_GUIDE.md`)

---

## 🧠 Ghi chú
- Các bài tập được thực hiện trong học kỳ I, năm học 2024–2025.  
- Mỗi thư mục đều có file `README.md` riêng mô tả chi tiết cách chạy và test bài.  
- **lab05_ManageBuilding** có documentation đầy đủ với test guides, bug fixes log, implementation summary.
- Repo được push công khai để phục vụ việc học, tham khảo và đánh giá trong môn học.

---

## 🧑‍💻 Tác giả
**Huỳnh Thanh Duy**  
Sinh viên năm cuối – Ngành Công nghệ phần mềm  
Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh (HCMUTE)
