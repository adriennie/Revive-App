import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_CONVERSATIONS = [
  {
    id: '1',
    name: 'Sophia Carter',
    message: 'Is the item still available?',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    name: 'Ethan Bennett',
    message: 'Thanks for helping me out!',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    name: 'Ava Johnson',
    message: 'I’m interested in the books.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
];

export default function MessageScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof DUMMY_CONVERSATIONS[0] }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => router.push('/Chat')}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={DUMMY_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          alert('Start a new conversation (Coming soon)');
        }}
      >
        <Ionicons name="chatbubbles-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    backgroundColor: '#fb923c',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center', // Centered
    justifyContent: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#222',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fb923c',
    padding: 16,
    borderRadius: 30,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
