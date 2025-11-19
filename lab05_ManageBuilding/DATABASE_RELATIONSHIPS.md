# Building Management System - Database Models & Relationships

## 📊 Cấu trúc cơ sở dữ liệu và mối quan hệ

### 🏗️ **Cấu trúc phân cấp chính:**
```
Block (Khu/Campus) - Lớn nhất  
    ↓ hasMany
Building (Tòa nhà) - Ví dụ: S.01, S.02, ..., S.10
    ↓ hasMany
Floor (Tầng)
    ↓ hasMany  
Apartment (Căn hộ)
```

---

## 🔗 **Chi tiết các mối quan hệ (Relationships)**

### 1. **Block → Building** (1:N)
```javascript
// 1 Block có nhiều Buildings
Block.hasMany(Building, { foreignKey: 'blockId', as: 'buildings' })
Building.belongsTo(Block, { foreignKey: 'blockId', as: 'block' })
```
- **Ví dụ**: Khu "S" có các tòa nhà: "S.01", "S.02", "S.03", ..., "S.10"

### 2. **Building → Floor** (1:N) 
```javascript
// 1 Building có nhiều Floors
Building.hasMany(Floor, { foreignKey: 'buildingId', as: 'floors' })
Floor.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' })
```
- **Ví dụ**: Tòa nhà S.01 có 20 tầng (Floor 1 → Floor 20)

### 3. **Floor → Apartment** (1:N)
```javascript  
// 1 Floor có nhiều Apartments
Floor.hasMany(Apartment, { foreignKey: 'floorId', as: 'apartments' })
Apartment.belongsTo(Floor, { foreignKey: 'floorId', as: 'floor' })
```
- **Ví dụ**: Tầng 10 của S.01 có 8 căn hộ (1001, 1002, ..., 1008)

### 4. **User → Block** (Manager) (1:N)
```javascript
// 1 User có thể quản lý nhiều Blocks
User.hasMany(Block, { foreignKey: 'managerId', as: 'managedBlocks' })
Block.belongsTo(User, { foreignKey: 'managerId', as: 'manager' })
```
- **Vai trò**: Block Manager quản lý toàn bộ khu

### 5. **User → Building** (Manager) (1:N)
```javascript
// 1 User có thể quản lý nhiều Buildings
User.hasMany(Building, { foreignKey: 'managerId', as: 'managedBuildings' })
Building.belongsTo(User, { foreignKey: 'managerId', as: 'manager' })
```
- **Vai trò**: Building Manager quản lý từng tòa nhà cụ thể

### 6. **Apartment → HouseholdMember** (1:N)
```javascript
// 1 Apartment có nhiều HouseholdMembers
Apartment.hasMany(HouseholdMember, { foreignKey: 'apartmentId', as: 'members' })
HouseholdMember.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' })
```
- **Ví dụ**: Căn hộ 1001 có 4 thành viên gia đình

### 7. **User → HouseholdMember** (1:1)
```javascript
// 1 User tương ứng với 1 HouseholdMember (nếu là resident)
User.hasOne(HouseholdMember, { foreignKey: 'userId', as: 'householdMember' })
HouseholdMember.belongsTo(User, { foreignKey: 'userId', as: 'user' })
```
- **Vai trò**: User với role "resident" được liên kết với HouseholdMember

### 8. **Apartment → Billing** (1:N)  
```javascript
// 1 Apartment có nhiều Billings (hóa đơn hàng tháng)
Apartment.hasMany(Billing, { foreignKey: 'apartmentId', as: 'billings' })
Billing.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' })
```
- **Ví dụ**: Căn hộ 1001 có hóa đơn tháng 1, tháng 2, tháng 3...

### 9. **Billing → Payment** (1:N)
```javascript
// 1 Billing có thể có nhiều Payments (thanh toán từng phần)
Billing.hasMany(Payment, { foreignKey: 'billingId', as: 'payments' })
Payment.belongsTo(Billing, { foreignKey: 'billingId', as: 'billing' })
```
- **Ví dụ**: Hóa đơn tháng 1 có thể được thanh toán 2 lần (50% và 50%)

### 10. **HouseholdMember → Visitor** (1:N)
```javascript
// 1 HouseholdMember có thể mời nhiều Visitors
HouseholdMember.hasMany(Visitor, { foreignKey: 'hostId', as: 'visitors' })  
Visitor.belongsTo(HouseholdMember, { foreignKey: 'hostId', as: 'host' })
```
- **Ví dụ**: Anh Nam (household member) mời 3 khách đến thăm

