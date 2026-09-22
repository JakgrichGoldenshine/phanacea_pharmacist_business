const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const CATEGORIES = ['general', 'product', 'order', 'complaint', 'other'];
const MESSAGE_SELECT = 'id, sender_type, message, created_at, staff:sender_staff_id(full_name)';

async function createTicket({ userId, subject, category, message }) {
  if (!subject || !message) {
    throw new ApiError(400, 'กรุณากรอกหัวข้อและรายละเอียด', 'MISSING_FIELDS');
  }
  const finalCategory = CATEGORIES.includes(category) ? category : 'general';

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({ user_id: userId, subject, category: finalCategory, message })
    .select()
    .single();

  if (error) throw new ApiError(400, error.message, 'CREATE_TICKET_FAILED');
  return data;
}

async function listMyTickets(userId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, subject, category, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function getMyTicket(userId, id) {
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId) // a customer can never read someone else's ticket
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

// A customer replying to their own ticket. Re-opens a resolved/closed
// ticket automatically — a new message from the customer means the
// conversation isn't actually finished yet.
async function addMyMessage(userId, ticketId, message) {
  if (!message || !message.trim()) {
    throw new ApiError(400, 'กรุณากรอกข้อความ', 'MISSING_MESSAGE');
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .maybeSingle();

  if (ticketError) throw new ApiError(500, ticketError.message, 'DB_ERROR');
  if (!ticket) throw new ApiError(404, 'ไม่พบคำร้องนี้', 'TICKET_NOT_FOUND');

  const { data: newMessage, error } = await supabase
    .from('support_ticket_messages')
    .insert({ ticket_id: ticketId, sender_type: 'user', sender_user_id: userId, message: message.trim() })
    .select(MESSAGE_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'SEND_MESSAGE_FAILED');

  if (['resolved', 'closed'].includes(ticket.status)) {
    await supabase.from('support_tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', ticketId);
  } else {
    await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId);
  }

  return newMessage;
}

module.exports = { createTicket, listMyTickets, getMyTicket, addMyMessage, CATEGORIES };
