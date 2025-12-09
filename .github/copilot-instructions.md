# Copilot Instructions - Modern Software Engineering Labs

## Project Overview
Multi-lab repository for Modern Software Engineering course (HCMUTE). Each lab is independent with distinct architectures—**do not mix patterns between labs**. Current active labs: lab02 (MongoDB CRUD), lab03 (TypeScript port), lab04 (React+Express), lab05 (Building Management), lab07 (Cart Component), my-portfolio (React+Vite).

## Architecture Patterns by Lab

### lab02_mongo_crud - Express + MongoDB + EJS
- **Stack**: Express.js, MongoDB/Mongoose, EJS templates
- **Pattern**: Traditional server-side rendering with MVC
- **Entry**: `src/server.js` → `src/routes/` → `src/controllers/` → `src/models/`
- **Views**: EJS templates in `src/views/` with partials in `src/views/partials/`
- **File uploads**: Multer to `public/uploads/`, configurable via `UPLOAD_DIR` and `UPLOAD_URL` env vars
- **Seeder**: `src/seed/seedRolesPositions.js` initializes roles and positions

### lab03_typescript - TypeScript Express + MongoDB
- **Stack**: TypeScript, Express.js, MongoDB, EJS
- **Pattern**: Port of lab02 with static typing
- **Build**: `npm run build` compiles to `dist/`, run with `npm run dev` (ts-node-dev)
- **Key difference**: Type definitions in models, controllers use TypeScript interfaces
- **Note**: Same seeding approach as lab02, converted to `.ts`

### lab04_fullstack_react_express - Full-Stack Authentication System
- **Stack**: React (frontend), Express + MySQL/Sequelize (backend)
- **Architecture**: Separated client/server with JWT authentication
- **Backend**: `backend/src/` - Express API with Sequelize ORM, JWT auth
- **Frontend**: `frontend/src/` - React with react-router-dom, react-hook-form
- **Auth flow**: JWT tokens → LocalStorage → Axios interceptors for API calls
- **Security**: bcryptjs, helmet, express-rate-limit, express-validator
- **Ports**: Backend :5001, Frontend :3000

### lab05_ManageBuilding - Enterprise Building Management System
- **Stack**: React + Vite (frontend), Express + MySQL/Sequelize (backend)
- **Architecture**: 4-layer security + role-based access control + hierarchical data model
- **Data model hierarchy**: Block → Building → Floor → Apartment → HouseholdMember
- **Security layers**:
  1. Rate limiting (`middleware/rateLimiter.js`)
  2. Helmet security headers with CSP
  3. Input validation (`middleware/validation.js`, express-validator)
  4. JWT auth + role-based authorization (`middleware/auth.js`)

**Key conventions**:
- **Roles**: Admin, BuildingManager, Resident, Security, Technician, Accountant, User (base)
- **Seeder**: Run `npm run seed` (backend) to initialize DB with 10 buildings (S.01-S.10), apartments, users
- **Sample accounts**: See `lab05_ManageBuilding/README.md` - admin@building.com/admin123, manager@building.com/manager123, etc.
- **Frontend**: Vite dev server (`npm run dev`), uses `@heroicons/react`, Tailwind CSS
- **Backend**: Express API (`npm run dev` with nodemon), port :5000 or :5001
- **3D UI**: `InteractiveBuildingMap.jsx` uses CSS 3D transforms, custom styles in `styles/InteractiveBuildingMap.css`
- **Search**: Fuzzy search with `fuse.js` at `/api/apartments/search` (auth required, filters by blockId/buildingId/status/type/bedrooms/area/rent)
- **GraphQL**: Apollo Server at `/graphql` for cart operations
  - Schema: `backend/src/graphql/cart.schema.js` - CartItem, CheckoutResult types
  - Resolvers: `backend/src/graphql/cart.resolvers.js` - myCart query, checkoutCart mutation
  - Context: JWT auth from Authorization header, returns user object
  - Playground: Enabled in development for testing queries/mutations

