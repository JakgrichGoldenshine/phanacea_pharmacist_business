import staffClient from './staffClient';

export const adminApi = {
  // Dashboard
  stats: () => staffClient.get('/admin/dashboard/stats').then((r) => r.data),

  // Products
  listProducts: (params) => staffClient.get('/admin/products', { params }).then((r) => r.data),
  getProduct: (id) => staffClient.get(`/admin/products/${id}`).then((r) => r.data),
  getProductMeta: () => staffClient.get('/admin/products/meta/options').then((r) => r.data),
  createProduct: (payload) => staffClient.post('/admin/products', payload).then((r) => r.data),
  updateProduct: (id, payload) => staffClient.put(`/admin/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => staffClient.delete(`/admin/products/${id}`).then((r) => r.data),

  // Categories
  listCategories: () => staffClient.get('/admin/categories').then((r) => r.data),
  createCategory: (payload) => staffClient.post('/admin/categories', payload).then((r) => r.data),

  // Stock
  adjustStock: (payload) => staffClient.post('/admin/stock/adjust', payload).then((r) => r.data),
  listMovements: (params) => staffClient.get('/admin/stock/movements', { params }).then((r) => r.data),
  lowStock: () => staffClient.get('/admin/stock/low-stock').then((r) => r.data),

  // Sales / orders
  listSales: (params) => staffClient.get('/admin/sales', { params }).then((r) => r.data),
  getSale: (id) => staffClient.get(`/admin/sales/${id}`).then((r) => r.data),
  updateSaleStatus: (id, status) => staffClient.patch(`/admin/sales/${id}/status`, { status }).then((r) => r.data),

  // POS (point of sale)
  posSearchProducts: (params) => staffClient.get('/admin/pos/products', { params }).then((r) => r.data),
  posLookupCustomer: (email) => staffClient.get('/admin/pos/customers/lookup', { params: { email } }).then((r) => r.data),
  posCheckout: (payload) => staffClient.post('/admin/pos/checkout', payload).then((r) => r.data),

  // Support tickets
  listTickets: (params) => staffClient.get('/admin/support', { params }).then((r) => r.data),
  getTicket: (id) => staffClient.get(`/admin/support/${id}`).then((r) => r.data),
  sendTicketMessage: (id, message) => staffClient.post(`/admin/support/${id}/messages`, { message }).then((r) => r.data),
  updateTicketStatus: (id, status) => staffClient.patch(`/admin/support/${id}/status`, { status }).then((r) => r.data),

  // Live chat with customers
  listChats: (params) => staffClient.get('/admin/chat', { params }).then((r) => r.data),
  chatWaitingCount: () => staffClient.get('/admin/chat/waiting-count').then((r) => r.data),
  getChat: (id, after) =>
    staffClient.get(`/admin/chat/${id}`, { params: after ? { after } : {} }).then((r) => r.data),
  sendChatMessage: (id, message) => staffClient.post(`/admin/chat/${id}/messages`, { message }).then((r) => r.data),
  updateChatStatus: (id, status) => staffClient.patch(`/admin/chat/${id}/status`, { status }).then((r) => r.data),

  // Staff / admin accounts (owner only, except the self-service password change)
  listStaff: () => staffClient.get('/admin/staff').then((r) => r.data),
  createStaff: (payload) => staffClient.post('/admin/staff', payload).then((r) => r.data),
  updateStaff: (id, payload) => staffClient.patch(`/admin/staff/${id}`, payload).then((r) => r.data),
  resetStaffPassword: (id, password) => staffClient.post(`/admin/staff/${id}/password`, { password }).then((r) => r.data),
  changeOwnPassword: (payload) => staffClient.post('/admin/staff/me/password', payload).then((r) => r.data),

  // Suppliers
  listSuppliers: () => staffClient.get('/admin/suppliers').then((r) => r.data),
  createSupplier: (payload) => staffClient.post('/admin/suppliers', payload).then((r) => r.data),

  // Shipments (inbound stock receiving)
  listShipments: (params) => staffClient.get('/admin/shipments', { params }).then((r) => r.data),
  getShipment: (id) => staffClient.get(`/admin/shipments/${id}`).then((r) => r.data),
  createShipment: (payload) => staffClient.post('/admin/shipments', payload).then((r) => r.data),
};
