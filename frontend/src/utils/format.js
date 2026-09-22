export function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function stockLabel(stock, minStock) {
  if (stock <= 0) return { text: 'สินค้าหมด', tone: 'danger' };
  if (stock <= minStock) return { text: `เหลือน้อย (${stock})`, tone: 'warning' };
  return { text: `พร้อมส่ง (${stock})`, tone: 'ok' };
}
