// File: app/ProductScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Combine dummy data from both FreeNonFood and FreeFood screens
const combinedDummyDatabase = [
  // FreeNonFood Items
  {
    id: '1',
    name: 'Old Curtains',
    imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80',
    description: 'Two large cotton curtains, still in good condition.',
    condition: 'Used - Good',
    location: 'Lucknow',
    category: 'Home Essentials',
  },
  {
    id: '2',
    name: 'Plastic Storage Box',
    imageUrl: 'https://images.unsplash.com/photo-1616627458105-1ea72a4ae9d5?auto=format&fit=crop&w=400&q=80',
    description: 'Large plastic box for storage, no lid.',
    condition: 'Used - Fair',
    location: 'Lucknow',
    category: 'Cleaning Supplies',
  },
  // FreeFood Items
  {
    id: '3',
    name: 'Homemade Veg Biryani',
    imageUrl: 'https://images.unsplash.com/photo-1613145993316-b0c3b5e81e6c?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly cooked veg biryani, enough for 4 servings.',
    condition: 'Fresh',
    location: 'Lucknow',
    category: 'Cooked Meals',
  },
  {
    id: '4',
    name: 'Packaged Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1616594037275-d9edc428e6dc?auto=format&fit=crop&w=400&q=80',
    description: '10 sealed packs of glucose biscuits.',
    condition: 'Sealed',
    location: 'Delhi',
    category: 'Snacks',
  },
];

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = combinedDummyDatabase.find((item) => item.id === id);

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color="#fb923c" />
      </TouchableOpacity>

      <Image source={{ uri: product.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.meta}>📍 {product.location}  |  🧼 {product.condition}</Text>
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
