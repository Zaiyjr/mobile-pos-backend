# 📖 ເອກະສານ API Documentation & JSON Formats (Mobile POS Backend)

ເອກະສານນີ້ລວມລາຍລະອຽດຂອງ API ທຸກໂຕໃນລະບົບ Backend ພ້ອມກັບ JSON Format ທີ່ໃຊ້ໃນການຍິງ Request ແລະ Response.

> [!NOTE]
> * **Base URL:** `http://localhost:5000` (ຫຼື Port ທີ່ເຈົ້າກຳນົດໄວ້ໃນ backend)
> * **Prefix:** `/api` (ເຊັ່ນ: `/api/auth/login`)
> * **Headers ທີ່ຈຳເປັນ:** ສໍາລັບ API ທີ່ຕ້ອງ Login, ໃຫ້ແນບ Header ໄປນຳ:
>   `Authorization: Bearer <JWT_TOKEN_ທີ່ໄດ້ຫຼັງຈາກ_Login>`

---

## 1. ລະບົບ Authentication (`/api/auth`)

### 🔑 1.1 ເຂົ້າສູ່ລະບົບ (Login)
* **Method:** `POST`
* **URL:** `/api/auth/login`
* **Request Body (JSON):**
```json
{
  "username": "somphone",
  "password": "mysecretpassword123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "ເຂົ້າສູ່ລະບົບສຳເລັດ",
  "data": {
    "user": {
      "id": 1,
      "username": "somphone",
      "name": "ສົມພອນ ໄຊຍະວົງ",
      "roleId": 1,
      "createdAt": "2026-05-18T10:00:00.000Z",
      "updatedAt": "2026-05-18T10:00:00.000Z",
      "role": {
        "id": 1,
        "name": "ADMIN"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📝 1.2 ສະໝັກບັນຊີພະນັກງານ (Register)
* **Method:** `POST`
* **URL:** `/api/auth/register`
* **Request Body (JSON):**
```json
{
  "username": "cashier_noi",
  "password": "securepassword999",
  "name": "ນາງ ນ້ອຍ ຄຳມີ",
  "roleId": 2
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "ສະໝັກບັນຊີພະນັກງານສຳເລັດ",
  "data": {
    "id": 2,
    "username": "cashier_noi",
    "name": "ນາງ ນ້ອຍ ຄຳມີ",
    "roleId": 2,
    "createdAt": "2026-05-18T13:00:00.000Z",
    "updatedAt": "2026-05-18T13:00:00.000Z"
  }
}
```

---

## 2. ລະບົບສິນຄ້າ (`/api/products`)

### 📦 2.1 ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ (Get All Products)
* **Method:** `GET`
* **URL:** `/api/products`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "description": "256GB, Titanium Black",
      "categoryId": 1,
      "brandId": 1,
      "createdAt": "2026-05-18T10:00:00.000Z",
      "category": { "id": 1, "name": "Smartphone" },
      "brand": { "id": 1, "name": "Apple" },
      "images": [
        { "id": 1, "productId": 1, "imageUrl": "https://example.com/iphone15.jpg", "isMain": true }
      ],
      "variants": [
        { "id": 1, "productId": 1, "color": "Titanium Black", "sku": "IPH15PM-BLK", "price": 45000000.00, "stockQuantity": 5 }
      ]
    }
  ]
}
```

