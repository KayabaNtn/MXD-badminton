# Sprint 1 - Khởi tạo dự án & Xây dựng UI cơ bản

**Thời gian:** 12/05/2026 (1 phiên)
**Dự án:** Website Câu lạc bộ Cầu lông BC Club
**Công nghệ:** React 19 + TypeScript + Vite + Tailwind CSS v4 + react-router-dom + lucide-react

---

## 0. Cách chạy ứng dụng

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Các bước chạy

```bash
# 1. Di chuyển vào thư mục dự án
cd /Users/nhatnt1/Project/TestClaude/badminton-club

# 2. Cài đặt dependencies (chỉ cần làm 1 lần)
npm install

# 3. Khởi động server development
npm run dev
```

### App location (URL)

| Môi trường | URL | Ghi chú |
|------------|-----|---------|
| **Local development** | `http://localhost:5173` | Chạy lệnh `npm run dev` |
| **Network (LAN)** | `http://<IP-máy>:5173` | VD: `http://192.168.1.10:5173` |
| **Production build** | `npm run build` → `dist/` | Dùng `npx serve dist` hoặc deploy lên Vercel/Netlify |

> **Lưu ý:** Server development cần đang chạy ở terminal. Nếu tắt terminal thì app sẽ không truy cập được. Để dừng server nhấn `Ctrl+C`.

### Các trang trong ứng dụng

| Đường dẫn | Mô tả | Yêu cầu đăng nhập |
|-----------|-------|-------------------|
| `http://localhost:5173/` | Trang chủ | ❌ |
| `http://localhost:5173/lich-dau` | Lịch tập & đấu | ❌ |
| `http://localhost:5173/ket-qua` | Kết quả trận đấu | ❌ |
| `http://localhost:5173/thanh-vien` | Danh sách thành viên | ❌ |
| `http://localhost:5173/admin` | Admin Dashboard | ✅ (admin / admin123) |
| `http://localhost:5173/admin/login` | Trang đăng nhập Admin | ❌ |

---

## 1. Kiến trúc tổng quan

```
badminton-club/
├── database/                          # Dữ liệu JSON gốc (seed data)
│   ├── members.json                   # 8 thành viên mẫu
│   ├── sessions.json                  # 9 buổi tập (3 sắp tới, 6 đã xong)
│   ├── registrations.json             # 12 bản ghi đăng ký
│   ├── payments.json                  # 12 bản ghi thanh toán
│   └── results.json                   # 4 kết quả trận đấu
├── public/database/                   # Copy để serve tĩnh (Vite)
├── src/
│   ├── types/index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   ├── cn.ts                      # cn() helper (clsx + tailwind-merge)
│   │   └── db.ts                      # Data layer (localStorage + CRUD)
│   ├── context/AuthContext.tsx         # Auth (admin/admin123, localStorage)
│   ├── components/layout/
│   │   ├── Navbar.tsx                 # Navigation responsive
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Home.tsx                   # Trang chủ
│   │   ├── Sessions.tsx               # Lịch tập & đấu
│   │   ├── Results.tsx                # Kết quả trận đấu
│   │   ├── Members.tsx                # Danh sách thành viên
│   │   └── admin/
│   │       ├── Login.tsx              # Đăng nhập admin
│   │       └── AdminDashboard.tsx     # Dashboard quản lý
│   ├── App.tsx                        # Routing + initDB
│   └── index.css                      # @import "tailwindcss"
```

---

## 2. Database Schema (JSON)

### 2.1. Member
| Field    | Type   | Description       |
|----------|--------|-------------------|
| id       | string | M001, M002, ...   |
| name     | string | Họ tên            |
| phone    | string | Số điện thoại     |
| email    | string | Email             |
| joinDate | string | Ngày tham gia     |
| avatar   | string | Avatar URL        |

### 2.2. Session
| Field          | Type                 | Description                  |
|----------------|----------------------|------------------------------|
| id             | string               | S001, S002, ...              |
| date           | string (YYYY-MM-DD)  | Ngày diễn ra                 |
| time           | string               | "18:00 - 20:00"              |
| location       | string               | Địa điểm                     |
| title          | string               | Tiêu đề buổi tập             |
| description    | string               | Mô tả chi tiết               |
| maxParticipants| number               | Số người tối đa              |
| fee            | number               | Phí tham gia (VND)           |
| status         | "upcoming" | "completed" | Trạng thái                  |
| createdAt      | string (ISO)         | Thời gian tạo                |

