# Khang Trading — AI Dashboard

## 🚀 Deploy lên Vercel (3 bước, ~15 phút)

---

### BƯỚC 1 — Đưa code lên GitHub

1. Tạo tài khoản GitHub tại https://github.com (nếu chưa có)
2. Nhấn **New repository** → đặt tên `khang-trading` → **Create repository**
3. Tải **GitHub Desktop** tại https://desktop.github.com
4. Mở GitHub Desktop → **Add** → **Add Existing Repository**
5. Trỏ vào thư mục `khang-trading` bạn vừa giải nén
6. **Commit to main** → **Publish repository**

---

### BƯỚC 2 — Deploy lên Vercel (FREE)

1. Vào https://vercel.com → **Sign up with GitHub**
2. Click **New Project** → Import repo `khang-trading`
3. Vercel tự nhận Vite → click **Deploy**
4. Chờ ~2 phút → Done ✅

**Link của bạn sẽ là:** `khang-trading.vercel.app`  
Mỗi lần bạn push code mới lên GitHub → Vercel tự deploy lại.

---

### BƯỚC 3 — Domain tùy chọn

**Free (tự động):** `khang-trading.vercel.app`

**Custom domain (~200k/năm):**
1. Mua domain tại https://namecheap.com hoặc https://tenten.vn (`.vn` domain)
2. Trong Vercel → **Settings** → **Domains** → Add domain
3. Làm theo hướng dẫn DNS của Vercel (~5 phút)

Ví dụ: `khangtrade.vn` hoặc `goldmind.vn`

---

### Chạy local để test

```bash
npm install
npm run dev
```
Mở http://localhost:5173

**Lưu ý:** Giá thật (từ Yahoo Finance) chỉ hoạt động khi deploy trên Vercel  
vì cần serverless function `/api/prices.js` chạy server-side.  
Khi chạy local, dashboard tự động chuyển sang **SIM mode** (giá mô phỏng).

---

### Cấu trúc project

```
khang-trading/
├── src/
│   ├── App.jsx        ← Dashboard chính
│   └── main.jsx       ← Entry point
├── api/
│   └── prices.js      ← API giá thật (Vercel serverless)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

### Cần hỗ trợ? 
Gửi câu hỏi cho Khang Trading support.
