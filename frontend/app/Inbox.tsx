// ✅ app/Inbox.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import moment from 'moment';

// Define a type for chat items
interface ChatType {
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  receiver_name?: string;
  item_name?: string;
  item_image_url?: string;
  created_at: string;
  [key: string]: any; // allow extra fields
}

export default function Inbox() {
  const { user } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://192.168.1.3:3001/inbox/${user.id}`);
      setChats(res.data || []);
    } catch (err) {
      console.error('Error fetching inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noChatsText}>No chats yet.</Text>
      </View>
    );
  }

  const uniqueChats = Object.values(
    chats.reduce((acc: Record<string, ChatType>, chat: ChatType) => {
      acc[chat.chat_id] = chat;
      return acc;
    }, {})
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8E1' }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Inbox</Text>
      </View>

      <FlatList
        data={uniqueChats}
        keyExtractor={(item) => (item as ChatType).chat_id}
        renderItem={({ item }) => {
          const chat = item as ChatType;
          const receiverId = chat.receiver_id === user?.id ? chat.sender_id : chat.receiver_id;
          const receiverName = chat.receiver_name === user?.fullName ? chat.sender_name : chat.receiver_name;
          const formattedDate = moment(chat.created_at).calendar(null, {
            sameDay: '[Today]',
            lastDay: '[Yesterday]',
            lastWeek: 'dddd',
            sameElse: 'DD/MM/YYYY',
          });

          return (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() =>
                router.push({
                  pathname: '/Message',
                  params: {
                    chat_id: chat.chat_id,
                    receiver_id: receiverId,
                    sellerName: receiverName,
                    itemName: chat.item_name,
                    itemImageUrl: chat.item_image_url,
                  },
                })
              }
            >
              <Image
                source={{ uri: chat.item_image_url }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{receiverName}</Text>
                <Text style={styles.item}>{chat.item_name}</Text>
              </View>
              <Text style={styles.date}>{formattedDate}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fb923c',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#FFF8E1',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  item: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
  noChatsText: {
    fontSize: 16,
    color: '#777',
  },
});
