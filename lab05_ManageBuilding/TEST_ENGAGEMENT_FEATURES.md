# Test Guide - Engagement Features (Favorites, Reviews, Views, Stats)

## 📋 Prerequisites

### 1. Database Setup
```bash
cd backend
npm run sync
npm run seed
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Backend should run on http://localhost:5000 or 5001
```

### 3. Start Frontend Server
```bash
cd frontend
npm run dev
# Frontend should run on http://localhost:5173 (Vite default)
```

### 4. Test Accounts
From seeder, use these accounts:

**Admin:**
- Email: `admin@building.com`
- Password: `admin123`

**Building Manager:**
- Email: `manager@building.com`
- Password: `manager123`

**Regular User (for testing):**
- Email: `user@building.com`
- Password: `user123`

**Resident (can review apartments):**
- Email: `resident@building.com`
- Password: `resident123`

---

## 🧪 API Testing with Postman/curl

### A. Favorites API

#### 1. Add to Favorites (Authenticated)
```bash
POST http://localhost:5001/api/favorites/:apartmentId
Headers:
  Authorization: Bearer <token>

# Example
curl -X POST http://localhost:5001/api/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

Expected Response:
{
  "success": true,
  "message": "Added to favorites",
  "isFavorite": true
}
```

#### 2. Remove from Favorites
```bash
DELETE http://localhost:5001/api/favorites/:apartmentId
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "message": "Removed from favorites",
  "isFavorite": false
}
```

#### 3. Get All Favorites (with pagination)
```bash
GET http://localhost:5001/api/favorites?page=1&limit=20
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "apartmentId": 5,
      "createdAt": "2025-12-10T...",
      "apartment": {
        "id": 5,
        "code": "A-101",
        "type": "studio",
        "area": 35,
        "bedrooms": 1,
        "bathrooms": 1,
        "price": 5000000,
        "mode": "rent",
        "images": ["url1", "url2", ...],
        "block": "S.01",
        "building": "Building A",
        "floor": "1"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 25,
    "itemsPerPage": 20
  }
}
```

#### 4. Check Favorite Status
```bash
GET http://localhost:5001/api/favorites/check/:apartmentId
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "isFavorite": true
}
```

### B. Reviews API

#### 1. Create Review (Only tenants/owners)
```bash
POST http://localhost:5001/api/apartments/:id/reviews
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "rating": 5,
  "comment": "Căn hộ rất đẹp và tiện nghi, view tuyệt vời!"
}

Expected Response:
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "apartmentId": 5,
    "userId": 3,
    "rating": 5,
    "comment": "Căn hộ rất đẹp...",
    "createdAt": "2025-12-10T..."
  }
}

Error Cases:
- 403: Not a tenant/owner
- 409: Already reviewed this apartment
- 400: Validation errors (rating 1-5, comment min 10 chars)
```

#### 2. Update Own Review
```bash
PUT http://localhost:5001/api/reviews/:reviewId
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "rating": 4,
  "comment": "Updated comment"
}

Expected Response:
{
  "success": true,
  "message": "Review updated successfully",
  "data": { ... }
}

Error: 403 if not owner of review
```

#### 3. Delete Own Review
```bash
DELETE http://localhost:5001/api/reviews/:reviewId
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### 4. Get Apartment Reviews (Public)
```bash
GET http://localhost:5001/api/apartments/:id/reviews?page=1&limit=10

Expected Response:
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "...",
        "createdAt": "...",
        "userId": 3,
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "url"
        }
      }
    ],
    "avgRating": 4.5,
    "totalReviews": 23
  },
  "pagination": { ... }
}
```

#### 5. Get User's Reviews
```bash
GET http://localhost:5001/api/my-reviews?page=1&limit=10
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "...",
      "apartmentId": 5,
      "apartment": {
        "code": "A-101",
        "type": "studio",
        "images": [...]
      }
    }
  ]
}
```

### C. Views API

#### 1. Track View (with/without auth)
```bash
POST http://localhost:5001/api/apartments/:id/view
Headers:
  Authorization: Bearer <token> (optional)

# Deduplicates within 1 hour per user/IP + apartment

