// File: app/ProductScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('itemdata')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError('Product not found.');
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>{error || 'Product not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color="#fb923c" />
      </TouchableOpacity>

      <Image source={{ uri: product.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.meta}>📍 {product.location}  |  🧼 {product.condition}</Text>
        <Text style={styles.meta}>Category: {product.category}</Text>
        {product.type === 'food' && (
          <>
            {product.age_minutes && (
              <Text style={styles.meta}>Age: {product.age_minutes} min</Text>
            )}
            {product.expiryDate && (
              <Text style={styles.meta}>Expiry: {product.expiryDate}</Text>
            )}
          </>
        )}
        <Text style={styles.description}>{product.description}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Request This Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#fb923c',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fb923c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