### 2.3. Registration
| Field       | Type   | Description          |
|-------------|--------|----------------------|
| sessionId   | string | FK → Session.id      |
| memberId    | string | FK → Member.id       |
| registeredAt| string | Thời gian đăng ký    |

### 2.4. Payment
| Field    | Type    | Description              |
|----------|---------|--------------------------|
| sessionId| string  | FK → Session.id          |
| memberId | string  | FK → Member.id           |
| paid     | boolean | Đã đóng tiền?            |
| paidAt   | string  | Thời gian đóng           |

### 2.5. Result
| Field    | Type              | Description                |
|----------|-------------------|----------------------------|
| id       | string            | R001, R002, ...            |
| sessionId| string            | FK → Session.id            |
| type     | "single"|"double" | Loại trận đấu              |
| player1  | string (optional) | Member ID (đơn)            |
| player2  | string (optional) | Member ID (đơn)            |
| team1    | string[] (opt)    | Member IDs (đôi)           |
| team2    | string[] (opt)    | Member IDs (đôi)           |
| score1   | number            | Điểm đội/người 1           |
| score2   | number            | Điểm đội/người 2           |
| winner   | string            | Member ID hoặc "team1"/"team2" |
| notes    | string            | Ghi chú                    |

---

## 3. Data Layer (db.ts)

### Storage cơ chế
- **Khởi tạo:** Lần đầu, đọc từ file JSON trong `public/database/` → lưu vào localStorage key `badminton_club`
- **Đọc/ghi:** Luôn đọc/ghi từ localStorage
- **Tự động ID:** Sử dụng prefix + số max + 1 (ví dụ M009, S010, R005)
- **Cascade delete:**
  - Xóa member → xóa registrations + payments liên quan
  - Xóa session → xóa registrations + payments + results liên quan

### API functions
| Function | Mô tả |
|----------|-------|
| `initDB()` | Khởi tạo dữ liệu từ JSON vào localStorage |
| `getMembers()` | Lấy danh sách thành viên |
| `addMember({name, phone, email})` | Thêm thành viên |
| `updateMember(id, data)` | Sửa thành viên |
| `deleteMember(id)` | Xóa thành viên + cleanup |
| `getSessions()` | Lấy danh sách buổi tập |
| `addSession(data)` | Thêm buổi tập |
| `updateSession(id, data)` | Sửa buổi tập |
| `deleteSession(id)` | Xóa buổi tập + cleanup |
| `getRegistrations()` | Lấy danh sách đăng ký |
| `addRegistration(sessionId, memberId)` | Đăng ký tham gia + auto tạo payment record |
| `removeRegistration(sessionId, memberId)` | Hủy đăng ký + xóa payment record |
| `getPayments()` | Lấy danh sách thanh toán |
| `togglePayment(sessionId, memberId)` | Chuyển trạng thái đã đóng/chưa đóng |
| `getResults()` | Lấy kết quả trận đấu |
| `addResult(data)` | Thêm kết quả |
| `deleteResult(id)` | Xóa kết quả |
| `getSessionWithDetails(sessionId)` | Lấy session + members + payments + results |
| `formatCurrency(amount)` | Format VND |
| `formatDate(dateStr)` | Format dd/mm/yyyy |
| `formatDateTime(dateStr)` | Format dd/mm/yyyy HH:MM |

---

## 4. Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Home | - |
| `/lich-dau` | Sessions | - |
| `/ket-qua` | ResultsPage | - |
| `/thanh-vien` | Members | - |
| `/admin` | AdminDashboard | ✅ (nếu chưa đăng nhập → redirect /admin/login) |
| `/admin/login` | Login | - |

---

## 5. Pages chi tiết

### 5.1. Trang chủ (`/`)
- Hero gradient (blue-600 → blue-800) với title + description + CTA
- 3 stat cards: Thành viên (8), Buổi tập (9), Lượt đăng ký (12)
- Grid 3 cột hiển thị 3 buổi tập sắp tới (có badge, ngày, giờ, địa điểm, phí)
- Preview kết quả gần đây
- **Loading state:** Spinner animation

### 5.2. Lịch đấu (`/lich-dau`)
- Chia 2 section: "Buổi sắp tới" (animated pulse dot) và "Buổi đã diễn ra"
- Each session là expandable card (click để mở rộng)
- Card header: badge status + date + title + time + location + registered/max + fee
- Expanded content:
  - Description text
  - 2 columns: Danh sách đã đăng ký (mỗi member có badge Đã đóng/Chưa đóng) + Tình trạng đóng tiền (thống kê + tổng thu)
  - Kết quả trận đấu (nếu có)
