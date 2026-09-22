# 🚀 Deploy PHANACEA — GitHub + Vercel

คู่มือนี้พาไปทีละขั้น ตั้งแต่ push โค้ดขึ้น GitHub จนเว็บออนไลน์จริงบน Vercel

---

## 0. ก่อนเริ่ม — ตรวจสอบความปลอดภัย

**สำคัญที่สุด:** `backend/.env` มี `SUPABASE_SERVICE_ROLE_KEY` ซึ่งเข้าถึงฐานข้อมูล
ได้ทั้งหมดและข้าม Row Level Security — **ห้าม commit เด็ดขาด**

```bash
# ยืนยันว่า git จะไม่แตะไฟล์ .env (ต้องไม่มีอะไรแสดงออกมา)
git status --short | grep "\.env$"
```

ถ้าเคยเผลอ push ขึ้นไปแล้ว ให้ไป Supabase → Project Settings → API → **Reset**
service role key ทันที แล้วอัปเดตค่าใหม่ใน Vercel

---

## 1. Push ขึ้น GitHub

```bash
cd phanacea_pharmacist_business

git init
git branch -M main
git add .
git commit -m "PHANACEA: storefront + admin console + live support chat"

# สร้าง repo เปล่าไว้ก่อนที่ https://github.com/new (อย่าติ๊ก README)
git remote add origin https://github.com/<YOUR-USERNAME>/phanacea.git
git push -u origin main
```

ครั้งต่อไปแค่:

```bash
git add .
git commit -m "อธิบายสิ่งที่แก้"
git push
```

---

## 2. เตรียมฐานข้อมูล (Supabase)

เปิด Supabase → **SQL Editor** แล้วรันตามลำดับ:

| ลำดับ | ไฟล์ | ทำอะไร |
| --- | --- | --- |
| 1 | `database/schema.sql` | สร้างตาราง + ฟังก์ชันทั้งหมด |
| 2 | `database/migrations/001_checkout_fix.sql` | ลบฟังก์ชัน `checkout_sale` เวอร์ชันเก่าที่ซ้ำซ้อน |
| 3 | `database/migrations/002_live_chat.sql` | เพิ่มคอลัมน์สำหรับแชทสด |
| 4 | `database/migrations/003_staff_email.sql` | เพิ่มคอลัมน์ `email` ให้ `staff` (จำเป็นสำหรับหน้าล็อกอินรวม `/login`) |
| 5 | `database/seed.sql` | ข้อมูลตัวอย่าง (ข้ามได้ถ้าไม่ต้องการ) |

> ทุกไฟล์รันซ้ำได้อย่างปลอดภัย (idempotent)

จากนั้นสร้างบัญชีผู้ดูแลระบบ — ทำจากเครื่องตัวเองได้เลย:

```bash
cd backend
npm run create-admin -- --username admin --email admin@yourdomain.com --password 'YourStrongPass123'
```

---

## 3. Deploy บน Vercel — โปรเจกต์เดียว จบในหน้าเดียว

ตั้งแต่คอมมิตนี้ root `vercel.json` + `api/index.js` ทำให้ **โปรเจกต์ Vercel เดียว**
serve ได้ทั้งหน้าเว็บ (frontend, static) และ API (`/api/*`, serverless function)
จากโดเมนเดียวกัน — ไม่ต้องแยก 2 โปรเจกต์ ไม่ต้องตั้งค่า CORS ข้ามโดเมน

Vercel → **Add New → Project** → เลือก repo ที่เพิ่ง push

| ตั้งค่า | ค่า |
| --- | --- |
| Project Name | `phanacea` |
| **Root Directory** | เว้นว่างไว้ (root ของ repo) ← **สำคัญมาก อย่าตั้งเป็น `backend` หรือ `frontend`** |
| Framework Preset | Other |

Build/Install/Output ถูกกำหนดไว้แล้วใน root `vercel.json` (ไม่ต้องแก้ใน UI):
`installCommand` ติดตั้ง dependency ทั้ง backend และ frontend, `buildCommand`
build เฉพาะ frontend, `outputDirectory` คือ `frontend/dist`

**Environment Variables** (Settings → Environment Variables) — ใส่ให้ครบก่อน Deploy ครั้งแรก:

```
NODE_ENV=production
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
JWT_SECRET=<สุ่มยาว ๆ ดูคำสั่งด้านล่าง>
JWT_EXPIRES_IN=7d
CHECKOUT_STAFF_USERNAME=admin
FRONTEND_URL=https://phanacea.vercel.app
VITE_API_BASE_URL=/api
```

สุ่ม `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `FRONTEND_URL` ตั้งเป็นโดเมนของโปรเจกต์นี้เอง (จะได้ค่าจริงหลัง Deploy ครั้งแรก
> — ใส่ค่าประมาณไปก่อนได้ เช่น `https://phanacea.vercel.app`, ค่อยแก้ให้ตรงทีหลัง
> แล้ว redeploy) `VITE_API_BASE_URL=/api` คือ path สัมพัทธ์ (relative) เพราะหน้าเว็บ
> กับ API อยู่โดเมนเดียวกันแล้ว **ห้ามใส่ URL เต็มของ api.vercel.app แบบเดิม**