### 📦 2.2 ດຶງຂໍ້ມູນສິນຄ້າລະອຽດດ້ວຍ ID (Get Product By ID)
* **Method:** `GET`
* **URL:** `/api/products/:id` (ເຊັ່ນ: `/api/products/1`)
* **Response (200 OK):** *(ຈະໄດ້ specs ແລະ ຂໍ້ມູນສະຕັອກ IMEI ພ້ອມ)*
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro Max",
    "description": "256GB, Titanium Black",
    "categoryId": 1,
    "brandId": 1,
    "category": { "id": 1, "name": "Smartphone" },
    "brand": { "id": 1, "name": "Apple" },
    "images": [
      { "id": 1, "imageUrl": "https://example.com/iphone15.jpg", "isMain": true }
    ],
    "variants": [
      {
        "id": 1,
        "color": "Titanium Black",
        "sku": "IPH15PM-BLK",
        "price": 45000000.00,
        "stockQuantity": 5,
        "_count": { "stockItems": 5 }
      }
    ],
    "specs": [
      {
        "id": 1,
        "productId": 1,
        "attributeId": 1,
        "value": "256GB",
        "attribute": { "id": 1, "name": "Storage" }
      }
    ]
  }
}
```

### ➕ 2.3 ເພີ່ມສິນຄ້າໃໝ່ (Create Product - Nested) - 🔒 Admin Only
* **Method:** `POST`
* **URL:** `/api/products`
* **Request Body (JSON):**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "512GB, Titanium Gray",
  "categoryId": 1,
  "brandId": 2,
  "images": {
    "create": [
      {
        "imageUrl": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600",
        "isMain": true
      }
    ]
  },
  "variants": {
    "create": [
      {
        "color": "Titanium Gray",
        "sku": "SAM-S24U-GRY",
        "price": 38000000.00,
        "stockQuantity": 8
      }
    ]
  }
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ",
  "data": {
    "id": 3,
    "name": "Samsung Galaxy S24 Ultra",
    "description": "512GB, Titanium Gray",
    "categoryId": 1,
    "brandId": 2
  }
}
```

### ✏️ 2.4 ແກ້ໄຂຂໍ້ມູນສິນຄ້າ (Update Product) - 🔒 Admin Only
* **Method:** `PUT`
* **URL:** `/api/products/:id`
* **Request Body (JSON):**
```json
{
  "name": "Samsung Galaxy S24 Ultra (Updated)",
  "description": "512GB, Titanium Violet"
}
```

### 🗑️ 2.5 ລຶບສິນຄ້າ (Soft Delete Product) - 🔒 Admin Only
* **Method:** `DELETE`
* **URL:** `/api/products/:id`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Soft Delete ສິນຄ້າສຳເລັດ"
}
```

---

## 3. ລະບົບການຂາຍ ແລະ ປິດບິນ (`/api/orders`)

### 🛒 3.1 ປິດບິນຂາຍໜ້າຮ້ານ (POS Checkout)
* **Method:** `POST`
* **URL:** `/api/orders`
* **Request Body (JSON):**
```json
{
  "customerId": 1, 
  "totalAmount": 90000000.00,
  "items": [
    {
      "variantId": 1,
      "quantity": 2,
      "priceAtTime": 45000000.00,
      "stockItemIds": [101, 102]
    }
  ]
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "ປິດບິນຂາຍ (Checkout) ສຳເລັດ",
  "data": {
    "id": 5,
    "employeeId": 1,
    "customerId": 1,
    "totalAmount": 90000000.00,
    "status": "PAID",
    "createdAt": "2026-05-18T13:20:00.000Z"
  }
}
```

### 🧾 3.2 ດຶງປະຫວັດບິນຂາຍທັງໝົດ (Get All Orders)
* **Method:** `GET`
* **URL:** `/api/orders`

### ❌ 3.3 ຍົກເລີກບິນຂາຍ (Cancel Order) - 🔒 Admin & Cashier Only
* **Method:** `POST`
* **URL:** `/api/orders/cancel/:id`
* **Response (200 OK):** *(ລະບົບຈະຄືນສະຕັອກ IMEI ໃຫ້ອັດຕະໂນມັດ)*
```json
{
  "success": true,
  "message": "ຍົກເລີກບິນຂາຍສຳເລັດ"
}
```

---

## 4. ລະບົບສະຕັອກ & ເລກ IMEI (`/api/stocks`)

### 🔍 4.1 ຍິງບາໂຄ້ດເຊັກ IMEI / S/N (Check IMEI)
* **Method:** `GET`
* **URL:** `/api/stocks/check/:serialNumber` (ເຊັ່ນ: `/api/stocks/check/352617283948571`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "variantId": 1,
    "serialNumber": "352617283948571",
    "status": "AVAILABLE",
    "variant": {
      "id": 1,
      "color": "Titanium Black",
      "price": 45000000.00,
      "product": {
        "name": "iPhone 15 Pro Max"
      }
    }
  }
}
```

