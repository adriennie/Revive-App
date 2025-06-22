// File: app/FreeFood.tsx
import React, { useState, FC } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  expiryDate: string;
  location: string;
  quantity: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  isPopular: boolean;
}

const dummyFreeItems: Item[] = [
  {
    id: '1',
    name: 'Homemade Veg Biryani',
    imageUrl: 'https://images.unsplash.com/photo-1613145993316-b0c3b5e81e6c?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly cooked veg biryani, enough for 4 servings.',
    category: 'Cooked Meals',
    expiryDate: '2025-06-23',
    location: 'Lucknow',
    quantity: '4 servings',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Packaged Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1616594037275-d9edc428e6dc?auto=format&fit=crop&w=400&q=80',
    description: '10 sealed packs of glucose biscuits.',
    category: 'Snacks',
    expiryDate: '2025-09-30',
    location: 'Delhi',
    quantity: '10 packs',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
  },
  {
    id: '3',
    name: 'Leftover Non-Veg Curry',
    imageUrl: 'https://images.unsplash.com/photo-1668598161389-706759a5eb23?auto=format&fit=crop&w=400&q=80',
    description: 'Homemade chicken curry, good for 2 servings.',
    category: 'Cooked Meals',
    expiryDate: '2025-06-22',
    location: 'Lucknow',
    quantity: '2 servings',
    isVegetarian: false,
    isAvailable: true,
    isPopular: false,
  },
];

const FreeFood: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopular, setShowPopular] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const categories = ['All', 'Cooked Meals', 'Snacks', 'Fruits', 'Grocery Pack', 'Beverages', 'Veg', 'Non-Veg'];

  const filteredItems = dummyFreeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPopular = !showPopular || item.isPopular;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesPopular && matchesCategory;
  });

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/ProductScreen', params: { id: item.id } })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemLocation}>{item.location}</Text>
        <Text style={styles.itemCondition}>Expiry: {item.expiryDate}</Text>
        <Text style={styles.itemCondition}>{item.quantity} • {item.isVegetarian ? 'Veg' : 'Non-Veg'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Free Food</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.toggleHeader}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.toggleText}>Filters</Text>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>

        {showFilters && (
          <>
            <View style={styles.categoryRow}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.filterLabel}>Popular Only</Text>
              <Switch
                onValueChange={setShowPopular}
                value={showPopular}
                trackColor={{ false: '#767577', true: '#FFB300' }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </>
        )}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FF9800',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 15,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 13,
    color: '#666',
  },
  itemLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
});

export default FreeFood;
