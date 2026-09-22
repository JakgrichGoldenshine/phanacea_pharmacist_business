const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// ── Live customer-support chat (customer side) ───────────────────────
// A chat is a support_tickets row with channel = 'chat'. Each customer has
// at most ONE open chat at a time: it behaves like a messaging thread with
// the pharmacy rather than a queue of separate cases, so there is never a
// "which conversation was I in?" question to answer.

const CHAT_SUBJECT = 'แชทสดกับทีมงาน';
const MAX_MESSAGE_LENGTH = 2000;
const MESSAGE_SELECT = 'id, sender_type, message, created_at, staff:sender_staff_id(full_name)';
const CONVERSATION_SELECT =
  'id, subject, status, channel, created_at, last_message_at, last_sender_type, user_last_read_at, staff_last_read_at';

function normalizeMessage(raw) {
  const message = typeof raw === 'string' ? raw.trim() : '';
  if (!message) {
    throw new ApiError(400, 'กรุณาพิมพ์ข้อความก่อนส่ง', 'MISSING_MESSAGE');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, `ข้อความยาวเกิน ${MAX_MESSAGE_LENGTH} ตัวอักษร`, 'MESSAGE_TOO_LONG');
  }
  return message;
}

async function findActiveConversation(userId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(CONVERSATION_SELECT)
    .eq('user_id', userId)
    .eq('channel', 'chat')
    .neq('status', 'closed')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function createConversation(userId, firstMessage) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      subject: CHAT_SUBJECT,
      category: 'general',
      channel: 'chat',
      // support_tickets.message is NOT NULL and doubles as the inbox
      // preview line; for a chat it holds the opening message, which is
      // ALSO stored in support_ticket_messages so the thread itself has a
      // single, uniformly-shaped source.
      message: firstMessage,
      status: 'open',
      last_message_at: now,
      last_sender_type: 'user',
      user_last_read_at: now,
    })
    .select(CONVERSATION_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'CREATE_CHAT_FAILED');
  return data;
}

async function listMessages(conversationId, afterId) {
  let query = supabase
    .from('support_ticket_messages')
    .select(MESSAGE_SELECT)
    .eq('ticket_id', conversationId)
    .order('id', { ascending: true });

  // Polling clients send the id of the newest message they already have,
  // so a quiet conversation costs one empty result instead of re-sending
  // the whole history every few seconds.
  if (afterId) query = query.gt('id', afterId);

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message, 'DB_ERROR');
  return data;
}

async function markReadByCustomer(conversationId) {
  await supabase
    .from('support_tickets')
    .update({ user_last_read_at: new Date().toISOString() })
    .eq('id', conversationId);
}

// Returns the customer's current chat (or null when they have never
// started one) together with its messages. `afterId` makes this cheap
// enough to call on a short poll interval.
async function getMyChat(userId, afterId) {
  const conversation = await findActiveConversation(userId);
  if (!conversation) {
    return { conversation: null, messages: [] };
  }

  const messages = await listMessages(conversation.id, afterId);

  // Opening the thread is what "reading" means on the customer side.
  if (!afterId || messages.length > 0) {
    await markReadByCustomer(conversation.id);
  }

  return { conversation, messages };
}

async function sendMessage(userId, rawMessage) {
  const message = normalizeMessage(rawMessage);

  let conversation = await findActiveConversation(userId);
  let created = false;

  if (!conversation) {
    conversation = await createConversation(userId, message);
    created = true;
  }

  const { data: inserted, error } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: conversation.id,
      sender_type: 'user',
      sender_user_id: userId,
      message,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) throw new ApiError(400, error.message, 'SEND_MESSAGE_FAILED');

  if (!created) {
    const now = new Date().toISOString();
    const patch = {
      updated_at: now,
      last_message_at: now,
      last_sender_type: 'user',
      user_last_read_at: now,
    };
    // A new customer message means the conversation is live again, even if
    // staff had marked it resolved.
    if (conversation.status === 'resolved') patch.status = 'open';

    await supabase.from('support_tickets').update(patch).eq('id', conversation.id);
  }

  return { conversation_id: conversation.id, message: inserted };
}

module.exports = { getMyChat, sendMessage, CHAT_SUBJECT, MAX_MESSAGE_LENGTH };
