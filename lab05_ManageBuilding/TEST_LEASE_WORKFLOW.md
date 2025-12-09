# 🧪 Test Flow - Lease/Rent/Buy Apartment Workflow

## 📋 Pre-requisites

### 1. Start Backend
```bash
cd lab05_ManageBuilding/backend
npm run dev
# Should run on http://localhost:5000 or 5001
```

### 2. Start Frontend
```bash
cd lab05_ManageBuilding/frontend
npm run dev
# Should run on http://localhost:3000 or Vite port
```

### 3. Verify Database Seeded
```bash
cd backend
npm run seed
```

**Sample Accounts from Seeder:**
- Admin: `admin@building.com` / `admin123`
- Building Manager: `manager@building.com` / `manager123`
- Resident: `resident@building.com` / `resident123`
- User: `user@building.com` / `user123`

---

## 🎯 Test Scenario 1: GUEST Workflow (Not Logged In)

### Step 1.1: Browse Marketplace as Guest
1. **Open browser** (incognito mode recommended)
2. Navigate to: `http://localhost:3000/marketplace`
3. **Expected:**
   - ✅ See list of apartments with "For Rent" and "For Sale" badges
   - ✅ See "View Details" button on each card
   - ✅ See "Request Rent" and/or "Request Buy" buttons (NOT "Add to Cart")
   - ✅ NO cart icon in navbar

### Step 1.2: View Apartment Details as Guest
1. **Click "View Details"** on any apartment
2. Navigate to: `/apartments/:id`
3. **Expected:**
   - ✅ Full apartment details displayed
   - ✅ "Request as Guest" button visible
   - ✅ "Add to Cart" button HIDDEN (not logged in)
   - ✅ "View on Map" button visible

### Step 1.3: Submit Guest Request from Marketplace
1. **Go back to Marketplace**
2. Click **"Request Rent"** on an apartment listed for rent
3. **Modal should open** - GuestLeaseRequestModal
4. **Fill in the form:**
   ```
   Name: John Doe
   Email: john.doe@test.com
   Phone: +1234567890
   Note: (optional) I'm interested in this apartment
   ```
5. Click **"Submit"** or "Gửi yêu cầu"
6. **Expected:**
   - ✅ Success toast: "Request Submitted Successfully!"
   - ✅ Email confirmation message
   - ✅ Modal closes
   - ✅ Console log (backend): "🔔 NEW GUEST LEASE REQUEST"

### Step 1.4: Submit Guest Request from Detail Page
1. Navigate to `/apartments/:id`
2. Click **"Request as Guest"**
3. Fill form and submit (same as Step 1.3)
4. **Expected:** Same success behavior

### Step 1.5: Verify Backend (Admin Check)
1. **Login as admin**: `admin@building.com` / `admin123`
2. Navigate to: `/dashboard` or lease management page
3. **Expected:**
   - ✅ See new lease request with status "pending_owner" or "pending_manager"
   - ✅ Contact info (john.doe@test.com) visible
   - ✅ No userId (NULL) for guest requests

---

## 🎯 Test Scenario 2: USER Workflow (Logged in, not Resident)

### Step 2.1: Login as User
1. Navigate to: `http://localhost:3000/login`
2. **Login:**
   ```
   Email: user@building.com
   Password: user123
   ```
3. **Expected:**
   - ✅ Redirect to dashboard
   - ✅ Cart icon visible in navbar
   - ✅ Role badge shows "user"

### Step 2.2: Browse Marketplace as User
1. Navigate to: `/marketplace`
2. **Expected:**
   - ✅ See "View Details" button
   - ✅ See "Request Rent/Buy" buttons
   - ✅ See "Cart (Rent)" and "Cart (Buy)" buttons (new!)
   - ✅ Cart icon shows count in navbar

### Step 2.3: Direct Request (No Cart)
1. Click **"Request Rent"** on any apartment
2. **Modal opens** with pre-filled contact info
3. **Expected form data:**
   ```
   Name: [Auto-filled from user profile]
   Email: user@building.com [Auto-filled]
   Phone: [Auto-filled if available]
   ```