- **Empty state:** CalendarDays icon + "Chưa có buổi tập nào sắp tới"

### 5.3. Kết quả (`/ket-qua`)
- Search input filter (tìm theo tên giải đấu, tên người chơi)
- Card kết quả: header (giải đấu + ngày), body (tỷ số, highlight người thắng màu xanh)
- Hỗ trợ hiển thị: đơn (2 cột tên + tỷ số giữa) và đôi (2 hàng team)
- Notes hiển thị italic nếu có
- **Empty state:** Award icon + "Không có kết quả nào"

### 5.4. Thành viên (`/thanh-vien`)
- Search input filter (tìm theo tên)
- Responsive grid: 1 cột (mobile) / 2 cột (tablet) / 3 cột (desktop)
- Card: Avatar chữ cái đầu gradient + tên + ID + phone + email + ngày tham gia
- **Empty state:** Users icon + "Không tìm thấy thành viên"

### 5.5. Admin - Login (`/admin/login`)
- Shield icon + form đăng nhập
- Fields: username + password (toggle show/hide)
- Error state: message đỏ + bg-red-50
- **Default credentials:** admin / admin123
- Validation: required fields
- Lưu session qua localStorage key `badminton_admin`

### 5.6. Admin - Dashboard (`/admin`)
- 4 stat cards: Buổi sắp tới, Thành viên, Đăng ký, Tổng thu
- Tab navigation: Tổng quan | Quản lý buổi tập | Thành viên | Đăng ký & Thanh toán
- **Tab 1 - Tổng quan:**
  - Danh sách 5 buổi tập gần nhất (dot xanh/xám + tên + ngày + số ĐK + số ĐT)
  - 2 cards: Thành viên mới nhất + Thanh toán gần đây
- **Tab 2 - Quản lý buổi tập (CRUD thật):**
  - Bảng: Title, Date, Time, Location, Fee, Status, Actions (Edit/Delete)
  - Button "Thêm buổi" → form inline với các fields (title, date, time, location, description, maxParticipants, fee, status)
  - Edit: pre-fill form, save = update
  - Delete: confirm dialog → delete + cascade
  - Loading state per operation (saving button)
- **Tab 3 - Thành viên (CRUD thật):**
  - Grid cards với hover actions (Edit/Delete icons)
  - Add/Edit form inline (name, phone, email)
  - Delete: confirm dialog → delete + cascade cleanup
- **Tab 4 - Đăng ký & Thanh toán (CRUD thật):**
  - Select dropdown chọn buổi tập
  - 3 stat boxes: Đã đăng ký / Đã đóng / Chưa đóng (cập nhật realtime)
  - Danh sách tất cả members với 2 actions:
    - "Đăng ký" / "Hủy ĐK" (blue ↔ red)
    - "Đã đóng" / "Chưa đóng" (green ↔ yellow) - chỉ hiện nếu đã đăng ký
  - Processing state per member (disabled + "...")

---

## 6. Seed Data

### 6.1. Members (8)
| ID | Name | Phone | Email |
|----|------|-------|-------|
| M001 | Nguyễn Văn An | 0901234567 | an.nguyen@example.com |
| M002 | Trần Thị Bình | 0912345678 | binh.tran@example.com |
| M003 | Lê Hoàng Cường | 0923456789 | cuong.le@example.com |
| M004 | Phạm Minh Dũng | 0934567890 | dung.pham@example.com |
| M005 | Hoàng Thị Em | 0945678901 | em.hoang@example.com |
| M006 | Đỗ Văn Phúc | 0956789012 | phuc.do@example.com |
| M007 | Vũ Thị Hà | 0967890123 | ha.vu@example.com |
| M008 | Ngô Văn Huy | 0978901234 | huy.ngo@example.com |

### 6.2. Sessions (9)
- 6 completed (tháng 5/2025), 3 upcoming (tháng 5/2026)
- Fee range: 50,000 - 100,000 VND
- Locations: Quận 1, Quận 3, Quận 7

### 6.3. Registrations (12)
- S007: 6 members registered
- S008: 3 members registered
- S009: 3 members registered

### 6.4. Payments (12)
- S007: 4 paid, 2 unpaid
- S008: 2 paid, 1 unpaid
- S009: 1 paid, 2 unpaid

### 6.5. Results (4)
- 2 trận đơn (S002 - giao hữu tháng 5)
- 2 trận đôi (S005 - giải nội bộ tháng 5)

---

