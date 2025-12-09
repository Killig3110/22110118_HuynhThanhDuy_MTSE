# 🧪 CART & CHECKOUT TEST FLOW

## 📦 Tổng Quan Logic Mới

**Cart System**: Giỏ hàng tự động được tạo khi LeaseRequest được approve bởi Manager. User chỉ cần select items và checkout để thanh toán.

```
Guest/User → LeaseRequest → Approve → Auto Cart Item → Checkout → Payment → Resident
```

---

## 🚀 CÀI ĐẶT & KHỞI ĐỘNG

### 1. Backend Setup

```bash
cd lab05_ManageBuilding/backend

# Install dependencies (nếu chưa có)
npm install

# Seed database với sample data + unique apartment images
npm run seed

# Start backend server
npm run dev
```

**Expected Output:**
```
✅ Database connected successfully
✅ Database models synchronized  
🚀 Server running on port 5000
🎮 GraphQL Playground: http://localhost:5000/graphql
```

### 2. Frontend Setup

```bash
cd lab05_ManageBuilding/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected**: Frontend chạy trên `http://localhost:3000` hoặc Vite port

---

## 🧪 TEST SCENARIO 1: GUEST REQUEST → CART → CHECKOUT

### Step 1: Tạo Lease Request (Guest - chưa login)

1. **Mở browser** (incognito mode)
2. Navigate to: `http://localhost:3000/marketplace`
3. **Chọn một căn hộ** có status `available` và `isListedForRent` = true
4. Click **"Request Rent"** hoặc **"Request Buy"**
5. **Fill form** với thông tin guest:
   ```
   Name: Nguyen Van A
   Email: nguyenvana@test.com
   Phone: 0901234567
   Type: rent (hoặc buy)
   Start Date: 2025-12-10
   End Date: 2026-12-10
   Note: I want to rent this apartment
   ```
6. Click **Submit**

**Expected Result:**
- ✅ LeaseRequest created với status = `pending`
- ✅ Message: "Request submitted successfully"
- ✅ Backend console log hiển thị request details

---

### Step 2: Manager Approve Request

1. **Login as Manager:**
   ```
   Email: manager@building.com
   Password: manager123
   ```

2. **Navigate to:** `/lease-requests` hoặc `/dashboard` → Lease Requests tab

3. **Find the request** từ `nguyenvana@test.com`

4. Click **"Approve"** button

**Expected Result:**
- ✅ LeaseRequest status → `approved`
- ✅ **TỰ ĐỘNG tạo User account** cho guest:
  - Email: nguyenvana@test.com
  - Role: `user` (chưa phải resident)
  - Password: `Temp123!` (temporary)
- ✅ **TỰ ĐỘNG tạo Cart item**:
  - userId: new user ID
  - apartmentId: từ request
  - mode: `rent` hoặc `buy`
  - selected: `true` (default)
  - months: calculated from dates
- ✅ Backend console logs:
  ```
  ✨ USER ROLE UPGRADED: { ... }
  🛒 CART ITEM AUTO-CREATED: { ... }
  ```

---

### Step 3: User Login & View Cart

1. **Logout manager** (nếu đang login)

2. **Login as new user:**
   ```
   Email: nguyenvana@test.com
   Password: Temp123!
   ```

3. **Navigate to:** `/cart`

**Expected Result:**
- ✅ Cart page hiển thị **1 apartment** đã được approve
- ✅ Apartment details:
  - Apartment number, type, area
  - Monthly rent / Sale price
  - Building, floor info
  - **Unique images** (3-5 images khác nhau)
  - Checkbox: **selected = true** (default)
- ✅ Cart Summary:
  - Selected items: 1
  - Total amount: (rent × months) hoặc sale price
  - Checkout button: **enabled**

---

### Step 4: Checkout Payment

1. Trong Cart page, **verify item is selected** (checkbox ticked)

2. Click **"Checkout"** button

3. **Checkout Modal opens:**
   - Payment method selection (cash, bank_transfer, credit_card, etc.)
   - Note field (optional)

4. **Select payment method**: `bank_transfer`

5. Click **"Confirm Payment"**

**Expected Result - GraphQL Mutation:**
```graphql
mutation {
  checkoutCart(input: {
    paymentMethod: "bank_transfer"
    note: "Payment for apartment"
  }) {
    success
    message
    payments {
      id
      transactionId
      amount
      status
    }
    completedApartments {
      id
      apartmentNumber
    }
    userRole
  }
}
```

