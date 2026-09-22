import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <p className="font-display text-6xl font-extrabold text-cyan glow-text">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-2 text-subtle">ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว</p>
      <Link to="/">
        <Button className="mt-8 px-7 py-3">กลับหน้าแรก</Button>
      </Link>
    </div>
  );
}
