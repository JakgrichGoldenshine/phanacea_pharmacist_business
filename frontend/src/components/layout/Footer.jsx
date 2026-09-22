import React from 'react';
import { ShieldCheck, RefreshCcw, Headset, BookOpenText } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'ชำระเงินปลอดภัย', desc: 'ธุรกรรมปลอดภัย 100%' },
  { icon: RefreshCcw, title: 'คืนสินค้าง่าย', desc: 'คืนได้ภายใน 7 วัน' },
  { icon: Headset, title: 'พร้อมช่วยเหลือ 24/7', desc: 'ทีมงานพร้อมดูแลทุกเวลา' },
  { icon: BookOpenText, title: 'คู่มือการใช้ยา', desc: 'ข้อมูลยาที่ครบถ้วน' },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-space/60 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="icon-chip shrink-0">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-subtle">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-center text-xs text-faint md:flex-row md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} Phanacea Pharmacist Business. สงวนลิขสิทธิ์.</p>
          <p>ข้อมูลบนเว็บไซต์นี้ไม่ใช่คำแนะนำทางการแพทย์ กรุณาปรึกษาเภสัชกรก่อนใช้ยา</p>
        </div>
      </div>
    </footer>
  );
}
