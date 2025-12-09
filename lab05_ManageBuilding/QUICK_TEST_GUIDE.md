# Quick Test Script - Engagement Features

## 🚀 Quick Start (5 minutes)

### 1. Setup & Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run sync    # Create tables
npm run seed    # Seed data
npm run dev     # Start server (port 5001)

# Terminal 2 - Frontend
cd frontend
npm run dev     # Start Vite (port 5173)
```

### 2. Open Browser
Open: `http://localhost:5173`

---

## ✅ Quick Test Checklist (10 steps)

### Step 1: Guest View Tracking
- [ ] Go to `/marketplace` (no login)
- [ ] Click any apartment → view detail
- [ ] ✅ Page loads with stats, reviews, similar apartments

### Step 2: Login
- [ ] Click "Login" 
- [ ] Use: `user@building.com / user123`
- [ ] ✅ Redirects to dashboard

### Step 3: Add Favorites
- [ ] Go to `/marketplace`
- [ ] ✅ See "Đã xem gần đây" section
- [ ] Click heart ❤️ on 3 apartments
- [ ] ✅ Hearts turn red, toast shows "Đã thêm vào yêu thích"

### Step 4: Check Favorites Page
- [ ] Click "Yêu thích" in navbar
- [ ] ✅ See 3 apartments in grid
- [ ] Click heart on one → should remove it
- [ ] ✅ Toast "Đã xóa khỏi yêu thích"

### Step 5: View Apartment Details
- [ ] Click any apartment card
- [ ] ✅ See 4 stat badges (buyers, reviews, views, favorites)
- [ ] ✅ See review list with ratings
- [ ] ✅ Scroll down → see "Căn hộ tương tự" (6 apartments)

### Step 6: Similar Apartments
- [ ] Click any similar apartment
- [ ] ✅ Navigates to new apartment
- [ ] ✅ New similar apartments load

### Step 7: Login as Resident (Review Test)
- [ ] Logout
- [ ] Login: `resident@building.com / resident123`
- [ ] Go to any apartment detail

### Step 8: Write Review
- [ ] ✅ See ReviewForm (star rating + textarea)
- [ ] Click 5 stars
- [ ] Type: "Căn hộ rất đẹp, tôi rất hài lòng!"
- [ ] Click "Gửi đánh giá"
- [ ] ✅ Toast success
- [ ] ✅ Review appears in list
- [ ] ✅ Stats update (review count +1)

### Step 9: Edit Review
- [ ] Find your review (has edit/delete buttons)
- [ ] Click edit icon ✏️
- [ ] Change to 4 stars, update comment
- [ ] Click "Lưu"
- [ ] ✅ Review updates

### Step 10: Favorite + Stats Integration
- [ ] Add apartment to favorites (heart icon)
- [ ] ✅ Favorite count in stats increases
- [ ] Refresh page
- [ ] ✅ Stats persist correctly

---

## 🎯 Expected Results

### Working Features:
✅ View tracking (guest + authenticated)  
✅ Favorites (add, remove, list)  
✅ Reviews (create, edit, delete - tenant only)  
✅ Stats (4 badges update in real-time)  
✅ Similar apartments (algorithm works)  
✅ Recently viewed section  
✅ Pagination (favorites, reviews)  
✅ Navigation link "Yêu thích"  
✅ Toast notifications  
✅ Optimistic UI updates  

### Error Handling:
✅ Non-authenticated → redirect to login  
✅ Non-tenant tries review → no form shown  
✅ Duplicate review → error message  
✅ Network errors → rollback + toast  

---

## 📊 API Endpoints Quick Test

### Using Browser Console:
```javascript
// Get token from localStorage
const token = localStorage.getItem('token');

// Test favorite
fetch('http://localhost:5001/api/favorites/1', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test stats
fetch('http://localhost:5001/api/apartments/1/stats')
  .then(r => r.json()).then(console.log);

// Test similar
fetch('http://localhost:5001/api/apartments/1/similar')
  .then(r => r.json()).then(console.log);

// Test reviews
fetch('http://localhost:5001/api/apartments/1/reviews')
  .then(r => r.json()).then(console.log);
```

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd backend
npm install
npm run sync
npm run dev
```

### Frontend errors?
```bash
cd frontend
npm install
npm run dev
```

### Database errors?
```bash
# Reset database
cd backend
npm run sync
npm run seed
```

### Token expired?
- Logout and login again
- Check console for 401 errors

---

## ✨ Success Indicators

When everything works:
- ✅ No console errors (backend or frontend)
- ✅ All buttons respond instantly
- ✅ Toast notifications appear
- ✅ Stats update after actions
- ✅ Pagination works smoothly
- ✅ Similar apartments relevant
- ✅ Reviews display with user info
- ✅ Favorites persist after refresh

---

**Total Test Time: ~10 minutes**  
**All 10 steps pass = Feature complete! 🎉**
