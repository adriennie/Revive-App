// app/screens/ForSale.tsx
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
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router'; // Correct import for navigation
import { ParamListBase, NavigationProp } from '@react-navigation/native'; // Import for navigation typing

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // (Screen width - horizontal padding) / 2 cards per row

// Define the Item interface
interface Item {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  sellerInfo: string;
  averageRating: number;
  numberOfReviews: number;
  discountPercentage: number;
  isPopular: boolean;
}

// Dummy data for demonstration. This would come from your backend API.
const dummyForSaleItems: Item[] = [ // Apply Item type to dummy data
  {
    id: '1',
    name: 'Vintage Bookshelf',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1596906297314-e0b4b2c1f9c8?auto=format&fit=crop&w=400&q=80',
    description: 'Well-preserved vintage bookshelf, perfect for any living room. Solid wood construction.',
    category: 'Furniture',
    condition: 'Used - Good',
    location: 'Lucknow',
    sellerInfo: 'John Doe',
    averageRating: 4.5,
    numberOfReviews: 8,
    discountPercentage: 10,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Almost New Bicycle',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1574041733615-1a877543a759?auto=format&fit=crop&w=400&q=80',
    description: 'Barely used mountain bike, great for commuting or trails. Disc brakes, 21-speed.',
    category: 'Sports',
    condition: 'Used - Like New',
    location: 'Lucknow',
    sellerInfo: 'Jane Smith',
    averageRating: 4.8,
    numberOfReviews: 12,
    discountPercentage: 0,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Designer Handbag',
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1601004123547-4959f6356616?auto=format&fit=crop&w=400&q=80',
    description: 'Authentic designer handbag, rarely used. Comes with original dust bag.',
    category: 'Fashion',
    condition: 'Used - Excellent',
    location: 'Lucknow',
    sellerInfo: 'Alice Johnson',
    averageRating: 4.2,
    numberOfReviews: 5,
    discountPercentage: 20,
    isPopular: false,
  },
  {
    id: '4',
    name: 'Electric Guitar',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1510915364894-3e9a6ad0b5e2?auto=format&fit=crop&w=400&q=80',
    description: 'Fully functional electric guitar, ideal for beginners or intermediate players. Minor scratches.',
    category: 'Electronics',
    condition: 'Used - Good',
    location: 'Lucknow',
    sellerInfo: 'Bob Williams',
    averageRating: 3.9,
    numberOfReviews: 7,
    discountPercentage: 0,
    isPopular: false,
  },
  {
    id: '5',
    name: 'Ceramic Plant Pots (Set of 3)',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1510444321356-621815e96a4a?auto=format&fit=crop&w=400&q=80',
    description: 'Three beautiful ceramic pots, various sizes. Perfect for indoor plants.',
    category: 'Home Decor',
    condition: 'New',
    location: 'Lucknow',
    sellerInfo: 'Emily Brown',
    averageRating: 5.0,
    numberOfReviews: 15,
    discountPercentage: 5,
    isPopular: true,
  },
  {
    id: '6',
    name: 'Gaming Console',
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1612287232231-152e46e8c871?auto=format&fit=crop&w=400&q=80',
    description: 'Latest model gaming console, comes with two controllers and five games.',
    category: 'Electronics',
    condition: 'Used - Like New',
    location: 'Lucknow',
    sellerInfo: 'David Green',
    averageRating: 4.7,
    numberOfReviews: 10,
    discountPercentage: 15,
    isPopular: true,
  },
];

// Reusable Star Rating component
type StarRatingProps = {
  rating: number;
  size?: number;
  color?: string;
};

// Explicitly type rating and use React.Fragment for key on Ionicons
const StarRating: FC<StarRatingProps> = ({ rating, size = 14, color = '#FFD700' }: StarRatingProps) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      // Key should be on the wrapper element that is directly rendered in a list
      <React.Fragment key={i}>
        <Ionicons
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={color}
        />
      </React.Fragment>
    );
  }
  return <View style={styles.starRatingContainer}>{stars}</View>;
};

// Define the navigation stack type for ForSaleScreen
type RootStackParamList = {
  'screens/ItemDetailsScreen': { item: Item };
  // Add other routes here if ForSaleScreen navigates to them
  // For example: 'other/screen': undefined;
} & ParamListBase; // Include ParamListBase to extend default navigation types

type ForSaleScreenNavigationProp = NavigationProp<RootStackParamList>;

