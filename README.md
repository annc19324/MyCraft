# My Craft - Cửa hàng bán đồ handmade

**MSSV**: 22810310030
**Họ tên**: Lê Thiên An  
**Lớp**: D17CNPM1

**MSSV**: 22810310019
**Họ tên**: Lò Văn Anh
**Lớp**: D17CNPM1

**MSSV**: 22810310027
**Họ tên**: Ngô Thành Công
**Lớp**: D17CNPM1

---

## Giới thiệu
Hệ thống bán hàng trực tuyến chuyên về sản phẩm làm thủ công - handmade, hỗ trợ:
- Đăng nhập / Đăng ký
- Xem sản phẩm, thêm vào giỏ hàng
- Thanh toán
- Quản trị: Thêm/sửa/xóa sản phẩm, theo dõi đơn hàng

---

## Công nghệ sử dụng
- **Frontend**: ReactJS, Axios, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Thư viện**: Multer, bcrypt, jwt, dotenv

---

## Cấu trúc thư mục
MyCraft/
├── client/                 # Frontend (React)
│   ├── public/             # File tĩnh: index.html, favicon
│   ├── src/                # Source code React
│   │   ├── components/     # Các component (Header, ProductCard, Cart...)
│   │   ├── pages/          # Các trang (Home, Login, AdminDashboard...)
│   │   ├── services/       # Gọi API (axios)
│   │   └── App.js, index.js
│   └── package.json
│
├── server/                 # Backend (Node.js + Express)
│   ├── config/             # Cấu hình DB
│   ├── controllers/        # Xử lý logic
│   ├── middleware/         # Auth, checkAdmin
│   ├── models/             # Schema MongoDB (User, Product, Cart, Order)
│   ├── routes/             # API routes (auth, products, upload...)
│   ├── uploads/            # Ảnh sản phẩm (không push lên GitHub)
│   ├── .env                # Biến môi trường (không push)
│   └── server.js
│
└── README.md 


---

## Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js >= 18 (v18.20.5)
- tài khoản MongoDB (https://cloud.mongodb.com)

### Bước 1: Clone dự án

git clone https://github.com/annc19324/MyCraft.git
cd MyCraft

### Bước 2: Cài đặt

# Backend
cd server
npm install

# Frontend
cd ../client
npm install

## Bước 3: Cấu hình DB
tạo .env
MONGODB_URI=mongodb+srv://taikhoan:matkhau@tencluster.zrdb1cv.mongodb.net/mycraft?retryWrites=true&w=majority
PORT=5000
JWT_SECRET= mã bí mật tự tạo

## Bước 4: import database
mongorestore --uri "mongodb+srv://taikhoan:matkhau@tencluster.zrdb1cv.mongodb.net/mycraft" --dir backup_mycraft/mycraft

## Bước 5: Chạy hệ thống
# Terminal 1: Backend
cd server
npm start hoặc node server.js

# Terminal 2: Frontend
cd client
npm start

# Tài khoản demo
admin 12345
user 12345


# Kết quả và hình ảnh giao diện
1. đăng nhập
<img width="639" height="580" alt="image" src="https://github.com/user-attachments/assets/e2c91ce3-a288-4731-b9ca-b7d6eaaa0f66" />

2. đăng ký
<img width="509" height="813" alt="image" src="https://github.com/user-attachments/assets/03956d04-54bf-46e5-bdd5-42e2968eaca8" />

3. trang chủ
<img width="692" height="735" alt="image" src="https://github.com/user-attachments/assets/3bbad803-d78e-49e4-865d-c0d58f906cf2" />

4. xem chi tiết sản phẩm
<img width="649" height="410" alt="image" src="https://github.com/user-attachments/assets/6b63eaf0-368b-4fdb-a5a2-3a994d4ebb19" />

5. thêm vào giỏ hàng
<img width="675" height="297" alt="image" src="https://github.com/user-attachments/assets/c5b801fe-f233-4014-80ce-b95a193ebe90" />

6. giao diện admin
<img width="653" height="556" alt="image" src="https://github.com/user-attachments/assets/7dc6e920-4189-4236-8ce6-2e30405f5a2c" />
