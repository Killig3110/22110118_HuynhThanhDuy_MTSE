# Lab05 - Building Management System

A comprehensive building management system built with React (frontend) and Express.js (backend) featuring role-based access control, security layers, and modern UI components.

## 🏢 Project Overview

This system manages apartment buildings with different user roles and comprehensive features:

### User Roles
- **Admin**: Full system access and building management
- **Building Manager**: Manages operations, facilities, and residents
- **Resident**: Apartment owner/tenant access to personal services
- **Security**: Visitor and access management
- **Technician**: Maintenance and repair management
- **Accountant**: Billing, payments, and financial management

## 🔒 Security Implementation (Lab Requirements)

### 1. Input Validation ✅
- **Library**: `express-validator`
- **Implementation**: Validates all form inputs and API parameters
- **Features**: Type checking, length validation, format verification

### 2. Rate Limiting ✅
- **Library**: `express-rate-limit`
- **Implementation**: Prevents API abuse and brute force attacks
- **Configuration**: Different limits for login vs general API calls

### 3. Authentication ✅
- **Method**: JWT (JSON Web Tokens)
- **Features**: Secure token generation, expiration handling
- **Storage**: HttpOnly cookies for enhanced security

### 4. Authorization ✅
- **Method**: Role-based middleware
- **Implementation**: Route-level permissions based on user roles
- **Features**: Granular access control for different user types

## ✅ Lab Requirements Implementation

### Form Validation
- Frontend validation with React Hook Form
- Real-time validation feedback
- Error handling and user guidance
- Consistent validation rules across forms

### Lazy Loading / Pagination
- Infinite scroll for apartment listings
- Paginated announcements with load-more functionality
- Optimized API responses with cursor-based pagination
- Loading states and skeleton screens

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database settings in .env
npm run seed    # Initialize database with sample data
npm run dev     # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Start Vite development server
```

### Sample Accounts
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@building.com | admin123 | Full system access |
| Building Manager | manager@building.com | manager123 | Building operations |
| Security | security@building.com | security123 | Visitor management |
| Technician | tech@building.com | tech123 | Maintenance tasks |
| Accountant | accountant@building.com | account123 | Financial management |
| Resident | 22110118@student.hcmute.edu.vn | duy123 | Personal services |

## 🏗️ Database Models

### Core Structure
- **Building**: Main building information and management
- **Block**: Building subdivisions  
- **Floor**: Floor management within blocks
- **Apartment**: Individual units with owner/tenant information
- **HouseholdMember**: Apartment residents and family members
- **Visitor**: Visitor registration and tracking
- **Facility**: Common amenities (gym, pool, clubhouse, etc.)
- **FacilityBooking**: Reservation system for facilities
- **Billing**: Maintenance fees, utilities, and other charges
- **Payment**: Payment tracking and receipts
- **Announcement**: Building communications

## 🎨 Frontend Features

- **Modern UI**: React with Tailwind CSS
- **Responsive Design**: Mobile-first approach
- **Form Validation**: Client-side validation with error handling
- **Lazy Loading**: Infinite scroll for large data sets
- **Role-based UI**: Different interfaces for different user roles

## 📱 Key Features

- **Building Structure Management**: Buildings → Blocks → Floors → Apartments
- **Resident Management**: Apartment assignments and household members
- **Visitor Management**: Registration, approval, and tracking
- **Facility Management**: Booking system for common amenities
- **Billing & Payments**: Comprehensive financial management
- **Announcements**: Building-wide communication system

---

**Lab05 Building Management System** - HCMUTE MTSE Course
Student ID: 22110118 - Huỳnh Thành Duy