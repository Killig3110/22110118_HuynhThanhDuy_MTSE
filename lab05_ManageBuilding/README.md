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

### 🔍 Fuzzy Search + Filters (Backend)
- **Endpoint**: `GET /api/apartments/search` (JWT protected)
- **Search**: Tokenized fuzzy search over apartment number, type, description, building name/code
- **Filters**: `blockId`, `buildingId`, `floorId`, `status`, `type`, `bedrooms`, `bathrooms`, `hasParking`, `minArea/maxArea`, `minRent/maxRent`
- **Sorting**: `sortBy` (`apartmentNumber`, `monthlyRent`, `area`, `bedrooms`, `bathrooms`, `createdAt`, `updatedAt`) + `sortOrder`
- **Example**:
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/apartments/search?q=201&blockId=1&minArea=50&maxRent=1200&bedrooms=2&sortBy=monthlyRent&sortOrder=ASC"
```

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

## 🆕 Enhanced Features (Latest Update)

### Guest Access System
- **Public Marketplace**: Browse apartments without authentication
- **Guest Requests**: Submit lease requests with contact info (name, email, phone)
- **Auto-Account Creation**: Guests become users when requests are approved
- **Role Upgrade**: Users automatically upgraded to residents on approval

### Apartment Rental/Purchase Workflow

#### For Guests (Unauthenticated Users)
1. **Browse**: View Marketplace and Building Map (no login required)
2. **View Details**: Click apartment card → See full details page
3. **Request**: Submit lease request with contact information
4. **Notification**: Admin sees console log of guest request
5. **Approval**: When manager approves → Auto-create account with temp password
6. **Upgrade**: User role automatically changes to "resident"

#### For Authenticated Users (Logged In)
1. **Browse**: Access Marketplace with enhanced features
2. **Add to Cart**: Click "Rent" or "Buy" buttons on apartment cards
3. **Manage Cart**: View cart, update quantities (months for rent), remove items
4. **Checkout**: Select items → Checkout → Creates batch lease requests
5. **Track Requests**: View "My Requests" page for status updates

#### For Residents
- Same as authenticated users
- Can submit requests without additional contact info
- Dashboard shows owned/rented apartments
- Access to resident-only features

### Enhanced UI Components

**ApartmentDetailPage** (`/apartments/:id`)
- Image gallery with thumbnails and carousel
- Full apartment information (size, bedrooms, bathrooms, amenities)
- Pricing details (rent/sale price, deposit, maintenance fee)
- Location information (block, building, floor)
- "Add to Cart" button (authenticated users)
- "Request Lease" button (all users, opens modal for guests)
- Share and favorite functionality

**Marketplace Enhancements**
- Sort by: Newest, Price (Low to High), Price (High to Low)
- Filter by: For Rent, For Sale, All
- Quick "View" button → Detail page
- "Add to Cart" buttons for authenticated users (Rent/Buy)
- Responsive grid layout

**Cart Integration**
- Cart icon in Navbar (hidden for guests)
- Bulk checkout → Creates multiple lease requests
- Auto-clear selected items after successful checkout
- Transaction-wrapped database operations

### Backend Improvements

**Error Handling**
- Structured error responses with error codes
- AppError class for operational errors
- asyncHandler wrapper for async route handlers
- Graceful shutdown with SIGTERM/SIGINT handlers
- Enhanced health check with database connectivity test

**Database Transactions**
- Checkout operations wrapped in transactions
- Lease approval creates user accounts atomically
- Automatic rollback on errors
- Data consistency guaranteed

**Notifications** (Console Logs)
- Guest request submissions: `🔔 NEW GUEST LEASE REQUEST`
- User role upgrades: `✨ USER ROLE UPGRADED`
- Checkout success: `✅ Checkout Success`

**Error Boundaries**
- React ErrorBoundary component wraps entire app
- User-friendly error UI with retry/home buttons
- Development mode shows error details and stack trace
- Automatic reload after multiple errors

### API Endpoints

**Cart Operations**
- `POST /api/cart/checkout` - Batch create lease requests from selected cart items
- Returns count of created requests and clears cart

**Lease Requests**
- `POST /api/leases` - Create lease request (uses `optionalAuth` middleware)
- Accepts guest requests with `contactName`, `contactEmail`, `contactPhone`
- Auto-creates user accounts and upgrades roles on approval

**Apartments**
- `GET /apartments/:id` - Public endpoint (uses `optionalAuth`)
- Returns full apartment details for detail page

---

## 🧪 Testing Guide

### Test Guest Flow
1. Open `/marketplace` without logging in
2. Click "View" on an apartment → See detail page
3. Click "Request Lease" → Fill guest modal → Submit
4. Check backend console for guest request log

### Test User Cart Flow
1. Login as any user (not staff)
2. Go to `/marketplace`
3. Click "Rent" or "Buy" → Item added to cart
4. Go to `/cart` → Select items → Checkout
5. Check "My Requests" page for lease requests

### Test Role Upgrade
1. Login as admin/building_manager
2. Go to "Lease Requests" page
3. Approve a guest request → Check console for role upgrade log
4. Guest receives temp password and resident role

---

**Lab05 Building Management System** - HCMUTE MTSE Course  
Student ID: 22110118 - Huỳnh Thành Duy  
Latest Update: Guest Access + Cart Integration + Enhanced Error Handling