Expected Response:
{
  "success": true,
  "message": "View tracked"
}
```

#### 2. Get Recently Viewed (Authenticated)
```bash
GET http://localhost:5001/api/apartments/recently-viewed?limit=20
Headers:
  Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "apartmentId": 5,
      "viewedAt": "2025-12-10T...",
      "apartment": {
        "id": 5,
        "code": "A-101",
        "type": "studio",
        "area": 35,
        "price": 5000000,
        "mode": "rent",
        "images": [...]
      }
    }
  ]
}
```

### D. Stats API

#### 1. Get Apartment Stats (Public)
```bash
GET http://localhost:5001/api/apartments/:id/stats

Expected Response:
{
  "success": true,
  "data": {
    "buyerCount": 3,         // số người đã thuê/mua
    "reviewCount": 12,       // số lượng reviews
    "avgRating": 4.5,        // điểm TB
    "viewCount": 1234,       // tổng lượt xem
    "favoriteCount": 45      // số người yêu thích
  }
}
```

### E. Similar Apartments API

```bash
GET http://localhost:5001/api/apartments/:id/similar?limit=6

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 7,
      "code": "A-102",
      "type": "studio",
      "area": 38,
      "bedrooms": 1,
      "price": 5200000,
      "mode": "rent",
      "images": [...],
      "block": "S.01",
      "building": "Building A",
      "floor": "1"
    }
  ]
}

# Algorithm:
# - Same type OR same bedrooms
# - Area within ±20%
# - Price within ±30%
# - Same building prioritized
# - Limit 6 results
```

---

## 🖥️ Frontend End-to-End Testing

### Test Scenario 1: Guest User Journey

#### Step 1: Browse Marketplace (No Login)
1. Go to `http://localhost:5173/marketplace`
2. ✅ Verify: See list of apartments
3. ✅ Verify: NO "Recently Viewed" section (guest not tracked with user ID)
4. Click any apartment card

