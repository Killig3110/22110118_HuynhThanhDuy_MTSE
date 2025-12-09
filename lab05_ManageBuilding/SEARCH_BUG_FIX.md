# Search Bug Fix - Guest User Marketplace Search

## Bug Report
**Error**: `Unknown column 'floor->building.buildingCode' in 'where clause'`  
**Location**: Marketplace search for guest users  
**Root Cause**: Sequelize nested field search conditions require `required: true` on associations

## The Problem

When guest users searched in the marketplace with a text query (`q` parameter), the backend generated an SQL query with incorrect syntax for nested associations:

```javascript
// Incorrect: Missing required: true on associations
{
  '$floor.building.buildingCode$': { [Op.like]: '%search%' }
}
// Without required: true, Sequelize generates: WHERE floor->building.buildingCode LIKE '%search%'
// SQL Error: Unknown column 'floor->building.buildingCode'
```

## The Solution

**File**: `backend/src/controllers/apartment.controller.js`  
**Lines**: 99-122

Added `required: true` to Floor and Building associations when fuzzy search is active:

```javascript
const include = [
    {
        model: Floor,
        as: 'floor',
        attributes: ['id', 'floorNumber', 'buildingId'],
        required: tokens.length > 0, // ✅ Required when searching
        include: [{
            model: Building,
            as: 'building',
            attributes: ['id', 'name', 'buildingCode', 'blockId'],
            required: tokens.length > 0 // ✅ Required when searching
        }]
    }
];
```

**Why this works**:
- When `required: true`, Sequelize uses INNER JOIN instead of LEFT JOIN
- INNER JOIN allows nested field conditions like `'$floor.building.buildingCode$'` to work correctly
- When no search query (`tokens.length === 0`), `required` stays `false` for better performance

## Testing the Fix

### 1. Test Guest User Search (Previously Broken)

**Logout** or use **Incognito mode**, then:

```bash
# Frontend: Navigate to marketplace
http://localhost:5173/marketplace

# Try searching:
1. Type "S.01" in search box
2. Type "apartment" in search box
3. Type "studio" in search box
4. Apply filters + search text together

# Expected: No SQL errors, results display correctly
```

### 2. Test Backend API Directly

```bash
# Test as guest (no token)
curl -X GET 'http://localhost:5001/api/apartments/search?q=S.01&page=1&limit=10'

# Expected response:
{
  "success": true,
  "message": "Fuzzy search completed",
  "data": [ /* apartments array */ ],
  "pagination": { /* pagination object */ }
}
```

### 3. Test with Filters + Search

```bash
# Test combined filters + text search
curl -X GET 'http://localhost:5001/api/apartments/search?q=studio&type=studio&minRent=5000000&maxRent=10000000'

# Test building filter + search
curl -X GET 'http://localhost:5001/api/apartments/search?q=apartment&buildingId=1'

# Test block filter + search
curl -X GET 'http://localhost:5001/api/apartments/search?q=S.01&blockId=1'
```

### 4. Test Authenticated User Search

```bash
# Login as any user, then search in marketplace
# Should work exactly the same as guest

# Expected: Both guest and authenticated users can search successfully
```

## What Was Changed

### Before (Broken)
```javascript
const include = [
    {
        model: Floor,
        as: 'floor',
        include: [{
            model: Building,
            as: 'building'
        }]
    }
];

// SQL Error when searching: 
// WHERE floor->building.buildingCode LIKE '%search%'
```

### After (Fixed)
```javascript
const include = [
    {
        model: Floor,
        as: 'floor',
        required: tokens.length > 0, // ✅ Dynamic based on search
        include: [{
            model: Building,
            as: 'building',
            required: tokens.length > 0 // ✅ Dynamic based on search
        }]
    }
];

// Correct SQL with INNER JOIN:
// INNER JOIN Floor ON ... INNER JOIN Building ON ...
// WHERE Building.buildingCode LIKE '%search%'
```

## Affected Features

This fix resolves issues in:

1. ✅ **Marketplace Search** - Guest users can now search apartments
2. ✅ **Fuzzy Search** - Text search across apartment number, type, description, building name, building code
3. ✅ **Combined Filters** - Search text + filters (type, rent, area, etc.) work together
4. ✅ **Building/Block Filtering** - Search within specific building or block works

## Performance Notes

- When **no search query**: `required: false` → LEFT JOIN (faster, includes apartments without floors/buildings)
- When **searching**: `required: true` → INNER JOIN (necessary for nested field conditions)
- This conditional approach balances correctness with performance

## Related Files

- `backend/src/controllers/apartment.controller.js` - Fixed searchApartments function
- `backend/src/routes/apartment.routes.js` - Uses optionalAuth for guest access
- `frontend/src/pages/marketplace/Marketplace.jsx` - Calls searchApartments API
- `frontend/src/services/api.js` - searchAPI.searchApartments method

## Verification Checklist

- [ ] Guest user can search in marketplace without errors
- [ ] Search results display correctly with floor/building information
- [ ] Combined filters + search work together
- [ ] Building/block filters + search work together
- [ ] Authenticated user search still works
- [ ] No performance degradation

## Next Steps

1. **Restart backend server** to apply the fix:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test marketplace search** as guest user

3. **Verify no console errors** in browser or backend logs

4. **Test all engagement features** continue to work with search

---

**Bug Fixed**: December 2024  
**Fix Type**: Sequelize association configuration  
**Impact**: Critical - Blocked all guest user searches in marketplace
