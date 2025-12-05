## Cart UI Mini Library

Thư viện nhỏ để tái sử dụng cho chức năng giỏ hàng (thuê/mua căn hộ):

- `Button`, `TextInput`: input cơ bản có trạng thái error/disabled.
- `Card`: khung hiển thị item.
- `CartItemCard`: hiển thị 1 căn hộ trong giỏ (mã, loại, diện tích, giá, trạng thái), nút tăng/giảm thời gian thuê hoặc xóa.
- `CartSummary`: tính tổng tiền thuê (theo tháng) hoặc tiền mua, chọn số mục thanh toán.

### Cấu trúc
```
lab07_CardComponent/
  README.md
  src/
    components/
      Button.jsx
      TextInput.jsx
      Card.jsx
      CartItemCard.jsx
      CartSummary.jsx
    hooks/
      useCart.js
    styles.css
    index.js
```

### Sử dụng thử
```jsx
import { Button, TextInput, CartItemCard, CartSummary, useCart } from './src';
import './src/styles.css';

// render một item
<CartItemCard
  code="A.01-0302"
  title="Căn hộ 2BHK"
  area={65}
  type="2bhk"
  price={7500000}
  mode="rent"
  status="for_rent"
  months={12}
  onMonthsChange={(v) => console.log(v)}
  onRemove={() => console.log('remove')}
/>;

// render summary
<CartSummary
  items={[
    { id: 1, price: 7500000, mode: 'rent', months: 12, selected: true },
    { id: 2, price: 1500000000, mode: 'buy', selected: true },
  ]}
  onCheckout={() => console.log('checkout')}
/>;

// hook quản lý giỏ
const { items, addItem, updateItem, removeItem, totals } = useCart();
```

Các component thuần React, không phụ thuộc CSS framework; có `style` mặc định nhưng dễ override bằng className prop.
