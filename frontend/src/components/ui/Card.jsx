import React from 'react';

export default function Card({ className = '', children, glowEdge = true, ...props }) {
  return (
    <div className={`card p-6 ${className}`} {...props}>
      {glowEdge && <span className="hud-edge" />}
      {children}
    </div>
  );
}
