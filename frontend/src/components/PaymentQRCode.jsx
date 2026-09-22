import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// A real, scannable QR code generated client-side (no backend round trip
// needed — payment_methods.QR is a placeholder for this demo project, not
// a live payment gateway integration).
export default function PaymentQRCode({ value, size = 200 }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      width: size,
      color: { dark: '#28352E', light: '#FFFFFF' },
    }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!svg) {
    return <div className="grid place-items-center rounded-2xl border border-line bg-white" style={{ width: size, height: size }} />;
  }

  // eslint-disable-next-line react/no-danger
  return <div className="rounded-2xl border border-line bg-white p-3" dangerouslySetInnerHTML={{ __html: svg }} />;
}