### 📥 4.2 ເພີ່ມເລກ IMEI ຮັບເຄື່ອງເຂົ້າຄັງ (Add IMEI) - 🔒 Admin Only
* **Method:** `POST`
* **URL:** `/api/stocks/add`
* **Request Body (JSON):**
```json
{
  "variantId": 1,
  "serialNumber": "352617283948572"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "ເພີ່ມເລກ IMEI ເຂົ້າສະຕັອກສຳເລັດ",
  "data": {
    "id": 102,
    "variantId": 1,
    "serialNumber": "352617283948572",
    "status": "AVAILABLE"
  }
}
```

---

## 5. ລະບົບລູກຄ້າສະມາຊິກ (`/api/customers`)

### 👥 5.1 ຄົ້ນຫາລູກຄ້າດ້ວຍເບີໂທ (Get Customer By Phone)
* **Method:** `GET`
* **URL:** `/api/customers/phone/:phone` (ເຊັ່ນ: `/api/customers/phone/02055555555`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ທ້າວ ສົມຊາຍ ໃຈດີ",
    "phone": "02055555555",
    "points": 120
  }
}
```

### ➕ 5.2 ລົງທະບຽນລູກຄ້າໃໝ່ (Create Customer)
* **Method:** `POST`
* **URL:** `/api/customers`
* **Request Body (JSON):**
```json
{
  "name": "ນາງ ສອນສະຫວັນ ດາລາ",
  "phone": "02077777777"
}
```

### 🏆 5.3 ປັບປຸງ/ເພີ່ມຄະແນນລູກຄ້າ (Add Points) - 🔒 Admin Only
* **Method:** `PUT`
* **URL:** `/api/customers/points/:id`
* **Request Body (JSON):**
```json
{
  "points": 50 
}
```

---

## 6. ລະບົບຍີ່ຫໍ້ ແລະ ໝວດໝູ່ (`/api/brands` & `/api/categories`)

### 🏷️ 6.1 ເພີ່ມຍີ່ຫໍ້ໃໝ່ (Create Brand) - 🔒 Admin Only
* **Method:** `POST`
* **URL:** `/api/brands`
* **Request Body (JSON):**
```json
{
  "name": "Xiaomi"
}
```

### 🗂️ 6.2 ເພີ່ມໝວດໝູ່ໃໝ່ (Create Category) - 🔒 Admin Only
* **Method:** `POST`
* **URL:** `/api/categories`
* **Request Body (JSON):**
```json
{
  "name": "Tablet"
}
```

---

## 7. ລະບົບຈັດການ Roles (`/api/roles`)

### 🔑 7.1 ດຶງຂໍ້ມູນ Roles ທັງໝົດ (Get All Roles)
* **Method:** `GET`
* **URL:** `/api/roles`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "ADMIN" },
    { "id": 2, "name": "EMPLOYEE" },
    { "id": 3, "name": "CASHIER" }
  ]
}
```

### 🔑 7.2 ດຶງຂໍ້ມູນ Role ດ້ວຍ ID (Get Role By ID)
* **Method:** `GET`
* **URL:** `/api/roles/:id`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": { "id": 1, "name": "ADMIN" }
}
```

### 🔑 7.3 ສ້າງ Role ໃໝ່ (Create Role) - 🔒 Admin Only
* **Method:** `POST`
* **URL:** `/api/roles`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Body (JSON):**
```json
{
  "name": "MANAGER"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "ສ້າງ Role ໃໝ່ສຳເລັດ",
  "data": { "id": 4, "name": "MANAGER" }
}
```

### 🔑 7.4 ແກ້ໄຂ Role (Update Role) - 🔒 Admin Only
* **Method:** `PUT`
* **URL:** `/api/roles/:id`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Body (JSON):**
```json
{
  "name": "SUPERVISOR"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "ແກ້ໄຂ Role ສຳເລັດ",
  "data": { "id": 4, "name": "SUPERVISOR" }
}
```

### 🔑 7.5 ລຶບ Role (Delete Role) - 🔒 Admin Only
* **Method:** `DELETE`
* **URL:** `/api/roles/:id`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "ລຶບ Role ສຳເລັດ"
}
```
