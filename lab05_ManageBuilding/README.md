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

### Engagement Models (New)
- **ApartmentFavorite**: User favorites with unique constraint on [userId, apartmentId]
- **ApartmentView**: View tracking with userId (nullable for guests), ipAddress, viewedAt, 1-hour deduplication
- **ApartmentReview**: Ratings (1-5) and comments, unique constraint on [userId, apartmentId], tenant/owner validation

## 🎨 Frontend Features

- **Modern UI**: React with Tailwind CSS
## 📱 Key Features

### Core Management
- **Building Structure Management**: Buildings → Blocks → Floors → Apartments
- **Resident Management**: Apartment assignments and household members
- **Visitor Management**: Registration, approval, and tracking
- **Facility Management**: Booking system for common amenities
- **Billing & Payments**: Comprehensive financial management
- **Announcements**: Building-wide communication system

### User Engagement
- **Favorites System**: Save and manage favorite apartments
- **Reviews & Ratings**: Rate and review apartments (tenant/owner only)
- **View Tracking**: Track apartment views, show recently viewed
- **Statistics Dashboard**: Real-time engagement metrics per apartment
- **Similar Apartments**: Smart recommendation algorithm
- **Guest Access**: Browse marketplace without authentication → Floors → Apartments
- **Resident Management**: Apartment assignments and household members
- **Visitor Management**: Registration, approval, and tracking
- **Facility Management**: Booking system for common amenities
- **Billing & Payments**: Comprehensive financial management
- **Announcements**: Building-wide communication system

## 🆕 Enhanced Features (Latest Updates)

### Engagement Features (Favorites, Reviews, Views, Stats)

#### 1. Favorites System ❤️
- **Add/Remove Favorites**: Toggle heart icon on apartment cards
- **Favorites Page**: Dedicated page at `/favorites` showing all saved apartments
- **Optimistic UI**: Instant visual feedback before server response
- **Persistence**: Favorites synced across devices and sessions
- **Authentication Required**: Must login to favorite apartments

#### 2. Reviews & Ratings ⭐
- **Write Reviews**: Tenants/owners can rate and review their apartments (1-5 stars)
- **Edit/Delete**: Users can update or remove their own reviews
- **Display Reviews**: Public review list with user info, ratings, comments, and dates
- **Average Rating**: Calculated from all reviews for each apartment
- **Validation**: Only active tenants/owners can review, one review per apartment
- **Pagination**: Review list supports pagination for apartments with many reviews

#### 3. View Tracking 👁️
- **Auto-Track Views**: Every apartment visit automatically tracked
- **Guest Support**: Anonymous view tracking via IP address
- **Deduplication**: Prevents duplicate views within 1-hour window
- **Recently Viewed**: Authenticated users see "Đã xem gần đây" section on marketplace
- **Horizontal Scroll**: Shows up to 10 recently viewed apartments with quick navigation

#### 4. Apartment Statistics 📊
Four real-time metrics displayed on each apartment:
- **Buyers Count**: Number of people who rented/bought this apartment
- **Reviews**: Average rating (e.g., 4.5★) with total review count
- **Views**: Total view count (formatted as "1.2k" for large numbers)
- **Favorites**: How many users favorited this apartment

#### 5. Similar Apartments 🏘️
- **Smart Algorithm**: Finds apartments with:
  - Same type OR same number of bedrooms
  - Area within ±20% range
  - Price within ±30% range
  - Same building prioritized
- **Limit 6**: Shows up to 6 most similar apartments
- **Navigation**: Click any similar apartment to view its details
- **Dynamic**: Similar apartments recalculate for each apartment viewed

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
- **FavoriteButton**: Heart icon in header (add/remove from favorites)
- **ApartmentStats**: 4 badges showing buyers, reviews, views, favorites
- **ReviewForm**: Star rating (1-5) + comment textarea (tenants/owners only)
- **ReviewList**: Paginated reviews with edit/delete buttons for own reviews
- **SimilarApartments**: Grid of 6 similar apartments at page bottom
- **Auto-Track View**: View automatically recorded on page load
- "Add to Cart" button (authenticated users)
- "Request Lease" button (all users, opens modal for guests)
- Share functionality

**Marketplace Enhancements**
- Sort by: Newest, Price (Low to High), Price (High to Low)
- Filter by: For Rent, For Sale, All
- Quick "View" button → Detail page
- **FavoriteButton**: Heart icon on each apartment card (top-right corner)
- **Recently Viewed Section**: Shows last 10 viewed apartments (authenticated users only)
- "Add to Cart" buttons for authenticated users (Rent/Buy)
- Responsive grid layout

