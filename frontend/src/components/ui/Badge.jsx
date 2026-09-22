import React from 'react';

const TONE_STYLES = {
  ok: 'bg-cyan/10 text-cyan border-cyan/30',
  info: 'bg-blue/10 text-blueDeep border-blue/30',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-600 border-rose-200',
};

export default function Badge({ tone = 'ok', children }) {
  return (
    <span className={`chip ${TONE_STYLES[tone]}`}>
      {children}
    </span>
  );
}
