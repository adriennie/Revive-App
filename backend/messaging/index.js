import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabase = createClient(
  'https://bzqqeativrabfbcqlzzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXFlYXRpdnJhYmZiY3FsenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTQ3ODksImV4cCI6MjA2NjIzMDc4OX0.sY1Y_g0GG2WIM36P4mMEB4toxtGC_HqOU4olWMsNxiI'
);

// 📥 POST /send-message
app.post('/send-message', async (req, res) => {
  const { sender_id, receiver_id, chat_id, text } = req.body;

  if (!sender_id || !receiver_id || !chat_id || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log('🟠 Incoming message:', req.body);

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, chat_id, text }]);

    if (error) {
      // Table might not exist
      console.error('❌ Supabase insert failed:', error);

      return res.status(500).json({
        error: 'Insert failed. Possibly because `messages` table does not exist.',
        hint: 'Please run the following SQL in Supabase SQL Editor:',
        createTableSQL: `
          create table if not exists messages (
            id uuid primary key default gen_random_uuid(),
            sender_id text not null,
            receiver_id text not null,
            chat_id text not null,
            text text not null,
            created_at timestamp with time zone default now()
          );
        `,
        supabaseError: error,
      });
    }

    console.log('✅ Message inserted:', data);
    return res.status(200).json({ success: true, message: data });
  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).json({ error: 'Unexpected error occurred.' });
  }
});

// 📤 GET /chats/:userId
// ─────────────── GET /messages/:chatId ───────────────
app.get('/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ messages: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});




// 🟢 Start server
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`🚀 Messaging API running on http://localhost:${PORT}`)
);
