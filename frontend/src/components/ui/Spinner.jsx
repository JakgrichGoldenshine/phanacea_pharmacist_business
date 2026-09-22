import React from 'react';

export default function Spinner({ label = 'กำลังโหลด...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-subtle">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-line border-t-cyan" style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))' }} />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}