#### Step 2: View Apartment Detail
1. Should navigate to `/apartments/:id`
2. ✅ Verify: View is tracked (backend logs show POST /apartments/:id/view)
3. ✅ Verify: FavoriteButton shows empty heart (not filled)
4. ✅ Verify: ApartmentStats shows correct numbers
5. ✅ Verify: ReviewList displays reviews
6. ✅ Verify: NO ReviewForm (guest can't review)
7. ✅ Verify: SimilarApartments section at bottom
8. Click heart icon → should redirect to `/login`

#### Step 3: Login
1. Go to `/login`
2. Login with `user@building.com / user123`
3. Should redirect to `/home` or `/dashboard`

---

### Test Scenario 2: Authenticated User - Favorites

#### Step 1: Browse Marketplace (Logged In)
1. Go to `/marketplace`
2. ✅ Verify: "Recently Viewed" section appears (shows apartments viewed before)
3. ✅ Verify: Each apartment card has FavoriteButton (top-right)

#### Step 2: Add to Favorites
1. Click heart icon on any apartment card
2. ✅ Verify: Heart turns red (filled)
3. ✅ Verify: Toast message "Đã thêm vào yêu thích"
4. ✅ Verify: Icon updates immediately (optimistic UI)

#### Step 3: Check Favorites Page
1. Click "Yêu thích" in navbar
2. Navigate to `/favorites`
3. ✅ Verify: See grid of favorited apartments
4. ✅ Verify: Each card shows favorite button (red/filled)
5. Click heart on any card → should turn gray (removed)
6. ✅ Verify: Toast "Đã xóa khỏi yêu thích"
7. ✅ Verify: Card disappears from list or reloads

#### Step 4: Empty State
1. Remove all favorites
2. ✅ Verify: Shows empty state with "Chưa có căn hộ yêu thích"
3. ✅ Verify: "Khám phá căn hộ" button → goes to `/marketplace`

---

### Test Scenario 3: Resident - Reviews

#### Step 1: Login as Resident
1. Login with `resident@building.com / resident123`
2. Go to any apartment detail page

#### Step 2: Write Review
1. ✅ Verify: ReviewForm appears (only for tenants/owners)
2. Click stars to select rating (e.g., 5 stars)
3. ✅ Verify: Star color changes to yellow
4. Type comment: "Căn hộ rất tốt, tôi rất hài lòng với chất lượng!"
5. Click "Gửi đánh giá"
6. ✅ Verify: Toast "Đã gửi đánh giá thành công!"
7. ✅ Verify: Form resets (rating 0, comment empty)
8. ✅ Verify: ReviewList updates with new review at top
9. ✅ Verify: ApartmentStats updates (reviewCount +1, avgRating recalculated)

#### Step 3: Edit Own Review
1. Find your review in ReviewList
2. ✅ Verify: Edit and Delete buttons appear (only on own reviews)
3. Click edit icon (pencil)
4. ✅ Verify: Stars and textarea become editable
5. Change rating to 4 stars
6. Update comment
7. Click "Lưu"
8. ✅ Verify: Toast "Đã cập nhật đánh giá"
9. ✅ Verify: Review updates in list

#### Step 4: Delete Review
1. Click delete icon (trash)
2. ✅ Verify: Confirmation dialog "Bạn có chắc muốn xóa đánh giá này?"
3. Click OK
4. ✅ Verify: Toast "Đã xóa đánh giá"
5. ✅ Verify: Review disappears from list
6. ✅ Verify: Stats update (reviewCount -1)

#### Step 5: Duplicate Review Prevention
1. Try to submit another review for same apartment
2. ✅ Verify: Backend returns 409 error
3. ✅ Verify: Toast shows error message

---

### Test Scenario 4: Similar Apartments & View Tracking

#### Step 1: View Tracking
1. Visit apartment A (id=1)
2. ✅ Verify: Backend POST /apartments/1/view logged
3. Visit apartment B (id=2)
4. Visit apartment C (id=3)
5. Go back to `/marketplace`
6. ✅ Verify: "Đã xem gần đây" shows A, B, C (most recent first)

#### Step 2: View Deduplication
1. Visit apartment A again within 1 hour
2. ✅ Verify: No duplicate view entry (check backend logs)
3. Wait >1 hour (or mock time) and visit again
4. ✅ Verify: New view recorded

#### Step 3: Similar Apartments
1. Go to apartment detail (e.g., studio, 35m², 5M VNĐ)
2. Scroll to bottom
3. ✅ Verify: "Căn hộ tương tự" section shows up to 6 apartments
4. ✅ Verify: Similar apartments have:
   - Same type OR same bedrooms
   - Area within ±20% (28-42m² for 35m²)
   - Price within ±30% (3.5M-6.5M for 5M)
5. ✅ Verify: Apartments in same building appear first
6. Click any similar apartment
7. ✅ Verify: Navigates to that apartment's detail page
8. ✅ Verify: New similar apartments load for this apartment

---

### Test Scenario 5: Stats Display

#### Step 1: Apartment Stats Badges
1. Go to any apartment detail
2. ✅ Verify: 4 badges displayed:
   - **Đã thuê/mua**: Shows buyerCount (from HouseholdMember)
   - **Đánh giá**: Shows avgRating★ (reviewCount) or "Chưa có"
   - **Lượt xem**: Shows viewCount (formatted as 1.2k if >1000)
   - **Yêu thích**: Shows favoriteCount
3. ✅ Verify: Icons match (UserGroup, Star, Eye, Heart)
4. ✅ Verify: Colors correct (green, yellow, blue, red backgrounds)

#### Step 2: Stats Update on Actions
1. Add apartment to favorites
2. ✅ Verify: Favorite count increases by 1
3. Submit a review
4. ✅ Verify: Review count increases, avgRating recalculates
5. View apartment (new session)
6. ✅ Verify: View count increases

---

### Test Scenario 6: Pagination

#### Step 1: Favorites Pagination
1. Add >20 apartments to favorites
2. Go to `/favorites`
3. ✅ Verify: Shows "Trang 1 / X" at bottom
4. ✅ Verify: "Trước" button disabled on page 1
5. Click "Sau"
6. ✅ Verify: Goes to page 2
7. ✅ Verify: "Trước" button now enabled

#### Step 2: Reviews Pagination
1. Go to apartment with >10 reviews
2. ✅ Verify: Pagination controls at bottom of ReviewList
3. Click through pages
4. ✅ Verify: Reviews update per page

---

### Test Scenario 7: Error Handling

#### Step 1: Unauthenticated Actions
1. Logout
2. Try to access `/favorites`
3. ✅ Verify: Redirects to `/home`
4. Go to apartment detail
5. Click favorite button
6. ✅ Verify: Redirects to `/login` with toast message

#### Step 2: Non-Tenant Review Attempt
1. Login as regular user (not tenant/owner)
2. Go to apartment detail
3. ✅ Verify: ReviewForm does NOT appear
4. Try POST to `/api/apartments/:id/reviews` via console/Postman
5. ✅ Verify: 403 error "Only tenants or owners can review"

#### Step 3: Network Errors
1. Stop backend server
2. Click favorite button
3. ✅ Verify: Toast error message
4. ✅ Verify: Button reverts to original state (optimistic UI rollback)
5. Try to load favorites page
6. ✅ Verify: Error message displayed

---

## 🎯 Success Criteria Checklist

### Backend API
- [ ] All 15 new endpoints respond correctly
- [ ] Authentication middleware works (401 for missing token)
- [ ] Validation works (400 for invalid data)
- [ ] Tenant/owner check works for reviews (403 for non-tenants)
- [ ] Pagination works correctly
- [ ] Deduplication works (favorites, views)
- [ ] Similar apartments algorithm returns correct results
- [ ] Stats aggregation is accurate

### Frontend Components
- [ ] FavoriteButton: optimistic UI, auth redirect, toast notifications
- [ ] ReviewForm: star rating, validation, form reset after submit
- [ ] ReviewList: display, pagination, edit/delete own reviews
- [ ] ApartmentStats: all 4 badges with correct icons and formatting
- [ ] SimilarApartments: grid layout, navigation works
- [ ] RecentlyViewedSection: horizontal scroll, correct data
- [ ] FavoritesPage: grid, empty state, pagination, remove favorites

### Integration
- [ ] View tracking on apartment detail mount
- [ ] Stats refresh after review submission
- [ ] Favorite status syncs across components
- [ ] Navigation "Yêu thích" link works
- [ ] Routes protected correctly
- [ ] Guest vs authenticated behavior correct

### User Experience
- [ ] Loading states show during API calls
- [ ] Toast notifications for all actions (success/error)
- [ ] Optimistic UI updates feel instant
- [ ] Pagination smooth and intuitive
- [ ] Similar apartments relevant and useful
- [ ] Empty states helpful with CTAs

---

## 📊 Performance Testing

### Load Test (Optional)
1. Add 100+ apartments to favorites → test pagination
2. Create 50+ reviews → test pagination and avg rating calculation
3. Track 1000+ views → test view count display and deduplication

### Concurrency Test
1. Two users favorite same apartment simultaneously
2. Two users submit reviews at same time
3. Verify no duplicate entries created

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot read property 'images' of undefined"
**Fix:** Check apartment data includes all nested relationships (Floor → Building → Block)

### Issue 2: Favorite button not updating
**Fix:** Verify `onToggle` callback is called and state updates in parent component

### Issue 3: Reviews not showing
**Fix:** Check HouseholdMember table has entries for test users

### Issue 4: Similar apartments empty
**Fix:** Seed more apartments with varied types/sizes/prices

### Issue 5: Stats showing 0
**Fix:** Run seeder to create test data (views, favorites, reviews)

---

## ✅ Final Verification

After completing all tests:

1. **Database Check:**
   ```sql
   SELECT COUNT(*) FROM apartment_favorites;
   SELECT COUNT(*) FROM apartment_views;
   SELECT COUNT(*) FROM apartment_reviews;
   ```

2. **API Health:**
   - All endpoints return correct status codes
   - No console errors in backend logs
   - Response times < 500ms

3. **Frontend Health:**
   - No console errors in browser
   - All components render correctly
   - Navigation smooth and responsive

4. **User Satisfaction:**
   - Features intuitive and easy to use
   - Toast messages clear and helpful
   - Loading states prevent confusion

---

## 📝 Test Report Template

```markdown
# Test Report - Engagement Features

**Date:** [Date]
**Tester:** [Name]
**Environment:** Dev

## Test Results

### API Tests (Pass/Fail)
- [ ] Favorites CRUD: ___
- [ ] Reviews CRUD: ___
- [ ] View Tracking: ___
- [ ] Stats Retrieval: ___
- [ ] Similar Apartments: ___

### Frontend Tests (Pass/Fail)
- [ ] Guest Journey: ___
- [ ] Authenticated User: ___
- [ ] Resident Reviews: ___
- [ ] Similar Apartments: ___
- [ ] Stats Display: ___
- [ ] Pagination: ___
- [ ] Error Handling: ___

### Issues Found
1. [Issue description]
2. [Issue description]

### Overall Status
- Total Tests: __
- Passed: __
- Failed: __
- Success Rate: __%
```

---

**Happy Testing! 🚀**