กด **Deploy** แล้วทดสอบ:

```bash
curl https://phanacea.vercel.app/api/health
# {"success":true,"message":"PHANACEA API is running"}
```

เปิด `https://phanacea.vercel.app` ในเบราว์เซอร์ — ควรเห็นหน้าร้านเต็มรูปแบบ
พร้อมใช้งานจริง (ไม่ใช่แค่ JSON ของ API)

---

## 4. ตรวจสอบหลัง deploy

- [ ] `https://phanacea.vercel.app/api/health` ตอบ `success: true`
- [ ] เปิดหน้าร้าน เห็นรายการสินค้า
- [ ] สมัครสมาชิก → ล็อกอิน → หยิบสินค้า → **สั่งซื้อสำเร็จ**
- [ ] `/chat` ส่งข้อความได้
- [ ] `/login` ล็อกอินด้วยบัญชี admin ได้ (พาไปหน้า `/admin` อัตโนมัติ)
- [ ] `/admin/chat` เห็นข้อความจากลูกค้าและตอบกลับได้
- [ ] รีเฟรชหน้า `/admin/orders` ตรง ๆ แล้วไม่ขึ้น 404 (SPA rewrite ทำงาน)

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
| --- | --- |
| หน้าเว็บโหลดได้แต่ไม่มีข้อมูล, console ขึ้น CORS | `FRONTEND_URL` ไม่ตรงกับโดเมนจริงของโปรเจกต์ หรือ `VITE_API_BASE_URL` ยังชี้ไปโดเมนอื่น — แก้แล้ว **redeploy** |
| ทุก API เป็น 404 | Root Directory ถูกตั้งเป็น `backend` หรือ `frontend` (ของโปรเจกต์เดี่ยวนี้ต้องเว้นว่างไว้ที่ root) |
| ทุกหน้าเป็น `500 FUNCTION_INVOCATION_FAILED` | ดู Runtime Logs — ถ้าขึ้น error จาก `backend/src/app.js` ตรง ๆ ให้เช็ค env vars (`SUPABASE_URL`, `JWT_SECRET` ฯลฯ) ว่าตั้งครบหรือยัง |
| Deploy ล้มเหลวตั้งแต่ build, log ขึ้น "set Root Directory to backend or frontend" | เป็น vercel.json เก่าจากตอนแยก 2 โปรเจกต์ — ดึงโค้ดล่าสุดแล้ว deploy ใหม่ (root `vercel.json` ตอนนี้ build ได้จริงแล้ว ไม่ได้ตั้งใจให้ fail อีกต่อไป) |
| รีเฟรชหน้าใน `/products` แล้ว 404 | root `vercel.json` หาย หรือ rewrite ถูกแก้ — ต้องมี `{ "source": "/(.*)", "destination": "/index.html" }` เป็นกฎสุดท้าย |
| API ขึ้น `JWT_SECRET must be set...` | ยังไม่ได้ตั้ง `JWT_SECRET` (ตัวแอปกันไว้ไม่ให้ใช้ค่า dev ใน production) |
| สั่งซื้อไม่ได้ ขึ้นว่าพบฟังก์ชันซ้ำซ้อน | ยังไม่ได้รัน `database/migrations/001_checkout_fix.sql` |
| ล็อกอิน admin ไม่ได้ | รัน `npm run create-admin` อีกครั้งเพื่อตั้งรหัสผ่านใหม่ |

---

## แนวทางอื่น: แยก backend / frontend เป็น 2 โปรเจกต์

`backend/vercel.json` และ `frontend/vercel.json` ยังอยู่ในโปรเจกต์ — ถ้าอยาก scale
สองฝั่งแยกกัน (เช่น backend ไปแอตแทช domain อื่น หรือ deploy คนละความถี่) ยังตั้ง
Root Directory เป็น `backend` กับ `frontend` แยกโปรเจกต์กันได้เหมือนเดิม แค่ต้องตั้ง
`FRONTEND_URL` (ฝั่ง backend) กับ `VITE_API_BASE_URL` (ฝั่ง frontend, ใส่ URL เต็ม
ของโปรเจกต์ backend ลงท้ายด้วย `/api`) ให้ชี้หากันเองข้ามโดเมน — สำหรับส่วนใหญ่
วิธีโปรเจกต์เดียวด้านบนง่ายกว่าและไม่มีเรื่อง CORS ให้ปวดหัว

---

## หมายเหตุเรื่อง serverless

Backend รันเป็น serverless function บน Vercel ซึ่งมีผลสองอย่าง:

1. **Rate limit นับแยกต่อ instance** — `express-rate-limit` เก็บสถานะในหน่วยความจำ
   ซึ่งไม่ได้แชร์ข้ามหลาย instance ยังกันการยิงรัว ๆ ได้ แต่ไม่ใช่โควตาที่แม่นยำ
   ระดับบัญชี ถ้าต้องการแบบนั้นให้ใช้ store ภายนอก (เช่น Upstash Redis)
2. **ไม่มี WebSocket** — แชทจึงใช้การ poll ทุก 4 วินาที ซึ่งเข้ากับ serverless
   ได้ดีและไม่ต้องมีเซิร์ฟเวอร์ที่รันค้างไว้
