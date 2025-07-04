import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import moment from 'moment'; // ✅ Added

export default function Message() {
  const { user } = useUser();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const { chat_id, receiver_id, sellerName } = useLocalSearchParams<{
    chat_id: string;
    receiver_id: string;
    sellerName: string;
    itemName: string;
    itemImageUrl: string;
  }>();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://192.168.29.47:3001/messages/${chat_id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await axios.post('http://192.168.29.47:3001/send-message', {
        chat_id,
        sender_id: user?.id,
        receiver_id,
        text,
      });
      setText('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped = messages.reduce((acc, msg) => {
      const date = moment(msg.created_at).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  };

  const renderDateLabel = (date: string) => {
    const label = moment(date).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'dddd',
      sameElse: 'DD MMM YYYY',
    });

    return (
      <View style={styles.dateLabelContainer}>
        <Text style={styles.dateLabelText}>{label}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/Inbox')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{sellerName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={groupMessagesByDate()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            {renderDateLabel(item.date)}
            {item.messages.map((msg) => {
              const isSender = msg.sender_id === user?.id;
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    isSender ? styles.sent : styles.received,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fb923c', // orange top bar
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#fff', // white text
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#fb923c',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  messageText: {
    color: '#000',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: '#444',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#fb923c',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabelContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateLabelText: {
    backgroundColor: '#f0c36d',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
});
