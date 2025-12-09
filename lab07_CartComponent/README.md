# Cart UI Component Library for Apartment Rental/Purchase

Thư viện component React đầy đủ cho hệ thống giỏ hàng thuê/mua căn hộ, tích hợp với lab05_ManageBuilding.

## ✨ Features

- ✅ **Dual Mode**: Hỗ trợ cả thuê (rent) và mua (buy) căn hộ
- ✅ **Location Hierarchy**: Hiển thị Block → Building → Floor
- ✅ **Apartment Details**: Bedrooms, bathrooms, balconies, parking, amenities
- ✅ **Financial Breakdown**: Rent, deposit, maintenance fees, grand total
- ✅ **Lease Term Selection**: Slider với min/max validation
- ✅ **Backend Integration**: Sync với REST API và GraphQL
- ✅ **Authentication**: JWT token support
- ✅ **Validation**: Apartment availability checking

## 📦 Components

### Basic Components
- **Button**: Primary, secondary, danger, ghost variants với loading state
- **TextInput**: Input với error/disabled states
- **Card**: Container component với title, actions, footer

### Cart Components
- **CartItemCard**: Hiển thị căn hộ trong giỏ với đầy đủ thông tin
- **CartSummary**: Tổng hợp giá thuê, mua, deposit, maintenance
- **ApartmentDetailCard**: Chi tiết căn hộ trước khi thêm vào cart
- **LeaseTermSelector**: Slider chọn thời hạn thuê (6-36 tháng)
- **PaymentBreakdown**: Phân tích chi tiết thanh toán

### Hook
- **useCart**: Quản lý cart state với backend sync

## 🏗️ Structure

```
lab07_CartComponent/
├── README.md
└── src/
    ├── components/
    │   ├── Button.jsx
    │   ├── TextInput.jsx
    │   ├── Card.jsx
    │   ├── CartItemCard.jsx              ⭐ Enhanced
    │   ├── CartSummary.jsx
    │   ├── ApartmentDetailCard.jsx       🆕 New
    │   ├── LeaseTermSelector.jsx         🆕 New
    │   └── PaymentBreakdown.jsx          🆕 New
    ├── hooks/
    │   └── useCart.js                    ⭐ Enhanced with backend sync
    ├── styles.css                        ⭐ Enhanced
    └── index.js
```

## 🚀 Usage

### Install & Import

```jsx
import { 
  CartItemCard, 
  CartSummary, 
  ApartmentDetailCard,
  LeaseTermSelector,
  PaymentBreakdown,
  useCart 
} from './lab07_CartComponent/src';
import './lab07_CartComponent/src/styles.css';
```

### CartItemCard (Enhanced)

```jsx
<CartItemCard
  // Basic info
  code="S.01-0302"
  title="Luxury 2BHK Apartment"
  type="2bhk"
  area={65}
  price={7500000}
  mode="rent"
  status="for_rent"
  months={12}
  
  // Location hierarchy 🆕
  block="Block S"
  building="Building 01"
  floor="Floor 3"
  
  // Apartment details 🆕
  bedrooms={2}
  bathrooms={2}
  balconies={1}
  parkingSlots={1}
  
  // Amenities 🆕
  amenities={['AC', 'WiFi', 'Gym Access', 'Swimming Pool']}
  
  // Financial details 🆕
  maintenanceFee={500000}
  deposit={15000000}
  
  // Lease terms 🆕
  minLeaseTerm={6}
  maxLeaseTerm={36}
  
  // Handlers
  onMonthsChange={(months) => console.log(months)}
  onRemove={() => console.log('remove')}
  
  // Selection
  selectable={true}
  selected={true}
  onSelectToggle={() => console.log('toggle')}
/>
```

### ApartmentDetailCard (New)

```jsx
<ApartmentDetailCard
  apartment={{
    id: 1,
    apartmentNumber: 'S.01-0302',
    type: '2bhk',
    area: 65,
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    parkingSlots: 1,
    monthlyRent: 7500000,
    salePrice: 1500000000,
    isListedForRent: true,
    isListedForSale: true,
    maintenanceFee: 500000,
    status: 'for_rent',
    description: 'Beautiful apartment with city view',
    amenities: ['AC', 'WiFi', 'Gym'],
    floor: { floorNumber: 3 },
    building: { buildingCode: 'S.01' },
    block: { blockCode: 'S' },
    images: ['/uploads/apt1.jpg']
  }}
  onAddToCart={(cartItem) => {
    console.log('Add to cart:', cartItem);
  }}
  userRole="Resident"
/>
```

### LeaseTermSelector (New)