### 11. **Block → Facility** (1:N)
```javascript
// 1 Block có nhiều Facilities (tiện ích của khu)
Block.hasMany(Facility, { foreignKey: 'blockId', as: 'facilities' })
Facility.belongsTo(Block, { foreignKey: 'blockId', as: 'block' })
```
- **Ví dụ**: Khu S có hồ bơi, gym, sân tennis, phòng họp...

### 12. **Facility → FacilityBooking** (1:N)
```javascript
// 1 Facility có nhiều Bookings
Facility.hasMany(FacilityBooking, { foreignKey: 'facilityId', as: 'bookings' })
FacilityBooking.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' })
```
- **Ví dụ**: Sân tennis có booking từ 8h-10h, 14h-16h, 19h-21h...

### 13. **HouseholdMember → FacilityBooking** (1:N)
```javascript
// 1 HouseholdMember có thể đặt nhiều Facility Bookings
HouseholdMember.hasMany(FacilityBooking, { foreignKey: 'bookerId', as: 'facilityBookings' })
FacilityBooking.belongsTo(HouseholdMember, { foreignKey: 'bookerId', as: 'booker' })
```
- **Ví dụ**: Anh Nam đặt sân tennis, phòng họp, hồ bơi...

### 14. **Block → Announcement** (1:N)
```javascript
// 1 Block có nhiều Announcements
Block.hasMany(Announcement, { foreignKey: 'blockId', as: 'announcements' })
Announcement.belongsTo(Block, { foreignKey: 'blockId', as: 'block' })
```
- **Ví dụ**: Khu S có thông báo cắt điện, họp cư dân, sự kiện...

### 15. **User → Announcement** (1:N) - Creator
```javascript
// 1 User (admin/manager) có thể tạo nhiều Announcements
User.hasMany(Announcement, { foreignKey: 'createdBy', as: 'announcements' })
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' })
```
- **Vai trò**: Admin hoặc Manager tạo thông báo

---

## 👥 **User Roles & Permissions**

### **6 User Roles:**

1. **Admin** - Quản trị viên hệ thống
   - Quản lý toàn bộ hệ thống
   - Tạo/sửa/xóa tất cả dữ liệu
   - Quản lý users và phân quyền

2. **Building Manager** - Quản lý tòa nhà  
   - Quản lý 1 hoặc nhiều buildings
   - Xem báo cáo, thống kê
   - Quản lý cư dân và tiện ích

3. **Resident** - Cư dân
   - Xem thông tin căn hộ của mình
   - Đặt tiện ích, xem hóa đơn
   - Đăng ký khách thăm

4. **Security** - Bảo vệ
   - Quản lý khách thăm
   - Kiểm tra ra vào
   - Báo cáo an ninh

5. **Technician** - Kỹ thuật viên
   - Quản lý bảo trì tiện ích
   - Cập nhật trạng thái sửa chữa
   - Lập lịch bảo trì

6. **Accountant** - Kế toán
   - Quản lý hóa đơn và thanh toán
   - Tạo báo cáo tài chính
   - Theo dõi công nợ

---

## 🛡️ **4-Layer Security Framework**

### **Layer 1: Input Validation**
- `express-validator` cho tất cả form inputs
- Sanitization và validation rules
- Custom validators cho business logic

### **Layer 2: Rate Limiting**  
- `express-rate-limit` chống spam
- API rate limiting per IP/user
- Brute force protection

### **Layer 3: Authentication**
- JWT token authentication  
- Secure login/logout
- Session management

### **Layer 4: Authorization**
- Role-based access control (RBAC)
- Permission middleware
- Resource-level permissions

---

## 📝 **Ví dụ cấu trúc dữ liệu thực tế:**

```
Khu S (Block)
├── Tòa S.01 (Building)
│   ├── Tầng 1 (Floor)
│   │   ├── Căn 101 (Apartment) → Gia đình Nguyễn (4 người)
│   │   ├── Căn 102 (Apartment) → Gia đình Trần (3 người)
│   │   └── ...
│   ├── Tầng 2 (Floor)
│   │   ├── Căn 201 (Apartment)
│   │   └── ...
│   └── ...
├── Tòa S.02 (Building)
│   └── ...
├── Tòa S.03 (Building)
├── ...
├── Tòa S.10 (Building)
├── Tiện ích khu S:
│   ├── Hồ bơi
│   ├── Gym  
│   ├── Sân tennis
│   └── Phòng họp cư dân
└── Thông báo khu S:
    ├── "Cắt điện bảo trì ngày 15/12"
    ├── "Họp cư dân cuối tháng" 
    └── "Lễ hội mùa xuân 2024"
```
```javascript
// 1 Building có nhiều Facilities
Building.hasMany(Facility, { foreignKey: 'buildingId', as: 'facilities' })
Facility.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' })
```
- **Ví dụ**: Gym, Swimming Pool, Community Hall

