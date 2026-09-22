import React from 'react';

// Decorative hex-cell + nature motif for the hero panel — a grid of
// hexagons (the "cell-like" structure requested) with soft leaf-vein
// curves layered through it, in the site's calm sage/sky palette.
// Purely decorative, confined to the hero panel only.
export default function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan/10 blur-3xl" />
      <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-blue/10 blur-3xl" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.45]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexCell" width="42" height="36" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
            <path
              d="M21 0 L42 12 L42 30 L21 36 L0 30 L0 12 Z"
              fill="none"
              stroke="#4F9D82"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexCell)" />
      </svg>

      {/* Leaf-vein curves threading through the cell grid — the "nature" half of the motif */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.5]" viewBox="0 0 600 400" preserveAspectRatio="none">
        <path d="M20 340 C 160 300, 220 220, 260 80" fill="none" stroke="#4F9D82" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M100 300 C 140 280, 170 250, 190 200" fill="none" stroke="#4F9D82" strokeOpacity="0.2" strokeWidth="1.4" />
        <path d="M150 260 C 180 235, 205 210, 220 175" fill="none" stroke="#4F9D82" strokeOpacity="0.2" strokeWidth="1.4" />
        <path d="M560 60 C 480 90, 440 150, 430 260" fill="none" stroke="#6FA8DC" strokeOpacity="0.22" strokeWidth="2" />
      </svg>
    </div>
  );
}
