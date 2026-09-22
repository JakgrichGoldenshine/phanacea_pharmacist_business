import React from 'react';

// A very quiet, mostly-static backdrop — two large, softly blurred colour
// washes low in opacity. No motion, no grid, no starfield: just enough
// depth to keep the page from feeling flat, without ever drawing the eye.
export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space">
      <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-cyan/[0.06] blur-[140px]" />
      <div className="absolute -right-32 top-1/3 h-[480px] w-[480px] rounded-full bg-blue/[0.06] blur-[130px]" />
    </div>
  );
}
