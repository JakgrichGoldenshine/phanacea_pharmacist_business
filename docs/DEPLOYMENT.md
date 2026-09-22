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

git init,5ff
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

## 3. Deploy Backend (API) บน Vercel

Vercel → **Add New → Project** → เลือก repo ที่เพิ่ง push

| ตั้งค่า | ค่า |
| --- | --- |
| Project Name | `phanacea-api` |
| **Root Directory** | `backend` ← **สำคัญมาก** |
| Framework Preset | Other |

**Environment Variables** (Settings → Environment Variables):

```
NODE_ENV=production
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
JWT_SECRET=<สุ่มยาว ๆ ดูคำสั่งด้านล่าง>
JWT_EXPIRES_IN=7d
CHECKOUT_STAFF_USERNAME=admin
FRONTEND_URL=https://phanacea.vercel.app
```

สุ่ม `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `FRONTEND_URL` ยังไม่รู้ตอนนี้ก็ไม่เป็นไร — ใส่ค่าชั่วคราวไปก่อน แล้วกลับมาแก้
> ในขั้นที่ 5 (ถ้าไม่ตรง เบราว์เซอร์จะบล็อกด้วย CORS)

กด **Deploy** แล้วทดสอบ:

```bash
curl https://phanacea-api.vercel.app/api/health
# {"success":true,"message":"PHANACEA API is running"}
```

---

## 4. Deploy Frontend บน Vercel

Vercel → **Add New → Project** → เลือก repo **เดิม** อีกครั้ง

| ตั้งค่า | ค่า |
| --- | --- |
| Project Name | `phanacea` |
| **Root Directory** | `frontend` ← **สำคัญมาก** |
| Framework Preset | Vite (ตรวจพบอัตโนมัติ) |

**Environment Variables:**

```
VITE_API_BASE_URL=https://phanacea-api.vercel.app/api
```

> ต้องลงท้ายด้วย `/api` และห้ามมี `/` ปิดท้าย

กด **Deploy**

---

## 5. เชื่อมสองฝั่งเข้าหากัน (CORS)

กลับไปที่โปรเจกต์ **phanacea-api** → Environment Variables → แก้:

```
FRONTEND_URL=https://phanacea.vercel.app
```

ถ้าต้องการให้ preview deployment (ทุก pull request ได้โดเมนใหม่) ใช้งานได้ด้วย:

```
FRONTEND_PREVIEW_PATTERN=^https://phanacea-[a-z0-9-]+\.vercel\.app$
```

รองรับหลายโดเมนได้ด้วยการคั่นด้วยจุลภาค:

```
FRONTEND_URL=https://phanacea.vercel.app,https://www.phanacea.com
```

**แล้วต้อง Redeploy** — Vercel ไม่โหลด env ใหม่ให้เอง:
Deployments → จุดสามจุดที่ deployment ล่าสุด → **Redeploy**

---

## 6. ตรวจสอบหลัง deploy

- [ ] `https://phanacea-api.vercel.app/api/health` ตอบ `success: true`
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
| หน้าเว็บโหลดได้แต่ไม่มีข้อมูล, console ขึ้น CORS | `FRONTEND_URL` ในฝั่ง API ไม่ตรงกับโดเมนจริง — แก้แล้ว **redeploy** |
| ทุก API เป็น 404 | Root Directory ของโปรเจกต์ API ไม่ได้ตั้งเป็น `backend` |
| รีเฟรชหน้าใน `/products` แล้ว 404 | `frontend/vercel.json` หาย — ไฟล์นี้ทำ SPA rewrite |
| API ขึ้น `JWT_SECRET must be set...` | ยังไม่ได้ตั้ง `JWT_SECRET` (ตัวแอปกันไว้ไม่ให้ใช้ค่า dev ใน production) |
| สั่งซื้อไม่ได้ ขึ้นว่าพบฟังก์ชันซ้ำซ้อน | ยังไม่ได้รัน `database/migrations/001_checkout_fix.sql` |
| ล็อกอิน admin ไม่ได้ | รัน `npm run create-admin` อีกครั้งเพื่อตั้งรหัสผ่านใหม่ |

---

## หมายเหตุเรื่อง serverless

Backend รันเป็น serverless function บน Vercel ซึ่งมีผลสองอย่าง:

1. **Rate limit นับแยกต่อ instance** — `express-rate-limit` เก็บสถานะในหน่วยความจำ
   ซึ่งไม่ได้แชร์ข้ามหลาย instance ยังกันการยิงรัว ๆ ได้ แต่ไม่ใช่โควตาที่แม่นยำ
   ระดับบัญชี ถ้าต้องการแบบนั้นให้ใช้ store ภายนอก (เช่น Upstash Redis)
2. **ไม่มี WebSocket** — แชทจึงใช้การ poll ทุก 4 วินาที ซึ่งเข้ากับ serverless
   ได้ดีและไม่ต้องมีเซิร์ฟเวอร์ที่รันค้างไว้