**Favorites Page** (`/favorites`)
- Grid layout showing all favorited apartments
- Pagination for large lists (20 items per page)
- Empty state with CTA button to marketplace
- Quick remove favorites with heart button
- Click card to view apartment details

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

**Favorites** (All require authentication)
- `POST /api/favorites/:apartmentId` - Add apartment to favorites
- `DELETE /api/favorites/:apartmentId` - Remove from favorites
- `GET /api/favorites` - Get all user's favorites (paginated)
- `GET /api/favorites/check/:apartmentId` - Check if apartment is favorited

**Reviews** (Create/Update/Delete require authentication)
- `POST /api/apartments/:id/reviews` - Create review (tenant/owner only, rating 1-5, comment min 10 chars)
- `PUT /api/reviews/:id` - Update own review
- `DELETE /api/reviews/:id` - Delete own review
- `GET /api/apartments/:id/reviews` - Get apartment reviews (public, paginated)
## 🧪 Testing Guide

### Quick Test (10 minutes) - See `QUICK_TEST_GUIDE.md`

### Test Engagement Features

#### Test Favorites
1. Login as user
2. Go to `/marketplace`
3. Click heart icon on 3 apartments → Hearts turn red
4. Go to `/favorites` → See 3 apartments in grid
5. Click heart on one → Should remove from list

#### Test Reviews (Tenant/Owner Only)
1. Login as `resident@building.com / resident123`
2. Go to any apartment detail page
3. See ReviewForm → Click 5 stars → Type comment (min 10 chars)
4. Submit → Toast success → Review appears in list
5. Click edit icon → Change to 4 stars → Save
6. Click delete icon → Confirm → Review removed

#### Test View Tracking
1. Visit 3 different apartments
2. Go to `/marketplace`
3. See "Đã xem gần đây" section with 3 apartments (most recent first)
4. Visit same apartment again within 1 hour → View count doesn't duplicate

#### Test Stats & Similar
1. Go to any apartment detail
2. See 4 stat badges at top (buyers, reviews, views, favorites)
3. Scroll to bottom → See "Căn hộ tương tự" with up to 6 apartments
4. Click any similar apartment → Navigates to new apartment detail

### Test Guest Flow
1. Open `/marketplace` without logging in
2. Click "View" on an apartment → See detail page
3. Click heart icon → Redirects to `/login`
4. No "Đã xem gần đây" section (guest views tracked by IP only)
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

### Full Testing Guide
- **Quick Test**: See `QUICK_TEST_GUIDE.md` for 10-step checklist
- **Detailed Test**: See `TEST_ENGAGEMENT_FEATURES.md` for comprehensive scenarios
- **API Testing**: Use Postman collection or curl commands in test guides

## 🧪 Testing Guide

### Test Guest Flow
1. Open `/marketplace` without logging in
2. Click "View" on an apartment → See detail page
3. Click "Request Lease" → Fill guest modal → Submit
4. Check backend console for guest request log
---

## 📚 Documentation Files

- **README.md**: This file - project overview and features
- **DATABASE_RELATIONSHIPS.md**: Detailed database schema and relationships
- **IMPLEMENTATION_SUMMARY.md**: Cart and checkout implementation details
- **BUG_FIXES_DEC_9.md**: Documented bug fixes and solutions
- **TEST_LEASE_WORKFLOW.md**: Lease request workflow testing guide
- **TEST_ENGAGEMENT_FEATURES.md**: Comprehensive engagement features testing guide
- **QUICK_TEST_GUIDE.md**: 10-minute quick test checklist

---

## 🎯 Feature Completeness

### ✅ Lab Requirements Met
- [x] Form Validation (express-validator + React Hook Form)
- [x] Lazy Loading / Pagination (infinite scroll + paginated lists)
- [x] Rate Limiting (express-rate-limit)
- [x] Authentication (JWT)
- [x] Authorization (Role-based middleware)
- [x] Input Validation (express-validator)

### ✅ Additional Features Implemented
- [x] Guest access and lease requests
- [x] Cart system with checkout
- [x] Interactive 3D building map
- [x] Fuzzy search with filters
- [x] GraphQL integration (cart operations)
- [x] Error boundaries and handling
- [x] **Favorites system** 
- [x] **Reviews and ratings**
- [x] **View tracking**
- [x] **Apartment statistics**
- [x] **Similar apartments algorithm**
- [x] **Recently viewed section**

---

**Lab05 Building Management System** - HCMUTE MTSE Course  
Student ID: 22110118 - Huỳnh Thành Duy  
Latest Update: Engagement Features (Favorites, Reviews, Views, Stats, Similar Apartments)
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
