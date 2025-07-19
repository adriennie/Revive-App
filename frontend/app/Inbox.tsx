import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
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
  updated_at: string;
}

export default function Inbox() {
  const router = useRouter();
  // +++ Get currentUserId from navigation parameters +++
  const { currentUserId } = useLocalSearchParams<{ currentUserId: string }>();
  
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    // Don't fetch if we don't know who the current user is
    if (!currentUserId) {
        setLoading(false);
        return;
    }
    try {
      // +++ Use currentUserId to fetch the inbox +++
      const res = await axios.get(`http://192.168.1.3:3001/api/inbox/${currentUserId}`);
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
  }, [currentUserId]); // Depend on currentUserId

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Inbox</Text>
            </View>
            <View style={styles.centered}>
                <Text style={styles.noChatsText}>No chats yet.</Text>
            </View>
        </SafeAreaView>
    );
  }

  // Ensure we only show one entry per chat conversation
  const uniqueChats = Object.values(
    chats.reduce((acc: Record<string, ChatType>, chat: ChatType) => {
      acc[chat.chat_id] = chat;
      return acc;
    }, {})
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Inbox</Text>
      </View>

      <FlatList
        data={uniqueChats}
        keyExtractor={(item) => item.chat_id}
        renderItem={({ item }) => {
          // +++ Logic to correctly identify the "other person" in the chat +++
          const otherUserId = item.sender_id === currentUserId ? item.receiver_id : item.sender_id;
          const otherUserName = item.sender_id === currentUserId ? item.receiver_name : item.sender_name;
          const lastUpdate = moment(item.updated_at).fromNow();

          return (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() =>
                router.push({
                  pathname: '/Message',
                  params: {
                    chat_id: item.chat_id,
                    sender_id: currentUserId, // You are the sender
                    receiver_id: otherUserId, // The other person is the receiver
                    sellerName: otherUserName,
                    itemName: item.item_name,
                  },
                })
              }
            >
              <Image
                source={{ uri: item.item_image_url || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
              <View style={styles.chatInfo}>
                <Text style={styles.name}>{otherUserName}</Text>
                <Text style={styles.item} numberOfLines={1}>About: {item.item_name}</Text>
              </View>
              <Text style={styles.date}>{lastUpdate}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerContainer: { backgroundColor: '#fb923c', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  listContainer: { paddingVertical: 8 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#ccc' },
  chatInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  item: { fontSize: 14, color: '#666', marginTop: 2 },
  date: { fontSize: 12, color: '#999', marginLeft: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' },
  noChatsText: { fontSize: 16, color: '#777' },
});