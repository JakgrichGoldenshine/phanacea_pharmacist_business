import React from 'react';

const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