## 7. UI/UX

### 7.1. Theme
- **Primary:** Blue (blue-600, blue-700, blue-800)
- **Background:** Gray 50 (#F9FAFB)
- **Cards:** White (#FFFFFF) + border gray-200
- **Status colors:** Green (success/upcoming/paid), Red (unpaid/delete), Orange (results), Yellow (pending), Purple (stats)
- **Font:** System UI sans-serif (Tailwind default)

### 7.2. Layout
- **Sticky navbar** trên cùng (z-50)
- **Responsive:** Desktop (max-w-7xl) + Mobile (hamburger/hidden)
- **Footer:** border-t gray-200, copyright
- **min-h-screen** flex column (footer luôn ở dưới)

### 7.3. Components
- Button variants: primary (blue-600), ghost (hover bg-gray-50), danger (red-600)
- Badge: rounded-full, text-xs, font-medium
- Cards: rounded-xl, shadow-sm, border, hover:shadow-md
- Tables: full-width, border-b, hover bg-gray-50
- Loading: spinner animate-spin (blue-600)
- Empty states: icon 48px (w-12 h-12) + message

### 7.4. Responsive breakpoints
| Breakpoint | Width | Changes |
|------------|-------|---------|
| Mobile (default) | < 768px | 1 column, hidden text labels, scrollable nav |
| Tablet (md) | ≥ 768px | 2 columns, full nav |
| Desktop (lg) | ≥ 1024px | 3 columns |

---

## 8. Authentication

### Thông số
- **Username:** admin
- **Password:** admin123
- **Storage:** localStorage key `badminton_admin` (JSON: `{ username: "admin" }`)
- **Guard:** AdminDashboard kiểm tra `isAuthenticated`, nếu false → redirect `/admin/login`
- **Login form:**
  - Validation: required fields
  - Error message for wrong credentials
  - Show/hide password toggle (Eye icon)

---

## 9. Kết quả & Phát hiện

### Đã hoàn thành Sprint 1
1. ✅ Khởi tạo dự án với Vite + React 19 + TypeScript
2. ✅ Cài đặt và cấu hình Tailwind CSS v4
3. ✅ Thiết kế database schema (5 collections)
4. ✅ Xây dựng data layer (localStorage persistence)
5. ✅ Tạo seed data (8 members, 9 sessions, 12 registrations, 12 payments, 4 results)
6. ✅ Xây dựng UI (Navbar, Footer, Layout)
7. ✅ Trang chủ (hero + stats + upcoming sessions)
8. ✅ Lịch đấu (expandable cards với chi tiết ĐK & thanh toán)
9. ✅ Kết quả (search + single/double display)
10. ✅ Thành viên (search + responsive grid)
11. ✅ Admin login (form validation + error handling)
12. ✅ Admin dashboard (4 tabs: overview, sessions CRUD, members CRUD, registrations & payments CRUD)
13. ✅ TypeScript - zero errors
14. ✅ 100% CRUD operations lưu vào localStorage thật

### Các vấn đề kỹ thuật đã fix
- TypeScript type narrowing với union type `"upcoming" | "completed"`
- useCallback dependency array cho async loadData
- Cascade delete khi xóa member/session

---

## 10. Kế hoạch Sprint 2 (gợi ý)

### Gợi ý tính năng tiếp theo
1. **Notification/Toast** system (thông báo CRUD thành công thay vì alert)
2. **Import/Export dữ liệu** (tải JSON, backup, restore)
3. **Thống kê biểu đồ** (chart.js/recharts) - doanh thu theo tháng, số lượng tham gia
4. **Kết quả CRUD** (thêm/sửa/xóa kết quả trận đấu từ admin)
5. **Search/Sort/Filter nâng cao** (sắp xếp theo ngày, phí, ...)
6. **Pagination** cho danh sách dài
7. **Dark mode** toggle
8. **Responsive cải thiện** thêm cho màn hình nhỏ
9. **In ấn / Export PDF** danh sách đăng ký, báo cáo thu
10. **Multi-language** (Tiếng Việt / English)
11. **Modal dialog** components thay vì inline forms
12. **Email/SMS reminder** (giả lập, gửi đến thành viên đăng ký trước buổi tập)

### Cần cải thiện
- [ ] Sử dụng Modal component cho form CRUD (thay vì inline)
- [ ] Toast notifications (không dùng alert())
- [ ] Form validation chi tiết hơn (regex phone, email)
- [ ] Loading skeleton (thay vì spinner đơn giản)
- [ ] Error boundary + fallback UI