**Expected Response:**
- ✅ `success: true`
- ✅ `message: "Successfully completed checkout for 1 apartment(s)"`
- ✅ `payments`: Array with 1 payment record
  - `status: "successful"`
  - `transactionId: "TXN-xxxxx"`
- ✅ `userRole: "resident"` ← **User upgraded!**

**Database Changes:**
- ✅ **Payment** record created
- ✅ **Apartment** status → `occupied` (rent) hoặc `sold` (buy)
- ✅ **Apartment** `tenantId` → user ID (rent) hoặc `ownerId` → user ID (buy)
- ✅ **User** role → `resident`
- ✅ **HouseholdMember** created with `relationship: "tenant"` or `"owner"`
- ✅ **LeaseRequest** status → `completed`
- ✅ **Cart** item deleted (cleared after checkout)

---

### Step 5: Verify Post-Checkout

1. **Cart page** should be empty now (items cleared)

2. **Check user profile/dashboard:**
   - Role badge: **"Resident"**

3. **Navigate to:** `/my-apartments`
   - ✅ Apartment hiển thị trong "My Apartments" list
   - ✅ **Unique images** cho apartment

4. **Backend verification:**
   ```bash
   # Check Payment table
   SELECT * FROM payments ORDER BY id DESC LIMIT 1;
   
   # Check Apartment
   SELECT id, apartmentNumber, status, tenantId, ownerId FROM apartments WHERE id = ?;
   
   # Check User role
   SELECT u.id, u.email, r.name FROM Users u JOIN Roles r ON u.roleId = r.id WHERE u.email = 'nguyenvana@test.com';
   ```

---

## 🧪 TEST SCENARIO 2: USER (ĐÃ CÓ TÀI KHOẢN) REQUEST

### Step 1: Login as User

```
Email: user@building.com
Password: user123
```

### Step 2: Create Lease Request

1. Navigate: `/marketplace`
2. Select apartment → Request Rent/Buy
3. Form auto-fills user info
4. Submit request

### Step 3: Manager Approve

1. Login as manager
2. Approve request

**Expected:**
- ✅ NO new user account created (user already exists)
- ✅ Cart item auto-created for existing user
- ✅ User role stays `user` (chưa phải resident cho đến khi checkout)

### Step 4: User Checkout

1. Login lại as user
2. View cart → Select item → Checkout
3. Complete payment

**Expected:**
- ✅ User role upgraded → `resident`
- ✅ Same flow như guest scenario

---

## 🧪 TEST SCENARIO 3: MULTIPLE APARTMENTS IN CART

### Setup: Tạo multiple lease requests

1. Create **3 lease requests** for different apartments
2. Manager approve **all 3**

**Expected:**
- ✅ User cart có **3 items**

### Selective Checkout

1. View cart
2. **Deselect** 1 item (uncheck checkbox)
3. **Keep selected**: 2 items
4. Click checkout

**Expected:**
- ✅ Only **2 apartments** are checked out
- ✅ 2 payment records created
- ✅ **1 item remains in cart** (the unselected one)
- ✅ User role → `resident` after first checkout

---

## 🎮 GRAPHQL PLAYGROUND TESTING

### Open GraphQL Playground
```
http://localhost:5000/graphql
```

### Set Authorization Header
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Query 1: Get Cart

```graphql
query GetMyCart {
  myCart {
    items {
      id
      apartmentId
      code
      title
      type
      mode
      months
      price
      selected
      block
      building
      floor
      apartment {
        apartmentNumber
        images
      }
    }
    summary {
      rentTotal
      buyTotal
      grandTotal
      selectedCount
      totalItems
    }
  }
}
```

### Mutation 1: Toggle Selection

```graphql
mutation ToggleSelection {
  toggleCartItemSelection(id: "1", selected: false) {
    id
    selected
  }
}
```

### Mutation 2: Select All

```graphql
mutation SelectAll {
  selectAllCartItems(selected: true) {
    id
    selected
  }
}
```

### Mutation 3: Checkout

```graphql
mutation Checkout {
  checkoutCart(input: {
    paymentMethod: "bank_transfer"
    note: "Payment for apartments"
  }) {
    success
    message
    payments {
      id
      transactionId
      amount
      status
      paymentMethod
    }
    completedApartments {
      id
      apartmentNumber
      type
      status
    }
    userRole
  }
}
```

