# Lab05 Building Management - Apartment Rental/Purchase System

## ✅ Completed Features (December 9, 2025)

### 1. **Dashboard Enhancements**
**File**: `frontend/src/pages/DashboardNew.jsx`

**Features**:
- ✅ User profile card with avatar (with fallback to initials)
- ✅ Role badge and position display
- ✅ Last login timestamp (formatted date)
- ✅ Role-based quick actions (color-coded cards)
- ✅ Real-time stats for staff roles (buildings, apartments, occupancy)
- ✅ Marketplace stats for users/residents (apartments for rent/sale)
- ✅ Glass-morphism effects and hover animations

**Fixed Issues**:
- Conditional rendering for nested properties (`user?.role?.name`, `user?.position?.title`)
- Avatar image handling with onError fallback
- LastLogin display with proper date formatting

---

### 2. **Modern Home Page**
**File**: `frontend/src/pages/HomeNew.jsx`

**Sections**:
- ✅ Hero section with gradient background and CTA buttons
- ✅ Stats section (4 metric cards: Buildings, Apartments, Residents, Occupancy)
- ✅ Features grid (6 cards: 3D Explorer, Smart Search, Cart System, etc.)
- ✅ How It Works timeline (4-step process)
- ✅ CTA sections with role-based buttons
- ✅ Footer with navigation links

**Dynamic Content**:
- Shows different CTAs for logged-in vs guest users
- Browse Marketplace and Explore 3D Map buttons
- Register/Login for guests, Browse for authenticated users

---

### 3. **Guest Navigation**
**File**: `frontend/src/components/layout/Navbar.jsx`

**Features**:
- ✅ Shows navbar for non-logged-in users
- ✅ Guest links: Home, Interactive Map, Marketplace
- ✅ Login/Register buttons (desktop and mobile)
- ✅ Responsive design with mobile menu
- ✅ Cart icon for users/residents (with item count badge)

---

### 4. **Database Seeder Updates**
**File**: `backend/src/seeders/index.js`

**Improvements**:
- ✅ Added 2 "user" role accounts (user@building.com, user2@building.com)
- ✅ All users now have `lastLogin: new Date()`
- ✅ Apartment status distribution: 60% vacant, 16.7% occupied, 16.7% under_renovation
- ✅ Apartment listing logic:
  - Vacant apartments: 33% for rent only, 33% for sale only, 33% both
  - Proper `isListedForRent` and `isListedForSale` flags
- ✅ Apartment images: 3-5 Unsplash images per apartment (stored in JSON field)
  - 4 image collections: studio, 1bhk, 2bhk, 3bhk
- ✅ Only occupied apartments have owners/tenants assigned

**Image Collections**:
```javascript
studio: ['photo-1522708323590-d24dbb6b0267', 'photo-1536376072261-38c75010e6c9', ...]
1bhk: ['photo-1560448204-e02f11c3d0e2', 'photo-1484154218962-a197022b5858', ...]
2bhk: ['photo-1567767292278-a4f21aa2d36e', 'photo-1502672260266-1c1ef2d93688', ...]
3bhk: ['photo-1574362848149-11496d93a7c7', 'photo-1600596542815-ffad4c1539a9', ...]
```

---

### 5. **My Apartments Page**
**File**: `frontend/src/pages/apartments/MyApartments.jsx`

**Features**:
- ✅ Modern card layout with tabs (All, Owned, Rented)
- ✅ Apartment images with Unsplash fallback
- ✅ Status badges (Vacant/Occupied/Under Renovation)
- ✅ Owner badge for owned apartments
- ✅ Property details: bedrooms, bathrooms, area, prices
- ✅ Resident count display
- ✅ **Listing Management** (for owners/managers):
  - Toggle switches for "Listed for Rent" and "Listed for Sale"
  - Only available for vacant apartments
- ✅ **Status Management** (for owners/managers):
  - Dropdown to change status (Vacant, Occupied, Under Renovation)
  - Auto-disables listings when status changes to non-vacant
- ✅ **Pending Owner Approval Section**:
  - Shows lease requests waiting for owner approval
  - Approve/Reject buttons
  - Displays requester info and request type (rent/buy)