### 8. **Facility → FacilityBooking** (1:N)
```javascript
// 1 Facility có nhiều Bookings
Facility.hasMany(FacilityBooking, { foreignKey: 'facilityId', as: 'bookings' })
FacilityBooking.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' })
```

### 9. **Apartment → Billing** (1:N)
```javascript
// 1 Apartment có nhiều Bills
Apartment.hasMany(Billing, { foreignKey: 'apartmentId', as: 'bills' })
Billing.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' })
```

### 10. **Billing → Payment** (1:N)
```javascript
// 1 Billing có nhiều Payments
Billing.hasMany(Payment, { foreignKey: 'billingId', as: 'payments' })
Payment.belongsTo(Billing, { foreignKey: 'billingId', as: 'bill' })
```

### 11. **Apartment → Visitor** (1:N)
```javascript
// 1 Apartment có nhiều Visitors
Apartment.hasMany(Visitor, { foreignKey: 'apartmentId', as: 'visitors' })
Visitor.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' })
```

### 12. **Building → Announcement** (1:N)
```javascript
// 1 Building có nhiều Announcements
Building.hasMany(Announcement, { foreignKey: 'buildingId', as: 'announcements' })
Announcement.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' })
```

---

## 🎯 **Ví dụ cụ thể về cấu trúc:**

```
🏢 Sunrise Towers (Building ID: 1)
│
├── 🏗️ Block A (Block ID: 1)
│   ├── 🏢 Tầng 1 (Floor ID: 1)
│   │   ├── 🏠 Căn hộ 101 (Apartment ID: 1) → Chủ sở hữu: Duy Huynh Thanh
│   │   ├── 🏠 Căn hộ 102 (Apartment ID: 2) 
│   │   └── ...
│   ├── 🏢 Tầng 2 (Floor ID: 2)
│   └── ...
│
├── 🏗️ Block B (Block ID: 2)
│   └── ...
│
├── 🏊 Facilities
│   ├── Gym (Facility ID: 1)
│   ├── Swimming Pool (Facility ID: 2)
│   └── Community Hall (Facility ID: 3)
│
└── 📢 Announcements
    ├── Thông báo bảo trì (Announcement ID: 1)
    └── Chào mừng hệ thống mới (Announcement ID: 2)
```

---

## 👥 **Vai trò người dùng và quyền truy cập:**

### **Admin**
- Quản lý toàn bộ hệ thống
- Truy cập tất cả Buildings, Users, Reports

### **Building Manager** 
- Quản lý 1 hoặc nhiều Buildings cụ thể
- Quản lý Residents, Facilities, Announcements

### **Resident (Chủ sở hữu/Người thuê)**
- Truy cập thông tin căn hộ của mình
- Đăng ký Visitors, đặt Facilities
- Xem Bills và thực hiện Payments

### **Security**
- Quản lý Visitor registration
- Kiểm soát ra vào tòa nhà
- Báo cáo an ninh

### **Technician**
- Xử lý maintenance requests
- Cập nhật trạng thái Facilities
- Báo cáo kỹ thuật

### **Accountant**
- Tạo và quản lý Billings
- Xử lý Payments
- Báo cáo tài chính

---

## 🔍 **Query Examples:**

### Lấy tất cả căn hộ trong một tòa nhà:
```javascript
const apartments = await Apartment.findAll({
  include: [
    {
      model: Floor,
      as: 'floor',
      include: [
        {
          model: Block,
          as: 'block',
          include: [
            {
              model: Building,
              as: 'building',
              where: { id: buildingId }
            }
          ]
        }
      ]
    }
  ]
});
```

### Lấy thông tin đầy đủ của một căn hộ:
```javascript
const apartmentDetails = await Apartment.findByPk(apartmentId, {
  include: [
    { model: User, as: 'owner' },
    { model: User, as: 'tenant' },
    { model: HouseholdMember, as: 'householdMembers' },
    { model: Billing, as: 'bills' },
    { model: Visitor, as: 'visitors' },
    {
      model: Floor,
      as: 'floor',
      include: [
        {
          model: Block,
          as: 'block',
          include: [{ model: Building, as: 'building' }]
        }
      ]
    }
  ]
});
```

---

**Tóm lại**: Hệ thống được thiết kế theo cấu trúc phân cấp rõ ràng từ Building → Block → Floor → Apartment, với các module hỗ trợ như quản lý cư dân, thanh toán, tiện ích và thông báo.