---

## ✅ VERIFICATION CHECKLIST

### Backend Verifications

- [ ] GraphQL server running at `/graphql`
- [ ] Apollo Playground accessible
- [ ] Cart auto-created when lease approved
- [ ] Checkout mutation works
- [ ] Payment records created
- [ ] Apartment status updated
- [ ] User role upgraded to resident
- [ ] Cart cleared after checkout
- [ ] HouseholdMember created
- [ ] LeaseRequest marked as completed

### Database Verifications

```sql
-- Check cart items
SELECT c.*, a.apartmentNumber, u.email 
FROM carts c 
JOIN apartments a ON c.apartmentId = a.id
JOIN Users u ON c.userId = u.id;

-- Check payments
SELECT p.*, a.apartmentNumber, u.email
FROM payments p
JOIN apartments a ON p.apartmentId = a.id
JOIN Users u ON p.receivedBy = u.id
ORDER BY p.createdAt DESC;

-- Check household members
SELECT hm.*, a.apartmentNumber, u.email
FROM HouseholdMembers hm
JOIN apartments a ON hm.apartmentId = a.id
JOIN Users u ON hm.userId = u.id;

-- Check apartment images (should be unique)
SELECT id, apartmentNumber, type, images 
FROM apartments 
WHERE images IS NOT NULL;
```

### Frontend Verifications

- [ ] Cart page displays items correctly
- [ ] Apartment images are unique (different per apartment)
- [ ] Cart summary calculates correctly
- [ ] Checkout button enabled when items selected
- [ ] Checkout modal opens and works
- [ ] Success message after checkout
- [ ] Cart cleared after successful checkout
- [ ] User role badge updated to "Resident"
- [ ] My Apartments page shows purchased/rented apartments

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: GraphQL Playground not accessible
**Fix:** Check Apollo Server is mounted correctly in `server.js`

### Issue 2: Cart not auto-created after approval
**Fix:** Check `lease.controller.js` - ensure Cart.create() is called in transaction

### Issue 3: Checkout fails with transaction error
**Fix:** Verify sequelize import from `config/database.js` NOT `models/index.js`

### Issue 4: User role not upgraded
**Fix:** Check Role table has `resident` role, verify role upgrade logic in cart.service.js

### Issue 5: All apartments show same image
**Fix:** Run `npm run seed` again - images field added to Apartment model

### Issue 6: Authorization error in GraphQL
**Fix:** Ensure JWT token in Authorization header: `Bearer <token>`

---

## 📸 APARTMENT IMAGES VERIFICATION

Each apartment should have **3-5 unique images** based on type:

- **Studio**: Modern compact apartments
- **1BHK**: Small family apartments
- **2BHK**: Medium apartments with living room
- **3BHK**: Large family apartments

**Test:**
1. Open apartment detail page
2. Check image carousel/gallery
3. Verify images are different between apartments
4. Images loaded from Unsplash CDN

---

## 📊 EXPECTED CONSOLE LOGS

### When Lease Approved:
```
✨ USER ROLE UPGRADED: {
  userId: 123,
  email: 'nguyenvana@test.com',
  oldRole: 'user',
  newRole: 'resident',
  reason: 'Lease request approved',
  leaseId: 456,
  apartmentNumber: '1001',
  timestamp: '2025-12-09T...'
}

🛒 CART ITEM AUTO-CREATED: {
  userId: 123,
  apartmentId: 789,
  apartmentNumber: '1001',
  mode: 'rent',
  months: 12,
  leaseRequestId: 456,
  timestamp: '2025-12-09T...'
}
```

### When Checkout Successful:
```
💳 CHECKOUT COMPLETED: {
  userId: 123,
  itemsProcessed: 2,
  totalAmount: 24000,
  newRole: 'resident',
  transactionIds: ['TXN-...', 'TXN-...']
}
```

---

## 🎯 SUCCESS CRITERIA

✅ **Workflow Complete** khi:

1. Guest có thể tạo lease request
2. Manager approve → Cart auto-created
3. User login → Xem cart với apartment đã approve
4. User select items → Checkout thành công
5. Payment record được tạo
6. Apartment status cập nhật
7. User role nâng lên resident
8. Cart được clear sau checkout
9. Apartment có unique images (khác nhau mỗi căn)
10. GraphQL API hoạt động đầy đủ

---

**🚀 HAPPY TESTING!**