4. Click **"Submit"**
5. **Expected:**
   - ✅ Success toast
   - ✅ Request created with userId = current user
   - ✅ Status: "pending_owner" or "pending_manager"

### Step 2.4: Add to Cart - Single Item
1. On Marketplace, click **"Cart (Rent)"** on apartment A
2. **Expected:**
   - ✅ Success toast: "Added to cart!"
   - ✅ Cart icon count increases (+1)
3. Click cart icon in navbar
4. Navigate to: `/cart`
5. **Expected:**
   - ✅ Apartment A listed
   - ✅ Mode: "rent"
   - ✅ Duration: 12 months (default)
   - ✅ Price calculation shown
   - ✅ Checkbox for selection (checked by default)

### Step 2.5: Add to Cart - Multiple Items
1. Go back to Marketplace
2. Add 2 more apartments to cart:
   - Apartment B: Click **"Cart (Buy)"**
   - Apartment C: Click **"Cart (Rent)"**
3. **Expected:**
   - ✅ Cart count = 3
4. Navigate to `/cart`
5. **Expected:**
   - ✅ 3 items listed
   - ✅ Total prices calculated
   - ✅ Rent items show duration slider
   - ✅ Buy items show one-time price

### Step 2.6: Modify Cart Items
1. On cart page:
   - Change Apartment A duration from 12 to 24 months
   - Uncheck Apartment B (buy)
2. **Expected:**
   - ✅ Price updates automatically for Apartment A
   - ✅ Apartment B unchecked, not included in total

### Step 2.7: Checkout Cart
1. Click **"Checkout"** or **"Proceed to Request"** button
2. **Confirm checkout** if confirmation dialog appears
3. **Expected:**
   - ✅ Success toast: "Successfully created X lease request(s)"
   - ✅ Selected items (A & C) removed from cart
   - ✅ Unselected item (B) remains in cart
   - ✅ Backend creates 2 lease requests
   - ✅ Each request has correct type (rent/buy), duration, status

### Step 2.8: Verify Requests Created
1. Navigate to: `/my-requests` or dashboard
2. **Expected:**
   - ✅ See 3 total requests (1 direct + 2 from cart)
   - ✅ Status: "pending_owner" or "pending_manager"
   - ✅ Apartment details visible

---

## 🎯 Test Scenario 3: ADMIN Approval Workflow

### Step 3.1: Login as Admin
1. Logout current user
2. Login: `admin@building.com` / `admin123`
3. Navigate to: `/dashboard` or lease management

### Step 3.2: View All Lease Requests
1. Go to lease requests page
2. **Expected:**
   - ✅ See ALL requests (guest + user)
   - ✅ Filter by status: pending_owner, pending_manager, approved, rejected
   - ✅ See contact info for guest requests
   - ✅ See user info for authenticated requests

### Step 3.3: Approve Request (Rent with Owner)
1. Find a RENT request with status **"pending_owner"**
2. **If you're the owner**, approve it
3. **Expected:**
   - ✅ Status changes to "pending_manager"
   - ✅ Request moves to manager approval stage
   
4. Now as **manager/admin**, find the same request (now "pending_manager")
5. Click **"Approve"**
6. **Expected:**
   - ✅ Status changes to "approved"
   - ✅ Backend logs: "✨ USER ROLE UPGRADED" (if user)
   - ✅ User role: user → resident
   - ✅ Apartment status: vacant → occupied
   - ✅ Apartment listing flags: isListedForRent = false

### Step 3.4: Approve Request (Buy - Manager Only)
1. Find a BUY request with status **"pending_manager"**
2. Click **"Approve"**
3. **Expected:**
   - ✅ Status: approved
   - ✅ User becomes owner (if user exists)
   - ✅ Apartment: ownerId = userId
   - ✅ Listing flags: isListedForSale = false, isListedForRent = false