**Building management workflow**:
```javascript
// Backend API hierarchical pattern
GET /api/blocks → list all blocks
GET /api/blocks/:id/buildings → buildings in block
GET /api/buildings/:id/floors → floors in building  
GET /api/floors/:id/apartments → apartments on floor
GET /api/buildings/:buildingId/apartments → all apartments in building (flat)
```

**Frontend routing**:
- `/login` - Auth with role-specific redirects
- `/dashboard` - Role-based dashboard
- `/buildings/map` - Interactive 3D building visualization (public access with optionalAuth)
- `/marketplace` - Browse apartments (guest access, shows request buttons instead of cart for unauthenticated)
- `/cart` - Shopping cart for authenticated users
- `/my-requests` - Track lease requests
- Protected routes check `user.role` from AuthContext

**Auth middleware patterns** (critical for lab05):
- `authMiddleware` - Strict JWT check, returns 401 if missing/invalid
- `optionalAuth` - Allows both guest and authenticated access (sets `req.user` if token present)
- `requireRole(['Admin', 'BuildingManager'])` - Role-based access control
- **Common bug**: Using `optionalAuth` + `requireRole` together blocks all non-managers → use `authMiddleware` alone for public authenticated routes

**Lease request workflow (UPDATED with Cart Integration)**:
- **Guest/User**: Submit lease request → Manager approves → **Auto-creates Cart item** (user can't manually add)
- **Cart**: View approved apartments → Select items → Checkout via GraphQL mutation
- **Checkout**: Payment processing → User upgraded to resident → Apartment status updated → Cart cleared
- **Controllers**: `lease.controller.js` auto-creates Cart on approval, `cart.service.js` handles checkout with transactions
- **GraphQL**: Cart operations at `/graphql` - queries (myCart, cartSummary), mutations (toggleSelection, selectAll, checkoutCart)
- **Images**: Each apartment has 3-5 unique images (Unsplash URLs) stored in `apartment.images` JSON field

### lab07_CartComponent - Reusable Cart UI Library
- **Purpose**: Standalone React component library for apartment rental/purchase cart
- **Components**: Button, TextInput, Card, CartItemCard, CartSummary
- **Hook**: `useCart.js` manages cart state (add, remove, update quantities)
- **Styling**: Plain CSS in `styles.css`, no framework dependencies
- **Usage**: Import from `src/index.js`, apply `styles.css`

### my-portfolio - Personal Portfolio Site
- **Stack**: React 19 + Vite
- **Purpose**: Portfolio showcase project (separate from labs)
- **Build**: Standard Vite React template with ESLint

## Development Workflows

### Starting projects
```bash
# lab02/03: MongoDB projects
npm install
npm start  # or npm run dev

# lab04/05: Full-stack projects  
cd backend && npm install && npm run dev  # backend on :5001
cd frontend && npm install && npm run dev # frontend on :3000 (lab04) or Vite port (lab05)

# lab05 only: Seed database first
cd backend && npm run seed
```

### Database patterns
- **MongoDB (lab02/03)**: Mongoose models, connect via `connectDB()` from `config/db.js`
- **MySQL (lab04/05)**: Sequelize models with associations in `models/index.js`
  - Lab05 uses hierarchical foreign keys: `blockId` → `buildingId` → `floorId` → `apartmentId`
  - Association pattern: `belongsTo`/`hasMany` with `as` aliases for clear relationships

### Authentication patterns
**lab04/05 (JWT)**:
- Backend generates JWT in `/api/auth/login`, stored in frontend LocalStorage
- Frontend: `AuthContext` manages user state, axios interceptors add `Authorization: Bearer <token>`
- Protected routes: Backend middleware checks `req.headers.authorization`
- Role checks: `requireRole(['Admin', 'BuildingManager'])` middleware

### Frontend state management
- **lab04**: React useState/useEffect, Context API for auth
- **lab05**: React Context (`AuthContext.jsx`), react-hot-toast for notifications
- **lab07**: Custom `useCart` hook, no external state management

### File upload conventions
- **lab02**: Multer middleware, files to `public/uploads/`
- **lab04/05**: Multer with file type/size restrictions, serve via Express static middleware

## Code Style & Conventions

### Component patterns (React labs)
```jsx
// Preferred functional component structure
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  const handleEvent = () => {
    // handlers before return
  };
  
  return (/* JSX */);
};
```

### API controller pattern (Express labs)
```javascript
// Standard controller structure
const controllerName = async (req, res) => {
  try {
    // 1. Validate input (express-validator results)
    // 2. Database operation
    // 3. Return response
    res.status(200).json({ success: true, data });
  } catch (error) {
    // Error handling via errorHandler middleware
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Sequelize association pattern (lab04/05)
```javascript
// In models/index.js - always define both sides
Model1.belongsTo(Model2, { foreignKey: 'model2Id', as: 'model2' });
Model2.hasMany(Model1, { foreignKey: 'model2Id', as: 'model1s' });
```

## Common Pitfalls

1. **Lab05 hierarchical queries**: Always include block when querying buildings, building when querying floors, etc. Use Sequelize `include` for associations with proper `as` aliases.

2. **Lab05 Sequelize transaction errors**: Import sequelize from `config/database.js`, NOT from `models/index.js`. The models index only exports model classes.
   ```javascript
   // ❌ WRONG
   const { sequelize } = require('../models');
   
   // ✅ CORRECT
   const { sequelize } = require('../config/database');
   ```

3. **Lab05 auth middleware confusion**: 
   - Use `optionalAuth` for public guest + authenticated access (marketplace, map)
   - Use `authMiddleware` for authenticated-only routes
   - **Don't combine** `optionalAuth` + `requireRole` - causes 403 for all non-managers
   - Fixed in BUG_FIXES_DEC_9.md

4. **Lab05 3D CSS**: Don't use inline Tailwind for 3D transforms—use classes from `InteractiveBuildingMap.css` (`perspective-1500`, `transform-gpu`, etc.)

5. **Lab04/05 token conflicts**: Use lab-specific token keys in LocalStorage to avoid cross-lab auth issues

6. **Lab02/03 MongoDB**: Use `async/await` with Mongoose, not callbacks

7. **Frontend API calls**: Always handle loading states and errors with try/catch. Lab05 `api.js` has network error handling to prevent UI crashes when server is down.

8. **Sequelize Op import**: Import `Op` from sequelize package directly:
   ```javascript
   const { Op } = require('sequelize');
   ```

9. **Lab05 role checks**: LeaseRequest controller blocks staff roles (admin, building_manager, security, technician, accountant) AND existing residents/owners from creating new requests.

## Testing & Debugging

### Backend debugging
```bash
# Check database connection
# lab02/03: MongoDB connection logs in console
# lab04/05: Sequelize sync logs show table creation

# Test auth endpoints
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@building.com","password":"admin123"}'
```

### Frontend debugging
- React DevTools for component state
- Network tab for API calls (check JWT in Authorization header)
- Console logs: AuthContext shows auth initialization flow

## File Structure Reference

```
lab05_ManageBuilding/          # Most complex lab - reference for patterns
├── backend/
│   ├── src/
│   │   ├── config/            # database.js - Sequelize config
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # auth.js, rateLimiter.js, validation.js
│   │   ├── models/            # Sequelize models + associations in index.js
│   │   ├── routes/            # Express routes
│   │   ├── seeders/           # index.js - sample data generator
│   │   └── server.js          # Entry point with security middleware
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── contexts/          # AuthContext.jsx
    │   ├── pages/             # Route components
    │   │   └── buildings/     # InteractiveBuildingMap.jsx - 3D visualization
    │   ├── services/          # api.js - axios instance with interceptors
    │   └── styles/            # Component-specific CSS
    └── package.json
```