```jsx
<LeaseTermSelector
  minMonths={6}
  maxMonths={36}
  selectedMonths={12}
  monthlyRent={7500000}
  onSelect={(months) => setMonths(months)}
/>
```

### PaymentBreakdown (New)

```jsx
<PaymentBreakdown
  items={cartItems}
  showDeposit={true}
  showMaintenance={true}
  showTaxes={false}
  taxRate={0.1}
/>
```

### useCart Hook (Enhanced)

```jsx
const { 
  items,           // Cart items array
  addItem,         // Add item with validation
  updateItem,      // Update item
  removeItem,      // Remove item
  toggleSelect,    // Toggle selection
  selectAll,       // Select/deselect all
  clear,           // Clear cart
  syncWithBackend, // Sync with backend 🆕
  validateItem,    // Validate apartment 🆕
  calculateTotal,  // Calculate totals 🆕
  totals,          // { rentTotal, buyTotal, depositTotal, maintenanceTotal, grandTotal, selectedCount }
  loading,         // Loading state 🆕
  error            // Error message 🆕
} = useCart([], {
  apiUrl: '/api/cart',
  authToken: 'your-jwt-token'
});

// Add item with validation
const result = await addItem({
  apartmentId: 1,
  code: 'S.01-0302',
  title: '2BHK Apartment',
  type: '2bhk',
  area: 65,
  price: 7500000,
  mode: 'rent',
  months: 12,
  // ... other fields
});

// Calculate detailed totals
const totals = calculateTotal(item);
// Returns: { subtotal, deposit, maintenance, total, breakdown }

// Sync with backend
await syncWithBackend();
```

## 🔗 Backend Integration

### Lab05 Backend Setup

Tất cả các file backend đã được tạo:

1. **Model**: `lab05_ManageBuilding/backend/src/models/Cart.js`
2. **Service**: `lab05_ManageBuilding/backend/src/services/cart.service.js`
3. **Controller**: `lab05_ManageBuilding/backend/src/controllers/cart.controller.js`
4. **Routes**: `lab05_ManageBuilding/backend/src/routes/cart.routes.js`
5. **GraphQL Schema**: `lab05_ManageBuilding/backend/src/graphql/cart.schema.js`
6. **GraphQL Resolvers**: `lab05_ManageBuilding/backend/src/graphql/cart.resolvers.js`

### REST API Endpoints

```bash
GET    /api/cart           # Get user's cart
GET    /api/cart/summary   # Get cart summary
POST   /api/cart           # Add item to cart
PATCH  /api/cart/:id       # Update cart item
DELETE /api/cart/:id       # Remove item
DELETE /api/cart           # Clear cart
PATCH  /api/cart/:id/select # Toggle selection
POST   /api/cart/select-all # Select all items
```

### GraphQL Operations

```graphql
# Queries
query MyCart {
  myCart {
    items {
      id
      code
      title
      price
      mode
      months
      selected
    }
    summary {
      rentTotal
      buyTotal
      depositTotal
      maintenanceTotal
      grandTotal
      selectedCount
    }
  }
}

# Mutations
mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    id
    code
    title
  }
}

mutation RemoveFromCart($id: ID!) {
  removeFromCart(id: $id)
}
```

## 🎨 Styling

Tất cả components có inline styles mặc định nhưng có thể override bằng:

1. **className prop**: Thêm custom class
2. **CSS classes**: `.bm-cart-card`, `.bm-apartment-detail`, `.bm-lease-term-selector`, `.bm-payment-breakdown`
3. **CSS variables**: Dễ dàng customize colors, spacing

Responsive support cho mobile devices.

## 📊 Data Flow

```
Frontend (lab07)           Backend (lab05)
     │                           │
useCart Hook ────────────→ REST API /api/cart
     │                           │
     │                      cart.controller
     │                           │
     │                      cart.service
     │                           │
     │                       Cart Model
     │                           │
     └─────────────────────→ GraphQL
```

## 🔒 Security

- JWT authentication required
- Input validation on both client and server
- Apartment availability checking
- Price snapshots để tránh thay đổi giá
- Rate limiting on API endpoints

## 📝 Notes

- Components thuần React, không phụ thuộc external CSS framework
- Compatible với lab05_ManageBuilding data structure
- Support both REST API và GraphQL
- Full TypeScript types available (có thể convert)
- Responsive design cho mobile/tablet

## 🚦 Next Steps

1. Chạy database migration để tạo bảng `carts`
2. Import cart routes vào server.js (✅ Done)
3. Setup GraphQL server nếu muốn dùng GraphQL
4. Test API endpoints với Postman/Thunder Client
5. Integrate vào lab05 frontend pages
