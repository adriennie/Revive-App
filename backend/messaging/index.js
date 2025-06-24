import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient("https://bzqqeativrabfbcqlzzl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXFlYXRpdnJhYmZiY3FsenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTQ3ODksImV4cCI6MjA2NjIzMDc4OX0.sY1Y_g0GG2WIM36P4mMEB4toxtGC_HqOU4olWMsNxiI");

// POST: Send a message
app.post('/send-message', async (req, res) => {
  const { sender_id, receiver_id, text, chat_id } = req.body;

  if (!sender_id || !receiver_id || !text || !chat_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, text, chat_id }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true, data });
});

// GET: Fetch chat history
app.get('/messages/:chat_id', async (req, res) => {
  const { chat_id } = req.params;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chat_id)
    .order('timestamp', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ data });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`📡 Messaging API running on http://localhost:${PORT}`);
});