### Step 3.5: Approve Guest Request
1. Find a request from guest (userId = NULL)
2. **Approve** it
3. **Expected:**
   - ✅ Backend creates new user account
   - ✅ Email: guest's contact email
   - ✅ Password: Temp123! (should be reset)
   - ✅ Role: resident
   - ✅ Console log: Account creation details
   - ✅ (In production: Send email with credentials)

### Step 3.6: Reject Request
1. Find any pending request
2. Click **"Reject"**
3. **Expected:**
   - ✅ Status: rejected
   - ✅ No role change
   - ✅ Apartment remains available

---

## 🎯 Test Scenario 4: RESIDENT Cannot Request

### Step 4.1: Login as Resident
1. Login: `resident@building.com` / `resident123`
2. Navigate to: `/marketplace`

### Step 4.2: Verify UI Restrictions
1. **Expected on Marketplace:**
   - ✅ "View Details" button visible
   - ❌ "Request Rent/Buy" buttons HIDDEN
   - ❌ "Cart" buttons HIDDEN
   - ❌ Cart icon NOT shown in navbar (for residents with apartments)

2. Navigate to `/apartments/:id`
3. **Expected:**
   - ✅ Full details visible
   - ❌ "Request as Guest" button HIDDEN
   - ❌ "Add to Cart" button HIDDEN
   - ✅ Warning message: "You cannot request apartments as a resident"

### Step 4.3: Verify Backend Blocks Request
1. **Attempt API call** (using Postman or browser console):
   ```javascript
   fetch('http://localhost:5001/api/leases', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer <resident-token>',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       apartmentId: 1,
       type: 'rent'
     })
   })
   ```
2. **Expected:**
   - ❌ Status 403
   - ❌ Error: "Residents and owners cannot create new lease requests"

---

## 🎯 Test Scenario 5: STAFF Cannot Request

### Step 5.1: Login as Building Manager
1. Login: `manager@building.com` / `manager123`

### Step 5.2: Verify Restrictions
1. Navigate to `/marketplace`
2. **Expected:**
   - ✅ View apartment listings
   - ❌ NO "Request" buttons
   - ❌ NO "Cart" buttons
   - ❌ Cart icon hidden

3. Try apartment detail page
4. **Expected:**
   - ✅ View details
   - ❌ Warning: "You cannot request apartments as a building_manager"

### Step 5.3: Verify Staff Can Manage
1. Navigate to `/buildings` or admin panel
2. **Expected:**
   - ✅ Access allowed (staff only)
   - ✅ Can view/manage lease requests
   - ✅ Can approve/reject requests

---

## 🎯 Test Scenario 6: Building Map Integration

### Step 6.1: Navigate to Map
1. Navigate to: `/buildings/map`
2. **Expected:**
   - ✅ 3D building visualization
   - ✅ Clickable apartments

### Step 6.2: View Apartment from Map
1. Click on any apartment
2. **Modal opens** - ApartmentDetailsModal
3. **Expected:**
   - ✅ Basic apartment info displayed
   - ✅ "View Full Details" button visible
   - ✅ "Close" button visible

### Step 6.3: Navigate to Detail Page from Map
1. In modal, click **"View Full Details"**
2. **Expected:**
   - ✅ Navigate to `/apartments/:id`
   - ✅ Full apartment page loads
   - ✅ All request/cart actions available (based on role)

---

## 🎯 Test Scenario 7: Edge Cases & Validation

### Test 7.1: Guest - Missing Contact Info
1. As guest, click "Request Rent"
2. **Leave email blank**
3. Click submit
4. **Expected:**
   - ❌ Validation error: "Please enter a valid email"
   - ❌ Form not submitted

### Test 7.2: Duplicate Cart Items
1. As user, add Apartment A to cart (rent)
2. Try to add Apartment A again (rent)
3. **Expected:**
   - ❌ Error toast: "Apartment already in cart" or similar
   - ✅ Cart count stays same

### Test 7.3: Occupied Apartment
1. Find an apartment with status = "occupied"
2. Try to request it
3. **Expected:**
   - ❌ Error: "Apartment already occupied"
   - ❌ Request not created

