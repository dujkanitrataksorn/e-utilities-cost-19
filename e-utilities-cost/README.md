# e-utilities-cost

ระบบควบคุม-ติดตามค่าสาธารณูปโภคของหน่วยงาน/สถานศึกษา (Utility Expense Tracking & Control System)

บันทึก ติดตาม และสรุปรายงานค่าสาธารณูปโภค แยกตามประเภทและหมวดเงินงบประมาณ พร้อม Dashboard สรุปยอดรายเดือน เปรียบเทียบย้อนหลัง ใช้งานได้ทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ

## Tech Stack

| ส่วนงาน | เทคโนโลยี |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | Vue 3 (Composition API) + Vite + Tailwind CSS |
| Database | MariaDB |
| DB Admin | phpMyAdmin |
| Authentication | JWT + bcrypt |
| ORM | Sequelize |
| Container | Docker + Docker Compose |
| Chart | Chart.js (vue-chartjs) |
| State | Pinia |

## เริ่มใช้งานด้วย Docker (แนะนำ)

```bash
# 1. คัดลอกและแก้ไข .env (เปลี่ยนรหัสผ่าน/secret ทุกตัวก่อนใช้งานจริง)
cp .env.example .env   # ถ้ายังไม่มี .env

# 2. รันทั้งระบบ
docker compose up -d --build

# 3. Seed ข้อมูลเริ่มต้น (ประเภทค่าใช้จ่าย, หมวดเงิน, admin user)
docker compose exec backend node src/seed.js
```

เข้าใช้งาน:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- phpMyAdmin: http://localhost:8081
- Login เริ่มต้น: `admin` / `admin1234` (**เปลี่ยนรหัสผ่านทันทีหลัง login ครั้งแรก**)

## พัฒนาแบบ Local (ไม่ใช้ Docker สำหรับ backend/frontend)

### Backend
```bash
cd backend
cp .env.example .env   # แก้ DB_HOST=localhost ถ้า MariaDB รันนอก Docker
npm install
npm run seed            # seed ข้อมูลเริ่มต้นครั้งแรก
npm run dev              # ใช้ nodemon
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

> หมายเหตุ: ต้องมี MariaDB รันอยู่ก่อน (ใช้ `docker compose up -d mariadb phpmyadmin` ได้เช่นกัน)

## Build & Push ขึ้น Docker Hub

```bash
docker login
docker build -t <dockerhub-username>/e-utilities-cost-backend:latest ./backend
docker build -t <dockerhub-username>/e-utilities-cost-frontend:latest ./frontend
docker push <dockerhub-username>/e-utilities-cost-backend:latest
docker push <dockerhub-username>/e-utilities-cost-frontend:latest
```

## โครงสร้าง API หลัก

| Endpoint | คำอธิบาย |
|---|---|
| `POST /api/auth/login` | เข้าสู่ระบบ |
| `POST /api/auth/logout` | ออกจากระบบ |
| `POST /api/auth/refresh` | ขอ access token ใหม่ |
| `GET /api/auth/me` | ข้อมูล user ปัจจุบัน |
| `GET/POST/PUT/DELETE /api/expense-categories` | จัดการประเภทค่าใช้จ่าย |
| `GET/POST/PUT/DELETE /api/budget-categories` | จัดการหมวดเงิน |
| `GET/POST/PUT/DELETE /api/expenses` | จัดการรายการค่าใช้จ่าย (รองรับ filter `month`, `year`, `expense_category_id`, `budget_category_id`) |
| `GET /api/dashboard/summary?year=` | สรุปยอดรวมรายเดือนทั้งปี |
| `GET /api/dashboard/by-category?year=` | สรุปแยกตามประเภทค่าใช้จ่าย |
| `GET /api/dashboard/by-budget?year=` | สรุปแยกตามหมวดเงิน |
| `GET /api/dashboard/compare?year1=&year2=` | เปรียบเทียบยอดรวมรายเดือนระหว่าง 2 ปี |

## Security

- Password hash ด้วย bcrypt (salt rounds 10)
- JWT secret เก็บใน `.env` (ห้าม commit จริง)
- `helmet`, `cors` (จำกัด origin), `express-rate-limit` ป้องกัน brute force login
- Refresh token เก็บใน httpOnly cookie, access token เก็บใน memory (Pinia) ฝั่ง frontend เพื่อลดความเสี่ยง XSS

## เอกสารออกแบบเต็ม

ดูรายละเอียดการออกแบบระบบทั้งหมด (DB schema, wireframe แนวคิด, milestones) ได้ที่ [`plan.md`](./plan.md)