**Image Handling**:
```javascript
// Parse JSON images field
let images = [];
try {
    images = typeof apartment.images === 'string' 
        ? JSON.parse(apartment.images) 
        : (apartment.images || []);
} catch (e) {
    images = [];
}
const primaryImage = images[0] || `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;
```

---

### 6. **Backend API Endpoints**
**Files**: `backend/src/controllers/apartment.controller.js`, `backend/src/routes/apartment.routes.js`

#### **New Endpoints**:

**GET `/api/apartments/my-apartments`**
- Returns apartments owned or rented by current user
- Includes: floor info, building info, household members
- Query: Owner apartments OR apartments where user is resident (check email)

**PATCH `/api/apartments/:id/listing`**
- Update `isListedForRent` and `isListedForSale` flags
- **Permissions**: Owner OR Building Manager/Admin
- **Validation**: Only vacant apartments can be listed
- Auto-disables listings when status changes to non-vacant

**PATCH `/api/apartments/:id/status`**
- Update apartment status (vacant, occupied, under_renovation)
- **Permissions**: Owner OR Building Manager/Admin
- **Logic**: 
  - If status → non-vacant: Auto-disable listings
  - Returns message: "Status updated to {status} (listings disabled)"

---

## 🔐 Permission Matrix

| Action | Owner | Building Manager | Admin | User/Resident |
|--------|-------|------------------|-------|---------------|
| View owned apartments | ✅ | ❌ | ❌ | ❌ |
| View rented apartments | ✅ | ❌ | ❌ | ✅ |
| Toggle listing (vacant only) | ✅ | ✅ | ✅ | ❌ |
| Change apartment status | ✅ | ✅ | ✅ | ❌ |
| Approve owner requests | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Business Logic

### Apartment Statuses
- **Vacant**: Can be listed for rent/sale
- **Occupied**: Cannot be listed (has residents)
- **Under Renovation**: Cannot be listed (under construction)

### Listing Rules
1. Only **vacant** apartments can be listed
2. When status changes to **occupied** or **under_renovation**:
   - `isListedForRent` → false
   - `isListedForSale` → false
3. Owner or Building Manager can modify listings

### Lease Approval Flow
- **Rent**: Requires owner approval → building manager approval
- **Buy**: Goes directly to building manager approval
- Guest requests create temporary accounts (email stored in contactEmail)
- User requests upgrade user to resident role upon approval

---

## 🎨 UI/UX Improvements

### Color Scheme
- **Vacant**: Green (available)
- **Occupied**: Blue (has residents)
- **Under Renovation**: Yellow (under construction)
- **Owner Badge**: Purple
- **Listing Toggles**: Blue when enabled, Gray when disabled

### Responsive Design
- Desktop: 3-column grid
- Tablet: 2-column grid
- Mobile: Single column
- All interactive elements have hover effects

### Loading States
- Spinner animation while fetching data
- Empty states with helpful messages
- Error handling with toast notifications

---

## 🧪 Test Accounts

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| admin@building.com | 123456 | Admin | Full system access |
| buildingmanager@building.com | 123456 | Building Manager | Approve leases, manage apartments |
| user@building.com | 123456 | User | Request apartments, add to cart |
| user2@building.com | 123456 | User | Secondary test account |
| student@building.com | 123456 | Resident | View rented apartments |
| resident@building.com | 123456 | Resident | View rented apartments |

---

## 🚀 Testing Workflow

### 1. Guest User Flow
1. Visit `/home` (not logged in)
2. Browse Marketplace → see available apartments
3. Click "View Details" → redirected to Login
4. Register new account → becomes "user" role

### 2. User Role Flow
1. Login as `user@building.com`
2. Browse Marketplace → filter by rent/sale
3. Add apartments to cart
4. Checkout → submit lease requests
5. Wait for owner/manager approval

### 3. Owner Role Flow
1. Login as account with owned apartments
2. Go to "My Apartments"
3. Tab: "Owned" → see your apartments
4. For vacant apartments:
   - Toggle "Listed for Rent" ON/OFF
   - Toggle "Listed for Sale" ON/OFF
5. Change status dropdown:
   - Select "Occupied" → listings auto-disable
   - Select "Under Renovation" → listings auto-disable
   - Select "Vacant" → can enable listings again
6. Pending requests section:
   - Review rent/buy requests
   - Click "Approve" or "Reject"

### 4. Building Manager Flow
1. Login as `buildingmanager@building.com`
2. Go to "Leases" page
3. Approve/reject pending requests
4. Can also manage apartment listings via "My Apartments"

---

## 📁 File Structure

```
lab05_ManageBuilding/
├── backend/
│   └── src/
│       ├── controllers/
│       │   └── apartment.controller.js (NEW: getMyApartments, updateListing, updateStatus)
│       ├── routes/
│       │   └── apartment.routes.js (NEW: 3 endpoints)
│       ├── models/
│       │   └── index.js (Association: householdMembers)
│       └── seeders/
│           └── index.js (UPDATED: images, users, apartment distribution)
└── frontend/
    └── src/
        ├── pages/
        │   ├── DashboardNew.jsx (UPDATED: user info display)
        │   ├── HomeNew.jsx (NEW: modern landing page)
        │   └── apartments/
        │       └── MyApartments.jsx (NEW: owner apartment management)
        └── components/
            └── layout/
                └── Navbar.jsx (EXISTING: already has guest support)
