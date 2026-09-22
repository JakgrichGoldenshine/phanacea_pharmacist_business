// Single source of truth for order-status display, shared by the customer
// order pages and the admin order pages so the labels/colors never drift
// apart between the two.
export const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

export const ORDER_STATUS_META = {
  pending: { label: 'รอดำเนินการ', tone: 'warning' },
  preparing: { label: 'กำลังจัดเตรียม', tone: 'info' },
  ready: { label: 'พร้อมส่ง/พร้อมรับ', tone: 'info' },
  completed: { label: 'สำเร็จ', tone: 'ok' },
  cancelled: { label: 'ยกเลิก', tone: 'danger' },
};

export function orderStatusMeta(status) {
  return ORDER_STATUS_META[status] || { label: status, tone: 'warning' };
}
