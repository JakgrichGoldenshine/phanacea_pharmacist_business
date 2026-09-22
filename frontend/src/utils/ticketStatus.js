// Single source of truth for support-ticket status/category display,
// shared by the customer support pages and the admin support pages.
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const TICKET_STATUS_META = {
  open: { label: 'รอตอบกลับ', tone: 'warning' },
  in_progress: { label: 'กำลังดำเนินการ', tone: 'info' },
  resolved: { label: 'แก้ไขแล้ว', tone: 'ok' },
  closed: { label: 'ปิดคำร้อง', tone: 'danger' },
};

export function ticketStatusMeta(status) {
  return TICKET_STATUS_META[status] || { label: status, tone: 'warning' };
}

export const TICKET_CATEGORY_LABELS = {
  general: 'ทั่วไป',
  product: 'เกี่ยวกับสินค้า',
  order: 'เกี่ยวกับคำสั่งซื้อ',
  complaint: 'ร้องเรียน',
  other: 'อื่นๆ',
};
