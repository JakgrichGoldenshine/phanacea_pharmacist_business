import React from 'react';

export default function QuantityInput({ value, onChange, max = 999, min = 1 }) {
  const step = (delta) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-black/[0.03]">
      <button
        type="button"
        onClick={() => step(-1)}
        className="h-9 w-9 rounded-full text-lg text-subtle transition hover:text-cyan"
        aria-label="ลดจำนวน"
      >
        −
      </button>
      <span className="w-8 text-center font-mono font-medium text-ink">{value}</span>
      <button
        type="button"
        onClick={() => step(1)}
        className="h-9 w-9 rounded-full text-lg text-subtle transition hover:text-cyan"
        aria-label="เพิ่มจำนวน"
      >
        +
      </button>
    </div>
  );
}
