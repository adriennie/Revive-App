// ✅ ProductScreen.tsx (Updated to call /create-chat)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('itemdata')
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setProduct(data);
        if (data.clerk_user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', data.clerk_user_id)
            .single();
          setUser(userData);
        }
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  const handleContactPress = async () => {
    if (!currentUser || !user || !product) return;

    const chatId = [currentUser.id, user.clerk_user_id].sort().join('-');

    try {
      await axios.post('http://localhost:3001/create-chat', {
        chat_id: chatId,
        sender_id: currentUser.id,
        receiver_id: user.clerk_user_id,
        item_name: product.name,
        receiver_name: user.name,
      });
    } catch (err) {
      console.error('Failed to create chat:', err);
    }

    router.push({
      pathname: '/Message',
      params: {
        chat_id: chatId,
        receiver_id: user.clerk_user_id,
        sellerName: user.name,
        itemName: product.name,
        itemImageUrl: product.image_url,
        location: user.location || 'Unknown',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.productTitle}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8E1' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: product?.image_url || 'https://via.placeholder.com/300x300.png?text=No+Image' }}
        style={styles.image}
      />

      <ScrollView style={styles.detailsContainer} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.productTitle}>{product.name}</Text>
        <Text style={styles.productDesc}>{product.description}</Text>
        <Text style={styles.sectionTitle}>Condition</Text>
        <Text style={styles.sectionValue}>{product.condition}</Text>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <Text style={styles.sectionValue}>{product.requirements || 'None specified.'}</Text>
        <Text style={styles.sectionTitle}>Offered by</Text>
        {user && (
          <View style={styles.userRow}>
            <Image source={{ uri: user.photo_url }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userMeta}>Joined {new Date(user.created_at).getFullYear()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.contactBtn} onPress={handleContactPress}>
          <Text style={styles.btnText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interestBtn}>
          <Text style={styles.btnTextAlt}>Express Interest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 40, backgroundColor: '#FFF8E1', zIndex: 10 },
  image: { width: '100%', height: 320, resizeMode: 'cover', backgroundColor: '#eee' },
  detailsContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 24, flex: 1 },
  productTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  productDesc: { fontSize: 16, color: '#444', marginBottom: 18 },
  sectionTitle: { fontWeight: 'bold', color: '#222', marginTop: 16, marginBottom: 2, fontSize: 16 },
  sectionValue: { color: '#444', fontSize: 15, marginBottom: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#eee' },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  userMeta: { color: '#4CAF50', fontSize: 14, marginTop: 2 },
  buttonRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', padding: 16, gap: 12, justifyContent: 'space-between' },
  contactBtn: { flex: 1, backgroundColor: '#4ADE80', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginRight: 8 },
  interestBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginLeft: 8 },
  btnText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  btnTextAlt: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' },
});