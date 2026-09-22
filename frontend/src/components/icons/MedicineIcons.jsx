import React from 'react';

// Hand-drawn line-art medicine icons in the same holographic style as the
// rest of the UI (gradient stroke + soft glow) — used in place of generic
// emoji/photos wherever a "picture" of a product or medical concept is
// needed (product tiles, empty states, hero visual).

const glow = {};

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F9D82" />
        <stop offset="100%" stopColor="#6FA8DC" />
      </linearGradient>
    </defs>
  );
}

export function PillIcon({ size = 48, className = '' }) {
  const id = 'pillGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <rect x="8" y="18" width="32" height="12" rx="6" transform="rotate(-35 24 24)" stroke={`url(#${id})`} strokeWidth="2" />
      <path d="M20 15 L28 33" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CapsuleIcon({ size = 48, className = '' }) {
  const id = 'capGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <rect x="10" y="20" width="28" height="8" rx="4" stroke={`url(#${id})`} strokeWidth="2" />
      <path d="M24 20 V28" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="16" cy="24" r="1.4" fill={`url(#${id})`} />
      <circle cx="32" cy="24" r="1.4" fill={`url(#${id})`} />
    </svg>
  );
}

export function BottleIcon({ size = 48, className = '' }) {
  const id = 'botGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <rect x="15" y="8" width="18" height="6" rx="1.5" stroke={`url(#${id})`} strokeWidth="2" />
      <path d="M17 14 L15 20 V38 A2 2 0 0 0 17 40 H31 A2 2 0 0 0 33 38 V20 L31 14" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 24 H32" stroke={`url(#${id})`} strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M24 28 V34 M21 31 H27" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CrossIcon({ size = 48, className = '' }) {
  const id = 'crossGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <circle cx="24" cy="24" r="19" stroke={`url(#${id})`} strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M24 14 V34 M14 24 H34" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function VialIcon({ size = 48, className = '' }) {
  const id = 'vialGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <path d="M19 6 H29 V16 L34 36 A4 4 0 0 1 30 41 H18 A4 4 0 0 1 14 36 L19 16 Z" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16.5 28 H31.5" stroke={`url(#${id})`} strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M17 6 H31" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TubeIcon({ size = 48, className = '' }) {
  const id = 'tubeGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <path d="M14 10 L20 6 H28 L34 10 V16 A4 4 0 0 1 32 19.5 L27 24 V38 A3 3 0 0 1 24 41 A3 3 0 0 1 21 38 V24 L16 19.5 A4 4 0 0 1 14 16 Z" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 12 H31" stroke={`url(#${id})`} strokeWidth="1.5" />
    </svg>
  );
}

// Brand mark: a leaf growing from within a hexagonal "cell" — the
// nature + hexagonal-cell motif requested for the site's icon/logo — with
// three smaller satellite hex cells suggesting a cluster of cells.
export function HexLeafIcon({ size = 48, className = '' }) {
  const id = 'hexLeafGrad';
  const hex = (cx, cy, r) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return pts.join(' ');
  };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={glow}>
      <Defs id={id} />
      <polygon points={hex(10, 12, 5)} stroke={`url(#${id})`} strokeWidth="1.2" strokeOpacity="0.55" />
      <polygon points={hex(39, 11, 4.5)} stroke={`url(#${id})`} strokeWidth="1.2" strokeOpacity="0.55" />
      <polygon points={hex(40, 37, 5)} stroke={`url(#${id})`} strokeWidth="1.2" strokeOpacity="0.55" />
      <polygon points={hex(24, 24, 18)} stroke={`url(#${id})`} strokeWidth="2.2" />
      <path
        d="M24 33 C24 33 15 27 15 18 C15 13.5 18.8 10 24 10 C24 10 24 20 24 33 Z"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 33 C24 27 20.5 21.5 16.5 18.5" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export const CATEGORY_ICON_MAP = {
  pill: PillIcon,
  capsule: CapsuleIcon,
  bottle: BottleIcon,
  cross: CrossIcon,
  vial: VialIcon,
  tube: TubeIcon,
  hexLeaf: HexLeafIcon,
};
