# lab05_ManageBuilding - Comprehensive Workflow Diagrams

Tài liệu này tổng hợp tất cả workflows chính của hệ thống lab05_ManageBuilding với Mermaid diagrams.

## 📑 Mục lục

1. [Authentication Flow](#1-authentication-flow)
2. [Lease Request Workflow](#2-lease-request-workflow)
3. [Cart & Checkout Flow](#3-cart--checkout-flow)
4. [Engagement Features Flow](#4-engagement-features-flow)
5. [Search & Filter Flow](#5-search--filter-flow)
6. [3D Building Map Interaction](#6-3d-building-map-interaction)
7. [Role-Based Access Control Flow](#7-role-based-access-control-flow)
8. [Payment Processing Flow](#8-payment-processing-flow)

---

## 1. Authentication Flow

### 1.1 Login & JWT Token Generation

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant API
    participant AuthController
    participant Database
    participant JWTService

    User->>LoginPage: Enter email & password
    User->>LoginPage: Click "Đăng nhập"
    
    LoginPage->>LoginPage: Validate inputs (email format, password length)
    
    alt Validation fails
        LoginPage->>User: Show validation errors
    else Validation passes
        LoginPage->>API: POST /api/auth/login
        API->>AuthController: login(req, res)
        
        AuthController->>Database: Find user by email
        Database-->>AuthController: User data with role
        
        alt User not found
            AuthController-->>API: 401 Unauthorized
            API-->>LoginPage: Error: Invalid credentials
            LoginPage->>User: Show error message
        else User found
            AuthController->>AuthController: Compare password with bcrypt
            
            alt Password incorrect
                AuthController-->>API: 401 Unauthorized
                API-->>LoginPage: Error: Invalid credentials
                LoginPage->>User: Show error message
            else Password correct
                AuthController->>JWTService: Generate access token (15min)
                JWTService-->>AuthController: Access token
                
                AuthController->>JWTService: Generate refresh token (7 days)
                JWTService-->>AuthController: Refresh token
                
                AuthController->>Database: Save refresh token
                Database-->>AuthController: Token saved
                
                AuthController-->>API: 200 OK + tokens + user data
                API-->>LoginPage: Success response
                
                LoginPage->>LoginPage: Store tokens in localStorage
                LoginPage->>LoginPage: Set user in AuthContext
                
                alt User is Admin/Manager
                    LoginPage->>User: Redirect to /dashboard
                else User is Resident/User
                    LoginPage->>User: Redirect to /marketplace
                else User is Security/Technician/Accountant
                    LoginPage->>User: Redirect to role-specific page
                end
            end
        end
    end
```

### 1.2 Protected Route Access with JWT

```mermaid
sequenceDiagram
    participant User
    participant ProtectedPage
    participant AxiosInterceptor
    participant API
    participant AuthMiddleware
    participant Database

    User->>ProtectedPage: Navigate to protected route
    ProtectedPage->>ProtectedPage: Check AuthContext for user
    
    alt No user in context
        ProtectedPage->>User: Redirect to /login
    else User exists
        ProtectedPage->>API: Request protected resource
        
        AxiosInterceptor->>AxiosInterceptor: Intercept request
        AxiosInterceptor->>AxiosInterceptor: Get token from localStorage
        AxiosInterceptor->>API: Add Authorization: Bearer {token}
        
        API->>AuthMiddleware: authMiddleware(req, res, next)
        AuthMiddleware->>AuthMiddleware: Extract token from header
        
        alt No token
            AuthMiddleware-->>API: 401 Unauthorized
            API-->>AxiosInterceptor: 401 response
            AxiosInterceptor->>AxiosInterceptor: Clear localStorage
            AxiosInterceptor->>User: Redirect to /login
        else Token exists
            AuthMiddleware->>AuthMiddleware: Verify JWT with secret
            
            alt Token invalid/expired
                AuthMiddleware-->>API: 401 Unauthorized
                API-->>AxiosInterceptor: 401 response
                
                AxiosInterceptor->>API: POST /api/auth/refresh-token
                API->>Database: Validate refresh token
                
                alt Refresh token valid
                    Database-->>API: New access token
                    API-->>AxiosInterceptor: New tokens
                    AxiosInterceptor->>AxiosInterceptor: Update localStorage
                    AxiosInterceptor->>API: Retry original request
                    API-->>ProtectedPage: Success response
                    ProtectedPage->>User: Display protected content
                else Refresh token invalid
                    API-->>AxiosInterceptor: 401 Unauthorized
                    AxiosInterceptor->>User: Redirect to /login
                end
            else Token valid
                AuthMiddleware->>Database: Load user + role
                Database-->>AuthMiddleware: User data
                AuthMiddleware->>AuthMiddleware: Attach user to req.user
                AuthMiddleware->>API: next()
                API-->>ProtectedPage: Protected resource data
                ProtectedPage->>User: Display content
            end
        end
    end
```

---

## 2. Lease Request Workflow

### 2.1 Complete Lease Request Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant MarketplacePage
    participant API
    participant LeaseController
    participant Database
    participant Manager
    participant CartService

    User->>MarketplacePage: Browse apartments
    User->>MarketplacePage: Click "Request Lease"
    
    MarketplacePage->>API: POST /api/lease-requests
    API->>LeaseController: createLeaseRequest(req, res)
    
    LeaseController->>LeaseController: Check user role
    
    alt User is staff (admin/manager/security/technician/accountant)
        LeaseController-->>API: 403 Forbidden
        API-->>User: Error: Staff cannot request lease
    else User is existing resident/owner
        LeaseController->>Database: Check HouseholdMember for userId
        Database-->>LeaseController: Active household member found
        LeaseController-->>API: 403 Forbidden
        API-->>User: Error: Already have apartment
    else User is eligible
        LeaseController->>Database: Check apartment availability
        Database-->>LeaseController: Apartment status
        
        alt Apartment not available
            LeaseController-->>API: 400 Bad Request
            API-->>User: Error: Apartment not available
        else Apartment available
            LeaseController->>Database: Create LeaseRequest (status: pending)
            Database-->>LeaseController: LeaseRequest created
            
            LeaseController-->>API: 201 Created
            API-->>User: Success: Request submitted
            
            Note over Database,Manager: Manager receives notification
            
            Manager->>MarketplacePage: View pending lease requests
            Manager->>API: GET /api/lease-requests?status=pending
            API->>Database: Find pending requests
            Database-->>API: List of requests
            API-->>Manager: Pending requests
            
            Manager->>Manager: Review request details
            Manager->>API: PUT /api/lease-requests/:id/status
            
            alt Manager approves
                API->>LeaseController: updateLeaseStatus(req, res)
                LeaseController->>Database: Update status to 'approved'
                LeaseController->>Database: Update apartment.status to 'reserved'
                
                LeaseController->>CartService: Auto-create cart item
                CartService->>Database: INSERT into Cart
                Database-->>CartService: Cart item created
                
                LeaseController-->>API: 200 OK
                API-->>Manager: Success: Request approved
                API-->>User: Notification: Request approved
                
                Note over User: User can now checkout via cart
                
            else Manager rejects
                API->>LeaseController: updateLeaseStatus(req, res)
                LeaseController->>Database: Update status to 'rejected'
                LeaseController->>Database: Add rejection reason
                
                LeaseController-->>API: 200 OK
                API-->>Manager: Success: Request rejected
                API-->>User: Notification: Request rejected + reason
            end
        end
    end
```

### 2.2 Lease Request Status States

```mermaid
stateDiagram-v2
    [*] --> Pending: User submits request
    
    Pending --> Approved: Manager approves
    Pending --> Rejected: Manager rejects
    Pending --> Cancelled: User cancels
    
    Approved --> CartItem: Auto-create cart item
    CartItem --> CheckedOut: User completes checkout
    CartItem --> Cancelled: User cancels before checkout
    
    Rejected --> [*]: End of process
    Cancelled --> [*]: End of process
    CheckedOut --> Active: Payment completed
    
    Active --> Completed: Lease term ends
    Active --> Terminated: Early termination
    
    Completed --> [*]: End of process
    Terminated --> [*]: End of process
    
    note right of Approved
        Apartment status: reserved
        Cart item auto-created
    end note
    
    note right of CheckedOut
        User upgraded to resident
        Apartment status: occupied
    end note
```

---

## 3. Cart & Checkout Flow

### 3.1 Cart Operations & Checkout

```mermaid
sequenceDiagram
    participant User
    participant CartPage
    participant GraphQL
    participant CartService
    participant Database
    participant PaymentGateway

    User->>CartPage: Navigate to /cart
    CartPage->>GraphQL: query myCart
    GraphQL->>CartService: getCartSummary(userId)
    CartService->>Database: SELECT Cart items with associations
    Database-->>CartService: Cart items + apartment details
    CartService->>CartService: Calculate summary (rent, buy, deposit, maintenance)
    CartService-->>GraphQL: CartResponse (items + summary)
    GraphQL-->>CartPage: Cart data
    CartPage->>User: Display cart items + summary

    User->>CartPage: Select/deselect items
    CartPage->>GraphQL: mutation toggleCartItemSelection
    GraphQL->>CartService: toggleSelection(userId, itemId, selected)
    CartService->>Database: UPDATE Cart SET selected
    Database-->>CartService: Updated
    CartService-->>GraphQL: Updated cart item
    GraphQL-->>CartPage: Success
    CartPage->>CartPage: Update UI

    User->>CartPage: Update lease months
    CartPage->>GraphQL: mutation updateCartItem
    GraphQL->>CartService: updateCartItem(userId, itemId, {months})
    CartService->>Database: UPDATE Cart SET months
    Database-->>CartService: Updated
    CartService->>CartService: Recalculate totals
    CartService-->>GraphQL: Updated cart item
    GraphQL-->>CartPage: Success
    CartPage->>CartPage: Update totals display

    User->>CartPage: Click "Checkout"
    CartPage->>CartPage: Validate selected items > 0
    
    alt No items selected
        CartPage->>User: Show error: No items selected
    else Has selected items
        CartPage->>GraphQL: mutation checkoutCart(paymentMethod, note)
        GraphQL->>CartService: checkoutCart(userId, {paymentMethod, note})
        
        CartService->>Database: BEGIN TRANSACTION
        
        CartService->>Database: SELECT selected cart items
        Database-->>CartService: Selected items
        
        CartService->>CartService: Validate all apartments still available
        
        alt Any apartment not available
            CartService->>Database: ROLLBACK
            CartService-->>GraphQL: Error: Apartment not available
            GraphQL-->>CartPage: Error message
            CartPage->>User: Show error
        else All available
            loop For each cart item
                CartService->>Database: CREATE Billing record
                CartService->>Database: CREATE Payment record
                CartService->>PaymentGateway: Process payment
                PaymentGateway-->>CartService: Payment success
                CartService->>Database: UPDATE Apartment status to 'occupied'
                CartService->>Database: UPDATE listing flags to false
            end
            
            CartService->>Database: Get user current role
            CartService->>Database: Find resident role
            
            alt User not resident yet
                CartService->>Database: UPDATE User roleId to resident
            end
            
            CartService->>Database: DELETE selected cart items
            CartService->>Database: COMMIT TRANSACTION
            
            CartService-->>GraphQL: CheckoutResult (success, payments, apartments)
            GraphQL-->>CartPage: Success response
            
            CartPage->>CartPage: Clear cart state
            CartPage->>User: Show success message
            CartPage->>User: Redirect to /my-apartments
        end
    end
```

### 3.2 GraphQL Cart Operations

```mermaid
graph TD
    A[GraphQL Endpoint /graphql] --> B{Operation Type}
    
    B -->|Query| C[myCart]
    B -->|Query| D[cartSummary]
    B -->|Mutation| E[addToCart]
    B -->|Mutation| F[updateCartItem]
    B -->|Mutation| G[removeFromCart]
    B -->|Mutation| H[toggleCartItemSelection]
    B -->|Mutation| I[selectAllCartItems]
    B -->|Mutation| J[clearCart]
    B -->|Mutation| K[checkoutCart]
    
    C --> L[CartService.getCartSummary]
    D --> L
    E --> M[CartService.addToCart]
    F --> N[CartService.updateCartItem]
    G --> O[CartService.removeFromCart]
    H --> P[CartService.toggleSelection]
    I --> Q[CartService.selectAll]
    J --> R[CartService.clearCart]
    K --> S[CartService.checkoutCart]
    
    L --> T[Database Queries]
    M --> T
    N --> T
    O --> T
    P --> T
    Q --> T
    R --> T
    S --> T
    
    T --> U[Response with CartItem/CartResponse/CheckoutResult]
    U --> V[Frontend Updates UI]
    
    style K fill:#ff6b6b
    style S fill:#ff6b6b
    note right of K: Most complex operation<br/>Handles payments,<br/>role upgrades,<br/>status updates
```

---

## 4. Engagement Features Flow

### 4.1 Favorite, Review, View Tracking

```mermaid
sequenceDiagram
    participant User
    participant ApartmentDetail
    participant FavoriteBtn
    participant ReviewForm
    participant API
    participant Database

    User->>ApartmentDetail: Navigate to /apartments/:id
    
    par Load apartment data
        ApartmentDetail->>API: GET /api/apartments/:id
        API->>Database: Find apartment with associations
        Database-->>API: Apartment data
        API-->>ApartmentDetail: Apartment + isFavorite flag
    and Track view
        ApartmentDetail->>API: POST /api/views/:id
        API->>Database: Check recent view (1 hour window)
        alt Recent view exists
            API->>Database: UPDATE viewedAt
        else No recent view
            API->>Database: INSERT new view record
        end
        Database-->>API: View tracked
    and Load statistics
        ApartmentDetail->>API: GET /api/apartments/:id/stats
        API->>Database: COUNT buyers, reviews, views, favorites
        Database-->>API: Statistics object
        API-->>ApartmentDetail: Stats data
    end
    
    ApartmentDetail->>User: Display apartment + stats
    
    User->>FavoriteBtn: Click heart icon
    FavoriteBtn->>FavoriteBtn: Optimistic UI update (toggle)
    
    alt Add to favorites
        FavoriteBtn->>API: POST /api/favorites/:id
        API->>Database: Check existing favorite
        alt Already favorited
            API-->>FavoriteBtn: 200 OK (idempotent)
        else Not favorited yet
            API->>Database: INSERT into apartment_favorites
            API-->>FavoriteBtn: 201 Created
        end
    else Remove from favorites
        FavoriteBtn->>API: DELETE /api/favorites/:id
        API->>Database: DELETE from apartment_favorites
        API-->>FavoriteBtn: 200 OK
    end
    
    alt API success
        FavoriteBtn->>User: Keep optimistic update + show toast
    else API error
        FavoriteBtn->>FavoriteBtn: Revert to previous state
        FavoriteBtn->>User: Show error toast
    end
    
    User->>ReviewForm: Enter rating (1-5) + comment
    User->>ReviewForm: Submit review
    
    ReviewForm->>ReviewForm: Validate (rating > 0, comment >= 10 chars)
    
    alt Validation fails
        ReviewForm->>User: Show validation error
    else Validation passes
        ReviewForm->>API: POST /api/reviews/apartments/:id
        API->>Database: Check user is tenant/owner
        
        alt User not authorized
            API-->>ReviewForm: 403 Forbidden
            ReviewForm->>User: Error: Only tenants/owners can review
        else User authorized
            API->>Database: Check existing review
            
            alt Already reviewed
                API-->>ReviewForm: 400 Bad Request
                ReviewForm->>User: Error: Already reviewed, use update
            else New review
                API->>Database: INSERT into apartment_reviews
                Database-->>API: Review created
                API-->>ReviewForm: 201 Created
                
                ReviewForm->>ReviewForm: Reset form
                ReviewForm->>ApartmentDetail: Trigger stats refresh
                ApartmentDetail->>API: GET /api/apartments/:id/stats
                API->>Database: Recalculate avg rating + count
                Database-->>API: Updated stats
                API-->>ApartmentDetail: Updated stats
                ApartmentDetail->>User: Display updated stats
                ReviewForm->>User: Show success toast
            end
        end
    end
```

### 4.2 Similar Apartments Recommendation

```mermaid
graph TD
    A[User views Apartment ID=15] --> B[Load Current Apartment]
    
    B --> C{Apartment Type?}
    C -->|type: 2bhk| D[Type = 2bhk]
    C -->|bedrooms: 2| E[Bedrooms = 2]
    
    B --> F{Listing Mode?}
    F -->|For Rent| G[Price = monthlyRent]
    F -->|For Sale| H[Price = salePrice]
    
    D --> I[Calculate Area Range]
    E --> I
    G --> J[Calculate Price Range]
    H --> J
    
    I --> K[area BETWEEN 52-78m²<br/>80% - 120% of 65m²]
    J --> L[price BETWEEN 5.25M-9.75M<br/>70% - 130% of 7.5M]
    
    K --> M[Build WHERE Clause]
    L --> M
    
    M --> N{Match Criteria}
    N -->|OR| O[type = '2bhk']
    N -->|OR| P[bedrooms = 2]
    
    O --> Q[Filter: status IN for_rent, for_sale]
    P --> Q
    
    Q --> R[Exclude: id != 15]
    R --> S[Same listing mode: isListedForRent = true]
    
    S --> T[ORDER BY createdAt DESC]
    T --> U[LIMIT 12 - Get extra for filtering]
    
    U --> V[Include Floor → Building → Block]
    V --> W[Format Response]
    W --> X[Slice to limit=6]
    X --> Y[Return Similar Apartments]
    
    Y --> Z[Display in Grid]
    Z --> AA[User clicks similar apartment]
    AA --> A
    
    style A fill:#4CAF50
    style Y fill:#2196F3
    style Z fill:#FF9800
```

---

## 5. Search & Filter Flow

### 5.1 Fuzzy Search with Fuse.js

```mermaid
sequenceDiagram
    participant User
    participant SearchPage
    participant API
    participant SearchController
    participant FuseJS
    participant Database

    User->>SearchPage: Enter search query "can ho 2 phong ngu"
    User->>SearchPage: Apply filters (type, bedrooms, price range)
    User->>SearchPage: Click search
    
    SearchPage->>SearchPage: Debounce 300ms
    SearchPage->>API: GET /api/apartments/search?q=can ho 2 phong ngu&type=2bhk
    
    API->>SearchController: searchApartments(req, res)
    SearchController->>SearchController: Extract query + filters
    
    SearchController->>SearchController: normalize(query)
    Note over SearchController: Remove diacritics:<br/>"cần hộ" → "can ho"
    
    SearchController->>SearchController: Check if pure digit search
    
    alt Pure digit search (e.g., "302")
        SearchController->>Database: Exact match on apartmentNumber
        Database-->>SearchController: Matching apartments
    else Text search
        SearchController->>Database: Load all apartments with filters
        Database-->>SearchController: Filtered apartments
        
        SearchController->>SearchController: Build searchable text for each
        Note over SearchController: Combine: code, type, address,<br/>bedrooms, bathrooms, status
        
        SearchController->>FuseJS: Initialize Fuse with options
        Note over FuseJS: threshold: 0.3<br/>distance: 100<br/>keys: searchableText
        
        FuseJS->>FuseJS: Perform fuzzy search
        FuseJS-->>SearchController: Ranked results with scores
        
        SearchController->>SearchController: Filter by score threshold
        SearchController->>SearchController: Map to apartment objects
    end
    
    SearchController->>SearchController: Apply additional filters
    Note over SearchController: blockId, buildingId, floorId<br/>status, bedrooms, bathrooms<br/>area range, price range
    
    SearchController->>SearchController: Sort results (price/area/date)
    SearchController->>SearchController: Paginate (offset + limit)
    
    SearchController-->>API: Formatted results + pagination
    API-->>SearchPage: Search results
    
    SearchPage->>SearchPage: Update results grid
    SearchPage->>User: Display apartments
    
    User->>SearchPage: Change filters
    SearchPage->>API: New search request
    Note over SearchPage,Database: Repeat process with new filters
```

### 5.2 Search Strategy Decision Tree

```mermaid
graph TD
    A[User Query Input] --> B{Query Type?}
    
    B -->|Empty| C[Load All Apartments]
    B -->|Pure Digits| D[Exact Match Strategy]
    B -->|Text| E[Fuzzy Search Strategy]
    
    D --> F[Match apartmentNumber = query]
    F --> G[Return exact matches]
    
    E --> H[Normalize Query]
    H --> I[Remove Vietnamese diacritics]
    I --> J[Convert to lowercase]
    J --> K[Build searchable text per apartment]
    
    K --> L[Initialize Fuse.js]
    L --> M{Threshold Settings}
    
    M -->|0.0| N[Exact match only]
    M -->|0.3| O[Moderate fuzziness - USED]
    M -->|0.6| P[High fuzziness]
    M -->|1.0| Q[Match everything]
    
    O --> R[Perform fuzzy search]
    R --> S[Filter by score <= 0.3]
    S --> T[Rank by score ASC]
    
    C --> U[Apply Filters]
    G --> U
    T --> U
    
    U --> V{Has Filters?}
    
    V -->|Block/Building/Floor| W[Filter by hierarchy]
    V -->|Status| X[Filter by status]
    V -->|Bedrooms/Bathrooms| Y[Filter by exact match]
    V -->|Area Range| Z[Filter BETWEEN min-max]
    V -->|Price Range| AA[Filter BETWEEN min-max]
    
    W --> AB[Combined Results]
    X --> AB
    Y --> AB
    Z --> AB
    AA --> AB
    
    AB --> AC{Sort Option?}
    AC -->|Price ASC| AD[ORDER BY price ASC]
    AC -->|Price DESC| AE[ORDER BY price DESC]
    AC -->|Area ASC| AF[ORDER BY area ASC]
    AC -->|Area DESC| AG[ORDER BY area DESC]
    AC -->|Date DESC| AH[ORDER BY createdAt DESC]
    
    AD --> AI[Paginate]
    AE --> AI
    AF --> AI
    AG --> AI
    AH --> AI
    
    AI --> AJ[Return Results]
    AJ --> AK[Display in UI]
    
    style O fill:#4CAF50
    style R fill:#2196F3
    style AB fill:#FF9800
```

---

## 6. 3D Building Map Interaction

### 6.1 Interactive Building Map Navigation

```mermaid
sequenceDiagram
    participant User
    participant BuildingMap
    participant API
    participant Database

    User->>BuildingMap: Navigate to /buildings/map
    BuildingMap->>API: GET /api/blocks
    API->>Database: Find all blocks
    Database-->>API: Blocks data
    API-->>BuildingMap: Blocks list
    
    BuildingMap->>BuildingMap: Render 3D blocks grid
    BuildingMap->>User: Display blocks with CSS 3D transforms
    
    User->>BuildingMap: Click Block "S"
    BuildingMap->>BuildingMap: Expand block animation
    
    BuildingMap->>API: GET /api/blocks/:id/buildings
    API->>Database: Find buildings in block
    Database-->>API: Buildings data
    API-->>BuildingMap: Buildings list
    
    BuildingMap->>BuildingMap: Render buildings in 3D layout
    BuildingMap->>User: Display buildings with depth effect
    
    User->>BuildingMap: Hover over Building 01
    BuildingMap->>BuildingMap: Apply hover transform
    Note over BuildingMap: scale(1.05)<br/>rotateY(5deg)<br/>shadow increase
    
    User->>BuildingMap: Click Building 01
    BuildingMap->>BuildingMap: Expand building animation
    
    BuildingMap->>API: GET /api/buildings/:id/floors
    API->>Database: Find floors in building
    Database-->>API: Floors data (1-15)
    API-->>BuildingMap: Floors list
    
    BuildingMap->>BuildingMap: Render floors in vertical stack
    BuildingMap->>User: Display 15 floors with perspective
    
    User->>BuildingMap: Click Floor 3
    BuildingMap->>BuildingMap: Expand floor animation
    
    BuildingMap->>API: GET /api/floors/:id/apartments
    API->>Database: Find apartments on floor
    Database-->>API: Apartments with status
    API-->>BuildingMap: Apartments list
    
    BuildingMap->>BuildingMap: Render apartments grid
    
    loop For each apartment
        BuildingMap->>BuildingMap: Apply status-based color
        Note over BuildingMap: vacant: green<br/>occupied: gray<br/>for_rent: blue<br/>for_sale: orange
    end
    
    BuildingMap->>User: Display apartments with colors
    
    User->>BuildingMap: Click Apartment 302
    
    alt User authenticated
        BuildingMap->>User: Navigate to /apartments/:id
    else User guest
        BuildingMap->>BuildingMap: Show apartment preview modal
        BuildingMap->>User: Display basic info + "Login to view more"
    end
```

### 6.2 3D CSS Transform Hierarchy

```mermaid
graph TD
    A[3D Building Map Container] --> B[perspective: 1500px]
    B --> C[transform-style: preserve-3d]
    
    C --> D[Block Level]
    D --> E[translateZ: 0px]
    D --> F[rotateX: 0deg]
    
    D --> G[Building Level]
    G --> H[translateZ: 50px]
    G --> I[rotateY: -15deg]
    
    G --> J[Floor Level]
    J --> K[translateZ: 100px]
    J --> L[translateY: -floor * 40px]
    
    J --> M[Apartment Level]
    M --> N[translateZ: 150px]
    M --> O[scale: 1.0]
    
    style A fill:#2196F3
    style D fill:#4CAF50
    style G fill:#FF9800
    style J fill:#9C27B0
    style M fill:#F44336
    
    P[Hover Effects] --> Q[Block: scale 1.05]
    P --> R[Building: rotateY +5deg]
    P --> S[Floor: translateZ +20px]
    P --> T[Apartment: scale 1.1]
    
    U[Status Colors] --> V[vacant: bg-green-100]
    U --> W[occupied: bg-gray-300]
    U --> X[for_rent: bg-blue-100]
    U --> Y[for_sale: bg-orange-100]
    U --> Z[maintenance: bg-yellow-100]
```

---

## 7. Role-Based Access Control Flow

### 7.1 RBAC Authorization Check

```mermaid
graph TD
    A[Incoming Request] --> B[authMiddleware]
    B --> C{JWT Token Valid?}
    
    C -->|No| D[Return 401 Unauthorized]
    C -->|Yes| E[Extract userId from token]
    
    E --> F[Load User + Role from DB]
    F --> G[Attach to req.user]
    
    G --> H{Protected Endpoint?}
    
    H -->|No| I[Continue to Controller]
    H -->|Yes| J[requireRole Middleware]
    
    J --> K{Check User Role}
    
    K -->|Admin| L{Required Roles?}
    K -->|BuildingManager| L
    K -->|Resident| L
    K -->|Security| L
    K -->|Technician| L
    K -->|Accountant| L
    K -->|User| L
    
    L -->|Role Allowed| M[Continue to Controller]
    L -->|Role Denied| N[Return 403 Forbidden]
    
    M --> O[Execute Business Logic]
    O --> P{Success?}
    
    P -->|Yes| Q[Return 200/201 with Data]
    P -->|No| R[Return 400/404/500 with Error]
    
    style A fill:#2196F3
    style B fill:#4CAF50
    style J fill:#FF9800
    style M fill:#9C27B0
    style N fill:#F44336
    style D fill:#F44336
```

### 7.2 Role Permission Matrix

```mermaid
graph LR
    A[Roles & Permissions] --> B[Admin]
    A --> C[BuildingManager]
    A --> D[Resident]
    A --> E[Security]
    A --> F[Technician]
    A --> G[Accountant]
    A --> H[User/Guest]
    
    B --> B1[All Permissions]
    B1 --> B2[CRUD Users]
    B1 --> B3[CRUD Buildings/Blocks]
    B1 --> B4[Approve Leases]
    B1 --> B5[View All Data]
    B1 --> B6[System Settings]
    
    C --> C1[Building Permissions]
    C1 --> C2[CRUD Apartments in Buildings]
    C1 --> C3[Approve Lease Requests]
    C1 --> C4[View Building Stats]
    C1 --> C5[Manage Residents]
    
    D --> D1[Resident Permissions]
    D1 --> D2[View Own Apartment]
    D1 --> D3[Pay Rent/Bills]
    D1 --> D4[Submit Maintenance Requests]
    D1 --> D5[Review Own Apartment]
    
    E --> E1[Security Permissions]
    E1 --> E2[View Visitor Logs]
    E1 --> E3[Check Resident Access]
    E1 --> E4[View Building Access]
    
    F --> F1[Technician Permissions]
    F1 --> F2[View Maintenance Requests]
    F1 --> F3[Update Request Status]
    F1 --> F4[View Apartment Details]
    
    G --> G1[Accountant Permissions]
    G1 --> G2[View All Bills]
    G1 --> G3[Process Payments]
    G1 --> G4[Generate Reports]
    
    H --> H1[Guest Permissions]
    H1 --> H2[Browse Marketplace]
    H1 --> H3[View Public Apartments]
    H1 --> H4[Submit Lease Request after Login]
    
    style B fill:#F44336
    style C fill:#FF9800
    style D fill:#4CAF50
    style E fill:#2196F3
    style F fill:#9C27B0
    style G fill:#00BCD4
    style H fill:#9E9E9E
```

---

## 8. Payment Processing Flow

### 8.1 Complete Payment Workflow

```mermaid
sequenceDiagram
    participant User
    participant CartPage
    participant API
    participant PaymentService
    participant Database
    participant PaymentGateway
    participant NotificationService

    User->>CartPage: Click "Checkout"
    CartPage->>API: POST /graphql (checkoutCart mutation)
    API->>PaymentService: checkoutCart(userId, data)
    
    PaymentService->>Database: BEGIN TRANSACTION
    PaymentService->>Database: SELECT selected cart items
    Database-->>PaymentService: Cart items with apartments
    
    PaymentService->>PaymentService: Validate apartments availability
    
    alt Any apartment unavailable
        PaymentService->>Database: ROLLBACK
        PaymentService-->>API: Error response
        API-->>CartPage: Error message
        CartPage->>User: Show error notification
    else All available
        loop For each cart item
            PaymentService->>PaymentService: Calculate amount
            Note over PaymentService: amount = price * months (rent)<br/>OR amount = salePrice (buy)
            
            PaymentService->>Database: CREATE Billing record
            Note over Database: billType: rent/other<br/>amount, dueDate, status: paid
            
            PaymentService->>Database: CREATE Payment record
            Note over Database: Generate transactionId<br/>TXN-{timestamp}-{apartmentId}
            
            PaymentService->>PaymentGateway: Process payment
            PaymentGateway->>PaymentGateway: Validate payment method
            PaymentGateway->>PaymentGateway: Process transaction
            
            alt Payment fails
                PaymentGateway-->>PaymentService: Payment failed
                PaymentService->>Database: ROLLBACK
                PaymentService-->>API: Payment error
                API-->>CartPage: Error message
                CartPage->>User: Show payment error
            else Payment succeeds
                PaymentGateway-->>PaymentService: Payment confirmed
                
                PaymentService->>Database: UPDATE Payment status to 'completed'
                PaymentService->>Database: UPDATE Apartment status to 'occupied'
                PaymentService->>Database: UPDATE isListedForRent/Sale to false
                
                PaymentService->>Database: CREATE HouseholdMember record
                Note over Database: Link user to apartment<br/>as tenant or owner
            end
        end
        
        PaymentService->>Database: Get user current role
        PaymentService->>Database: Find 'resident' role
        
        alt User not resident yet
            PaymentService->>Database: UPDATE User roleId to resident
        end
        
        PaymentService->>Database: DELETE selected cart items
        PaymentService->>Database: COMMIT TRANSACTION
        
        PaymentService->>NotificationService: Send payment confirmation
        NotificationService->>User: Email/SMS confirmation
        
        PaymentService-->>API: CheckoutResult (success, payments, apartments)
        API-->>CartPage: Success response
        
        CartPage->>CartPage: Clear cart UI
        CartPage->>User: Show success message
        CartPage->>User: Redirect to /my-apartments
    end
```

### 8.2 Payment Transaction State Machine

```mermaid
stateDiagram-v2
    [*] --> CartSelection: User adds items
    
    CartSelection --> CheckoutInitiated: Click checkout
    
    CheckoutInitiated --> ValidationPending: Validate cart items
    
    ValidationPending --> ValidationFailed: Apartments unavailable
    ValidationPending --> PaymentPending: All valid
    
    ValidationFailed --> [*]: Show error, keep cart
    
    PaymentPending --> ProcessingPayment: Call payment gateway
    
    ProcessingPayment --> PaymentFailed: Gateway error/declined
    ProcessingPayment --> PaymentSuccess: Gateway approved
    
    PaymentFailed --> [*]: Rollback transaction
    
    PaymentSuccess --> UpdatingRecords: Update DB records
    
    UpdatingRecords --> CreatingBilling: Create Billing
    CreatingBilling --> CreatingPayment: Create Payment
    CreatingPayment --> UpdatingApartment: Update Apartment status
    UpdatingApartment --> UpdatingUser: Upgrade user role
    UpdatingUser --> ClearingCart: Delete cart items
    
    ClearingCart --> TransactionCommit: Commit transaction
    
    TransactionCommit --> SendingNotification: Send confirmation
    SendingNotification --> Completed: Payment complete
    
    Completed --> [*]: Redirect to apartments
    
    note right of ProcessingPayment
        Payment gateway integration
        Credit card, bank transfer
        E-wallet, etc.
    end note
    
    note right of TransactionCommit
        All operations atomic
        Rollback on any failure
    end note
```

---

## 📊 Summary

Các workflows trên minh họa:

1. **Authentication Flow**: JWT token generation, refresh token mechanism, protected routes
2. **Lease Request Workflow**: Full lifecycle từ submit → approval/rejection → auto-cart creation
3. **Cart & Checkout Flow**: GraphQL operations, transaction management, payment processing
4. **Engagement Features**: Favorites, reviews, view tracking với optimistic UI
5. **Search & Filter**: Fuzzy search với Fuse.js, multi-filter combinations
6. **3D Building Map**: Interactive navigation với CSS 3D transforms
7. **RBAC**: Role-based access control với 7 roles
8. **Payment Processing**: Complete payment workflow với transaction safety

Tất cả workflows được thiết kế với:
- ✅ **Error handling**: Graceful failures với rollback
- ✅ **Transaction safety**: ACID properties cho critical operations
- ✅ **Optimistic UI**: Instant feedback cho better UX
- ✅ **Authorization**: Role-based và ownership checks
- ✅ **Validation**: Multi-layer validation (client, API, database)

---

**File này hoàn thành comprehensive workflow documentation cho lab05_ManageBuilding!** 🎯
