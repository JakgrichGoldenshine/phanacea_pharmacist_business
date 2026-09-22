# 🌿 PHANACEA PHARMACIST BUSINESS

ระบบร้านขายยาออนไลน์ & หน้าร้าน — React + Tailwind (frontend), Node.js + Express
(backend), Supabase/PostgreSQL (database, on-cloud)

## เริ่มต้นใช้งานอย่างเร็ว

```bash
npm run setup     # ติดตั้ง dependency ทั้งหมด (ครั้งแรกครั้งเดียว)
node server.js    # รันทั้งระบบ (backend + frontend) ด้วยคำสั่งเดียว
```

จากนั้นเปิดเบราว์เซอร์ที่ `http://localhost:5173`

## ตั้งค่าฐานข้อมูล (ครั้งแรก)

รันในหน้า **SQL Editor** ของ Supabase ตามลำดับนี้:

1. `database/schema.sql`
2. `database/migrations/001_checkout_fix.sql`
3. `database/migrations/002_live_chat.sql`
4. `database/migrations/003_staff_email.sql`
5. `database/seed.sql` *(ข้อมูลตัวอย่าง — ข้ามได้)*

ทุกไฟล์รันซ้ำได้อย่างปลอดภัย

## สร้างบัญชีผู้ดูแลระบบ

```bash
cd backend
npm run create-admin -- --username admin --email admin@phanacea.local --password 'YourStrongPass123'
```

คำสั่งนี้เข้ารหัสผ่าน bcrypt ตอนรัน จึงมั่นใจได้ว่ารหัสที่พิมพ์คือรหัสที่ใช้ล็อกอินได้จริง
ถ้ารันซ้ำกับชื่อผู้ใช้เดิม = ตั้งรหัสผ่านใหม่ (ใช้กู้คืนตอนลืมรหัสผ่านได้)

ล็อกอินที่ `http://localhost:5173/login` ด้วยอีเมลข้างต้น — หน้าเดียวกับลูกค้า
ระบบพาไปหลังร้าน (`/admin`) ให้เองเมื่อจำอีเมลนี้ได้ว่าเป็นพนักงาน

## โครงสร้างหน้าจอ

**ฝั่งลูกค้า**

| เส้นทาง | หน้าที่ |
| --- | --- |
| `/` `/products` `/products/:id` | หน้าร้าน + แคตตาล็อกสินค้า |
| `/cart` `/checkout` | ตะกร้าและชำระเงิน (ต้องล็อกอิน) |
| `/orders` `/orders/:id` | ประวัติและติดตามคำสั่งซื้อ |
| `/chat` | **แชทสดกับทีมงาน** |
| `/support` `/support/:id` | ศูนย์ช่วยเหลือแบบคำร้อง (มีเลขติดตาม) |

**ฝั่งหลังร้าน** (`/admin`)

| เส้นทาง | สิทธิ์ |
| --- | --- |
| `/admin` `/admin/pos` `/admin/orders` | ทุกตำแหน่ง |
| `/admin/chat` | ทุกตำแหน่ง (งานหน้าร้าน) |
| `/admin/products` `/admin/stock` `/admin/shipments` `/admin/support` | owner, pharmacist, assistant |
| `/admin/staff` | owner เท่านั้น — สร้าง/ปิดใช้งาน/ตั้งรหัสผ่านใหม่ |
| `/admin/account` | ทุกตำแหน่ง — เปลี่ยนรหัสผ่านตัวเอง |

## เอกสารเพิ่มเติม

- 📖 [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md) — ตั้งค่า Supabase, environment
  variables, API reference, มาตรการความปลอดภัย, แก้ปัญหา
- 🚀 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — push ขึ้น GitHub และ deploy บน Vercel

http://localhost:(5173)/login
admin@phanacea.local
NewPass123

or

npm run create-admin -- --username admin --email admin@phanacea.local --password 'Admin123!' 0


