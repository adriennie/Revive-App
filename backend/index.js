import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { setupUserRoutes } from './user/index.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client for credit and messaging modules
const supabaseUrl = "https://bzqqeativrabfbcqlzzl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXFlYXRpdnJhYmZiY3FsenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTQ3ODksImV4cCI6MjA2NjIzMDc4OX0.sY1Y_g0GG2WIM36P4mMEB4toxtGC_HqOU4olWMsNxiI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Setup User Management Routes
setupUserRoutes(app);

// Credit module routes
app.post('/api/transfer', async (req, res) => {
  try {
    const { senderId, receiverId, amount, description } = req.body;

    if (!senderId || !receiverId || senderId === receiverId || !amount) {
      return res.status(400).json({ 
        error: 'Invalid sender/receiver or amount' 
      });
    }

    const { data, error } = await supabase
      .from('credit_stack')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
        description,
      }]);

    if (error) {
      return res.status(500).json({ 
        error: error.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
});

app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const { data, error } = await supabase
      .from('credit_stack')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching transactions for user ${userId}:`, error);
      return res.status(500).json({ 
        error: error.message 
      });
    }

    console.log(`Transactions fetched for user ${userId}`);
    console.log(data);
    return res.status(200).json({ 
      data 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
});

// Messaging module routes
app.post('/api/send-message', async (req, res) => {
  try {
    const { sender_id, receiver_id, chat_id, text } = req.body;

    if (!sender_id || !receiver_id || !chat_id || !text) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, chat_id, text }]);

    if (error) {
      return res.status(500).json({ 
        error: 'Insert failed', 
        supabaseError: error 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: data 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Unexpected error occurred.' 
    });
  }
});

app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ 
        error: 'Chat ID is required' 
      });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ 
        error: 'Fetch failed', 
        supabaseError: error 
      });
    }

    return res.status(200).json({ 
      messages: data 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Unexpected error occurred.' 
    });
  }
});

app.get('/api/create', async (req, res) => {
res.send("Welcome to the ReVive Backend API! Use the endpoints to manage users, credits, messages, and orders.");
})

app.post('/api/create-chat', async (req, res) => {
  try {
    const { chat_id, sender_id, receiver_id, item_name, receiver_name } = req.body;

    if (!chat_id || !sender_id || !receiver_id || !item_name || !receiver_name) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const { data, error } = await supabase
      .from('chats')
      .upsert([{
        chat_id,
        sender_id,
        receiver_id,
        item_name,
        receiver_name,
        updated_at: new Date().toISOString()
      }], { onConflict: ['chat_id'] });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Insert/upsert failed', 
        supabaseError: error 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Chat created or already exists' 
    });
  } catch (error) {
    console.error('Catch error:', error);
    return res.status(500).json({ 
      error: 'Unexpected server error' 
    });
  }
});

app.get('/api/inbox/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ 
        error: 'Inbox fetch failed', 
        supabaseError: error 
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Unexpected server error' 
    });
  }
});
app.post('/orders/new', async (req, res) => {
  try {
    const { current_user_id, item_id, owner_user_id, timestamp, status } = req.body;

    // Validate the incoming data
    if (!current_user_id || !item_id || !owner_user_id || typeof status !== 'boolean') {
      return res.status(400).json({ 
        error: 'Missing required fields for order creation' 
      });
    }

    const { data, error } = await supabase
      .from('orders') // Assumes you have a table named 'orders'
      .insert([{
        requester_id: current_user_id,
        item_id: item_id,
        owner_id: owner_user_id,
        created_at: timestamp, // Using the timestamp from the client
        status: status,
      }])
      .select(); // Return the newly created order

    if (error) {
      console.error('Supabase order insert error:', error);
      return res.status(500).json({ 
        error: 'Failed to create order', 
        supabaseError: error 
      });
    }

    // Return a 201 Created status for successful creation
    return res.status(201).json({ 
      success: true, 
      order: data[0] 
    });
    
  } catch (error) {
    console.error('Server error creating order:', error);
    return res.status(500).json({ 
      error: 'Unexpected server error' 
    });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ReVive Backend Server is running',
    modules: ['User Management', 'Credit System', 'Messaging', 'Orders'] // Added Orders module
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 ReVive Backend Server running on http://localhost:" + PORT);
  console.log("📋 Available modules:");
  console.log("   👤 User Management: /api/users");
  console.log("   💰 Credit System: /api/transfer, /api/transactions/:userId");
  console.log("   💬 Messaging: /api/send-message, /api/messages/:chatId, /api/create-chat, /api/inbox/:userId");
  console.log("   🛒 Orders: /api/orders/new"); // Added Orders endpoint to startup message
  console.log("   🏥 Health Check: /health");
});