export default function ForSaleScreen() {
  const navigation = useNavigation<ForSaleScreenNavigationProp>(); // Type the useNavigation hook
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [showPopular, setShowPopular] = useState(false); // New state for popular toggle
  const [minPrice, setMinPrice] = useState(''); // New state for min price
  const [maxPrice, setMaxPrice] = useState(''); // New state for max price
  const [showMoreFilters, setShowMoreFilters] = useState(false); // New state for filter toggle

  const categories = ['All', 'Electronics', 'Furniture', 'Books', 'Clothing', 'Sports', 'Fashion', 'Home Decor', 'Other'];
  const conditions = ['All', 'New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

  const filteredItems = dummyForSaleItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'All' || item.condition === selectedCondition;
    const matchesPopular = !showPopular || item.isPopular; // Filter if popular toggle is on

    // Price range filtering
    const itemPriceAfterDiscount = item.price * (1 - (item.discountPercentage || 0) / 100);
    const matchesMinPrice = minPrice === '' || itemPriceAfterDiscount >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || itemPriceAfterDiscount <= parseFloat(maxPrice);

    return matchesSearch && matchesCategory && matchesCondition && matchesPopular && matchesMinPrice && matchesMaxPrice;
  });

  const renderItem = ({ item }: { item: Item }) => { // Type renderItem's item prop
    const discountedPrice = item.discountPercentage > 0
      ? item.price * (1 - item.discountPercentage / 100)
      : item.price;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('screens/ItemDetailsScreen', { item })} // Navigate to a dedicated details screen
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.priceRow}>
            {item.discountPercentage > 0 && (
              <Text style={styles.originalPriceText}>₹{item.price}</Text>
            )}
            <Text style={styles.itemPrice}>₹{discountedPrice}</Text>
            {item.discountPercentage > 0 && (
              <Text style={styles.discountBadgeCard}>-{item.discountPercentage}%</Text>
            )}
          </View>
          <StarRating rating={item.averageRating} />
          <Text style={styles.itemCondition}>{item.condition}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Items For Sale</Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Categories</Text>
          <FlatList
            horizontal
            data={categories}
            renderItem={({ item }: { item: string }) => ( // Explicitly type item as string
              <TouchableOpacity
                key={item} // Key should be on the TouchableOpacity
                style={[styles.filterButton, selectedCategory === item && styles.filterButtonActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.filterButtonText, selectedCategory === item && styles.filterButtonTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          />
        </View>

        {/* Collapsible Filters Section */}
        <TouchableOpacity style={styles.toggleFiltersHeader} onPress={() => setShowMoreFilters(!showMoreFilters)}>
          <Text style={styles.toggleFiltersText}>More Filters</Text>
          <Ionicons
            name={showMoreFilters ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#333333"
          />
        </TouchableOpacity>

        {showMoreFilters && (
          <View style={styles.collapsibleFiltersContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Condition</Text>
              <FlatList
                horizontal
                data={conditions}
                renderItem={({ item }: { item: string }) => ( // Explicitly type item as string
                  <TouchableOpacity
                    key={item} // Key should be on the TouchableOpacity
                    style={[styles.filterButton, selectedCondition === item && styles.filterButtonActive]}
                    onPress={() => setSelectedCondition(item)}
                  >
                    <Text style={[styles.filterButtonText, selectedCondition === item && styles.filterButtonTextActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
              />
            </View>

            {/* Popular Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.filterLabel}>Popular</Text>
              <Switch
                onValueChange={setShowPopular}
                value={showPopular}
                trackColor={{ false: '#767577', true: '#FFB300' }}
                thumbColor={showPopular ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            {/* Price Ranging */}
            <View style={styles.priceRangeContainer}>
              <Text style={styles.filterLabel}>Price Range (₹):</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No items found matching your filters.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Styles for ForSale
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF8E1', 
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 10, 
    backgroundColor: '#FF9800', 
    borderBottomWidth: 0, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, 
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF', 
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchBar: {
    height: 45,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 25, 
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 15,
  },
  filterScrollContainer: {
    paddingRight: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EAEAEA', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  filterButtonActive: {
    backgroundColor: '#FF9800', 
    borderColor: '#FF9800',
  },
  filterButtonText: {
    color: '#555555',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggleFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  toggleFiltersText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  collapsibleFiltersContent: {
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceInput: {
    flex: 1,
    height: 45,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 25, 
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
    fontSize: 16,
  },
  priceSeparator: {
    marginHorizontal: 10,
    fontSize: 20,
    color: '#555555',
    fontWeight: 'bold',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, 
    overflow: 'hidden',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 0, 
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
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800', 
    marginRight: 6,
  },
  originalPriceText: {
    fontSize: 14,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountBadgeCard: {
    backgroundColor: '#00C853', 
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemCondition: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 3,
  },
  itemLocation: {
    fontSize: 13,
    color: '#666666',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
});
