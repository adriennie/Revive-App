import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender_id: string;
  receiver_id: string;
  chat_id: string;
  created_at: string;
}

interface ChatData {
  sellerName: string;
  itemName: string;
  itemImageUrl: string;
  location: string;
  chatId: string;
  receiverId: string;
}

const dummyChats: Record<string, ChatData> = {
  chat123: {
    sellerName: 'Ravi from Hazratganj',
    itemName: 'Leftover Biryani',
    itemImageUrl: 'https://images.unsplash.com/photo-1617196038437-83cc9c0dbd8e?auto=format&fit=crop&w=400&q=80',
    location: 'Lucknow - Hazratganj',
    chatId: 'chat123',
    receiverId: 'ravi123',
  },
  chat125: {
    sellerName: 'Priya from Noida',
    itemName: 'Dell Charger',
    itemImageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
    location: 'Noida',
    chatId: 'chat125',
    receiverId: 'priya456',
  },
};

// 🟡 Replace with your local IP for real device
const BACKEND_URL = 'http://192.168.29.47:3001';

export default function ChatsScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();

  const chatKeys = Object.keys(dummyChats);
  const filteredChatKeys = chatKeys.filter(chatId => {
    const chat = dummyChats[chatId];
    return (
      chat.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedChat = selectedChatId ? dummyChats[selectedChatId] : null;

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/messages/${chatId}`);
      setChatMessages(response.data.messages);
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
  };

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    fetchMessages(chatId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) {
      console.warn('🚫 Missing data', { newMessage, selectedChat, user });
      return;
    }

    const payload = {
      sender_id: user.username || user.id,
      receiver_id: selectedChat.receiverId,
      chat_id: selectedChat.chatId,
      text: newMessage.trim(),
    };

    try {
      console.log('➡️ Sending to backend:', payload);
      const response = await axios.post(`${BACKEND_URL}/send-message`, payload);
      console.log('✅ Sent. Server response:', response.data);

      setNewMessage('');

      // Wait a bit for Supabase to reflect the new message
      setTimeout(() => {
        fetchMessages(selectedChat.chatId);
      }, 500);
    } catch (err: any) {
      console.error('❌ Axios error:', err?.response?.data || err.message);
      alert('Message send failed.');
    }
  };

  // 🔁 Auto-fetch messages every 3 seconds
  useEffect(() => {
    if (!selectedChatId) return;

    fetchMessages(selectedChatId);

    const interval = setInterval(() => {
      fetchMessages(selectedChatId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChatId]);

  const renderChatPreview = (chatId: string) => {
    const chat = dummyChats[chatId];
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleOpenChat(chatId)} key={chatId}>
        <Image source={{ uri: chat.itemImageUrl }} style={styles.itemImage} />
        <View style={styles.chatContent}>
          <Text style={styles.itemName}>{chat.itemName}</Text>
          <Text style={styles.sellerName}>{chat.sellerName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>Tap to view</Text>
          <View style={styles.chatFooter}>
            <Text style={styles.chatLocation}>{chat.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderChatHistory = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedChatId(null)}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>{selectedChat?.sellerName}</Text>
          <Text style={styles.itemTitle}>{selectedChat?.itemName}</Text>
        </View>
      </View>

      <FlatList
        data={chatMessages}
        keyExtractor={(msg) => msg.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender_id === (user?.username || user?.id) ? styles.myMessage : styles.theirMessage,
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        style={styles.inputContainer}
      >
        <TextInput
          placeholder="Type a message..."
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {selectedChatId === null ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chats</Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search chats..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredChatKeys}
            renderItem={({ item }) => renderChatPreview(item)}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No chats found.</Text>
              </View>
            }
          />
        </>
      ) : (
        renderChatHistory()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FFF8E1' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 40,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  itemTitle: { color: '#fff', fontSize: 14 },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchBar: {
    height: 45,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  chatContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  sellerName: {
    fontSize: 13,
    color: '#666666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#555555',
    marginVertical: 4,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatLocation: {
    fontSize: 12,
    color: '#999999',
  },
  emptyListContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#777777',
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#FF9800',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 25,
  },
});
