import React from 'react';
import { Check, Clock, ChefHat, PackageCheck, PartyPopper, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'รอดำเนินการ', icon: Clock },
  { key: 'preparing', label: 'กำลังจัดเตรียม', icon: ChefHat },
  { key: 'ready', label: 'พร้อมส่ง/พร้อมรับ', icon: PackageCheck },
  { key: 'completed', label: 'สำเร็จ', icon: PartyPopper },
];

// Shared visual step-tracker used by both the customer order page and the
// admin order page, so "what stage is this order at" always looks
// identical no matter who's viewing it.
export default function OrderProgressTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-600">
        <XCircle size={22} />
        <div>
          <p className="font-display font-semibold">คำสั่งซื้อนี้ถูกยกเลิก</p>
          <p className="text-sm text-rose-500/80">หากมีข้อสงสัย กรุณาติดต่อพนักงานที่ดูแลคำสั่งซื้อนี้</p>
        </div>
      </div>
    );
  }

  const currentIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));

  return (
    <div className="flex items-start justify-between gap-1">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2 text-center" style={{ width: 84 }}>
              <span
                className={`grid h-11 w-11 place-items-center rounded-full border-2 transition-colors ${
                  done
                    ? 'border-cyan bg-cyan text-void'
                    : active
                    ? 'border-cyan bg-cyan/10 text-cyan'
                    : 'border-line bg-white text-faint'
                }`}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </span>
              <span className={`text-[11px] leading-tight ${active ? 'font-semibold text-ink' : 'text-faint'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mt-5 h-0.5 flex-1 rounded-full ${i < currentIndex ? 'bg-cyan' : 'bg-line'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
