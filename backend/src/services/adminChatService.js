const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// ── Live customer-support chat (staff side) ──────────────────────────
// Reads the same support_tickets rows as chatService, but scoped to
// channel = 'chat' and with no user_id filter. Kept in its own service so
// the customer-facing module can never accidentally gain cross-customer
// visibility through a shared helper.

const MAX_MESSAGE_LENGTH = 2000;
const MESSAGE_SELECT = 'id, sender_type, message, created_at, staff:sender_staff_id(full_name)';
const CONVERSATION_SELECT =
  'id, subject, status, created_at, last_message_at, last_sender_type, staff_last_read_at, ' +
  'user:user_id(id, full_name, email, phone_number)';

const OPEN_STATUSES = ['open', 'in_progress'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

// A conversation is "waiting" when the customer spoke last and no staff
// member has opened it since. Derived from the denormalised columns on the
// ticket row, so listing the inbox is a single query.
function withUnreadFlag(conversation) {
  const lastAt = conversation.last_message_at ? new Date(conversation.last_message_at) : null;
  const readAt = conversation.staff_last_read_at ? new Date(conversation.staff_last_read_at) : null;
  const unread = conversation.last_sender_type === 'user' && (!readAt || (lastAt && lastAt > readAt));
  return { ...conversation, unread: Boolean(unread) };
}

async function listConversations({ status, page = 1, limit = 30 }) {
  let query = supabase
    .from('support_tickets')
    .select(CONVERSATION_SELECT, { count: 'exact' })
    .eq('channel', 'chat')
    .order('last_message_at', { ascending: false });

  if (status === 'active') {
    query = query.in('status', OPEN_STATUSES);
  } else if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');

  return {
    items: data.map(withUnreadFlag),
    total: count,
    page: Number(page),
    limit: Number(limit),
  };
}

// Badge count for the admin sidebar — how many conversations are waiting
// on a reply right now.
async function countWaiting() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, last_message_at, last_sender_type, staff_last_read_at')
    .eq('channel', 'chat')
    .eq('last_sender_type', 'user')
    .in('status', OPEN_STATUSES);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data.filter((row) => withUnreadFlag(row).unread).length;
}

async function getConversationOrThrow(id) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .eq('channel', 'chat')
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  if (!data) throw new ApiError(404, 'ไม่พบห้องแชทนี้', 'CHAT_NOT_FOUND');
  return data;
}

async function getConversation(id, afterId) {
  const conversation = await getConversationOrThrow(id);

  let query = supabase
    .from('support_ticket_messages')
    .select(MESSAGE_SELECT)
    .eq('ticket_id', id)
    .order('id', { ascending: true });

  if (afterId) query = query.gt('id', afterId);

  const { data: messages, error } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');

  // Opening (or polling) the thread is what clears the unread badge.
  if (!afterId || messages.length > 0) {
    await supabase
      .from('support_tickets')
      .update({ staff_last_read_at: new Date().toISOString() })
      .eq('id', id);
  }

  return { conversation: withUnreadFlag(conversation), messages };
}

async function sendMessage(conversationId, staffId, rawMessage) {
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  if (!message) throw new ApiError(400, 'กรุณาพิมพ์ข้อความก่อนส่ง', 'MISSING_MESSAGE');
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, `ข้อความยาวเกิน ${MAX_MESSAGE_LENGTH} ตัวอักษร`, 'MESSAGE_TOO_LONG');
  }

  const conversation = await getConversationOrThrow(conversationId);

  const { data: inserted, error } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: conversation.id,
      sender_type: 'staff',
      sender_staff_id: staffId,
      message,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'SEND_MESSAGE_FAILED');

  const now = new Date().toISOString();
  const patch = {
    updated_at: now,
    last_message_at: now,
    last_sender_type: 'staff',
    staff_last_read_at: now,
  };
  // Replying picks the conversation up; it never closes it.
  if (conversation.status === 'open') patch.status = 'in_progress';

  await supabase.from('support_tickets').update(patch).eq('id', conversation.id);

  return inserted;
}

async function updateStatus(id, status) {
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, 'สถานะไม่ถูกต้อง', 'INVALID_STATUS');
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('channel', 'chat')
    .select('id, status')
    .maybeSingle();

  if (error) throw new ApiError(400, error.message, 'UPDATE_FAILED');
  if (!data) throw new ApiError(404, 'ไม่พบห้องแชทนี้', 'CHAT_NOT_FOUND');
  return data;
}

module.exports = { listConversations, countWaiting, getConversation, sendMessage, updateStatus, STATUSES };
