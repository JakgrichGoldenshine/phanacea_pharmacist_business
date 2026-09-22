const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const MESSAGE_SELECT = 'id, sender_type, message, created_at, staff:sender_staff_id(full_name)';

async function listTickets({ status, page = 1, limit = 30 }) {
  let query = supabase
    .from('support_tickets')
    .select('id, subject, category, status, created_at, updated_at, user:user_id(id,full_name,email)', {
      count: 'exact',
    })
    .order('updated_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

async function getTicket(id) {
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*, user:user_id(id,full_name,email)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!ticket) throw new ApiError(404, 'ไม่พบคำร้องนี้', 'TICKET_NOT_FOUND');

  const { data: messages, error: msgError } = await supabase
    .from('support_ticket_messages')
    .select(MESSAGE_SELECT)
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  if (msgError) throw new ApiError(500, msgError.message, 'DB_ERROR');
  return { ...ticket, messages };
}

// Staff replying in the thread. First reply on an 'open' ticket
// automatically moves it to 'in_progress' — a genuine chat, not a
// one-shot answer, so sending a message never silently closes anything.
async function addStaffMessage(ticketId, staffId, message) {
  if (!message || !message.trim()) {
    throw new ApiError(400, 'กรุณากรอกข้อความ', 'MISSING_MESSAGE');
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError) throw new ApiError(500, ticketError.message, 'DB_ERROR');
  if (!ticket) throw new ApiError(404, 'ไม่พบคำร้องนี้', 'TICKET_NOT_FOUND');

  const { data: newMessage, error } = await supabase
    .from('support_ticket_messages')
    .insert({ ticket_id: ticketId, sender_type: 'staff', sender_staff_id: staffId, message: message.trim() })
    .select(MESSAGE_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'SEND_MESSAGE_FAILED');

  const patch = { updated_at: new Date().toISOString() };
  if (ticket.status === 'open') patch.status = 'in_progress';
  await supabase.from('support_tickets').update(patch).eq('id', ticketId);

  return newMessage;
}

async function updateStatus(id, status) {
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, 'สถานะไม่ถูกต้อง', 'INVALID_STATUS');
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status')
    .maybeSingle();

  if (error) throw new ApiError(400, error.message, 'UPDATE_FAILED');
  if (!data) throw new ApiError(404, 'ไม่พบคำร้องนี้', 'TICKET_NOT_FOUND');
  return data;
}

module.exports = { listTickets, getTicket, addStaffMessage, updateStatus, STATUSES };
