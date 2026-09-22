import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-subtle hover:text-cyan disabled:opacity-30"
        aria-label="หน้าก่อนหน้า"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-faint">…</span>}
          <button
            onClick={() => onChange(p)}
            className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-medium transition ${
              p === page ? 'border-cyan/60 bg-cyan/10 text-cyan' : 'border-line text-subtle hover:text-ink'
            }`}
          >
            {p}
          </button>
        </React.Fragment>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-subtle hover:text-cyan disabled:opacity-30"
        aria-label="หน้าถัดไป"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