### Test 7.4: Apartment Not Listed
1. Find apartment with isListedForRent = false, isListedForSale = false
2. Try to request it
3. **Expected:**
   - ❌ Error: "Apartment is not listed for rent/sale"

### Test 7.5: Empty Cart Checkout
1. Clear all cart items
2. Try to click "Checkout"
3. **Expected:**
   - ❌ Error toast: "No items selected for checkout"

---

## ✅ Checklist Summary

### Backend API Tests
- [ ] `POST /api/leases` - Create request (guest with contact info)
- [ ] `POST /api/leases` - Create request (user with userId)
- [ ] `POST /api/leases` - BLOCKED for resident/owner/staff (403)
- [ ] `POST /api/cart` - Add to cart (user only)
- [ ] `POST /api/cart/checkout` - Create multiple lease requests
- [ ] `PATCH /api/leases/:id/decide` - Approve (manager)
- [ ] `PATCH /api/leases/:id/owner-decision` - Approve (owner)
- [ ] Approval flow: owner → manager (rent)
- [ ] Approval flow: manager only (buy)
- [ ] Account creation (guest → resident)
- [ ] Role upgrade (user → resident)

### Frontend UI Tests
- [ ] Marketplace - Guest view (request buttons only)
- [ ] Marketplace - User view (request + cart buttons)
- [ ] Marketplace - Resident view (no action buttons)
- [ ] Marketplace - Staff view (no action buttons)
- [ ] Apartment Detail - Guest actions
- [ ] Apartment Detail - User actions
- [ ] Apartment Detail - Resident/Staff restrictions
- [ ] Cart - Add items
- [ ] Cart - Modify items (duration, selection)
- [ ] Cart - Checkout flow
- [ ] Building Map - View apartment modal
- [ ] Building Map - Navigate to detail page
- [ ] Navbar - Cart icon visibility (user only)
- [ ] Modals - GuestLeaseRequestModal validation
- [ ] Modals - AddToCartModal

### Role-Based Access
- [ ] Guest: Browse ✅ | Request ✅ | Cart ❌
- [ ] User: Browse ✅ | Request ✅ | Cart ✅
- [ ] Resident: Browse ✅ | Request ❌ | Cart ❌
- [ ] Owner: Browse ✅ | Request ❌ | Cart ❌ | Approve ✅
- [ ] Staff: Browse ✅ | Request ❌ | Cart ❌ | Manage ✅

---

## 🐛 Known Issues to Watch

1. **Rate Limiting**: If testing rapidly, may hit rate limits. Check `NODE_ENV=development` in `.env`
2. **Token Expiry**: JWT tokens may expire, need to re-login
3. **Database State**: After approving requests, apartments become occupied - need to reset DB or use different apartments
4. **Email**: Guest account creation emails not actually sent (need to implement email service)

---

## 📊 Expected Results Summary

| Role | Marketplace Request | Cart | Detail Page Request | Checkout | Approve |
|------|-------------------|------|-------------------|----------|---------|
| Guest | ✅ Modal | ❌ | ✅ Modal | ❌ | ❌ |
| User | ✅ Modal | ✅ | ✅ Modal | ✅ | ❌ |
| Resident | ❌ | ❌ | ❌ | ❌ | ❌ |
| Owner | ❌ | ❌ | ❌ | ❌ | ✅ (own apartments) |
| Staff | ❌ | ❌ | ❌ | ❌ | ✅ (all) |

---

## 🚀 Quick Test Commands

```bash
# Backend - Check logs for lease requests
cd backend && npm run dev
# Watch for: "🔔 NEW GUEST LEASE REQUEST" and "✨ USER ROLE UPGRADED"

# Frontend - Open dev tools console
# Check for API errors, cart state changes

# Database - Check lease requests
# Use database GUI or:
mysql -u root -p
USE building_management;
SELECT id, userId, type, status, contactEmail FROM LeaseRequests ORDER BY createdAt DESC LIMIT 10;

# Check user role upgrades
SELECT id, email, roleId FROM Users WHERE email LIKE '%test%';
```

---

**Happy Testing! 🎉**