```

---

## 🔄 Database Schema Changes

### Users Table
- Added `lastLogin` DATETIME field (updated on login)

### Apartments Table
- `images` JSON field stores array of Unsplash image IDs
- `isListedForRent` BOOLEAN (independent from status)
- `isListedForSale` BOOLEAN (independent from status)
- `status` ENUM: 'vacant', 'occupied', 'under_renovation'

---

## 🎯 Future Enhancements (Not Implemented)

1. **Image Upload**: Allow owners to upload custom apartment photos
2. **Lease History**: Show past leases for each apartment
3. **Revenue Dashboard**: Show rental income for owners
4. **Maintenance Requests**: Residents can submit repair requests
5. **Payment Integration**: Online rent payment system
6. **Contract Management**: Digital lease agreements
7. **Notification System**: Email/SMS alerts for lease events
8. **Analytics**: Vacancy rates, popular apartment types

---

## 📝 Notes

- All images use Unsplash CDN with consistent sizing (400x300)
- Database seeder creates 360 apartments (3 blocks × 10 buildings × 6 floors × 2 apartments)
- 60% apartments are vacant and available for marketplace
- JWT tokens stored in LocalStorage (lab-specific key to avoid conflicts)
- Rate limiting bypassed in development mode
- CORS enabled for localhost:3000 and Vite dev server

---

## 🐛 Known Issues & Fixes

### Issue 1: "Failed to load your apartments" (404)
**Cause**: Association name mismatch (`currentTenants` vs `householdMembers`)  
**Fixed**: Changed query to use correct association name

### Issue 2: Images not displaying
**Cause**: Images stored as JSON string, not parsed on frontend  
**Fixed**: Added JSON.parse() with try/catch fallback

### Issue 3: Dashboard showing undefined user info
**Cause**: Missing null checks for nested properties  
**Fixed**: Changed `user?.role` to `user?.role?.name`

### Issue 4: Seeder not creating vacant apartments
**Cause**: Status cycle distributed evenly (20% each)  
**Fixed**: Changed to 60% vacant, 16.7% occupied, 16.7% under_renovation

---

## ✨ Summary

Hệ thống quản lý căn hộ đã hoàn thiện với đầy đủ tính năng:
- ✅ Guest có thể xem và đăng ký
- ✅ User có thể request apartments
- ✅ Resident xem căn hộ đang thuê
- ✅ Owner quản lý listing và status
- ✅ Manager approve requests và quản lý toàn bộ
- ✅ Modern UI với images từ Unsplash
- ✅ Role-based permissions
- ✅ Auto-disable listings khi status changes

**Total Lines of Code**: ~1,500 lines added/modified across 6 files
