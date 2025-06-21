// app/screens/ForSaleItem.tsx
import React, { FC } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the Item interface (copied from ForSaleScreen for self-containment)
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

// Define the route parameters for ItemDetailsScreen
type ItemDetailsScreenRouteProp = RouteProp<{ ItemDetails: { item: Item } }, 'ItemDetails'>;
type ItemDetailsScreenNavigationProp = StackNavigationProp<any, 'ItemDetails'>; // Using 'any' for the stack, consider defining a RootStackParamList for full type safety across your app.

interface ItemDetailsScreenProps {
  route: ItemDetailsScreenRouteProp;
  navigation: ItemDetailsScreenNavigationProp;
}

// Reusable Star Rating component (copied from ForSaleScreen)
type StarRatingProps = {
  rating: number;
  size?: number;
  color?: string;
};

const StarRating: FC<StarRatingProps> = ({ rating, size = 14, color = '#FFD700' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      // The key prop should be on the direct child of the iterated elements (Fragment in this case)
      <React.Fragment key={i}>
        <Ionicons
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={color}
        />
      </React.Fragment>
    );
  }
  return <View style={detailStyles.starRatingContainer}>{stars}</View>;
};


function ItemDetailsScreen({ route, navigation }: ItemDetailsScreenProps) {
  const { item } = route.params;

  // Calculate discounted price
  const discountedPrice = item.discountPercentage > 0
    ? item.price * (1 - item.discountPercentage / 100)
    : item.price;

  return (
    <SafeAreaView style={detailStyles.safeContainer}>
      <View style={detailStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={detailStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={detailStyles.headerTitle}>{item.name}</Text>
      </View>

      <View style={detailStyles.content}>
        <Image source={{ uri: item.imageUrl }} style={detailStyles.image} />
        <View style={detailStyles.priceContainer}>
          {item.discountPercentage > 0 && (
            <Text style={detailStyles.originalPrice}>₹{item.price}</Text>
          )}
          <Text style={detailStyles.currentPrice}>₹{discountedPrice}</Text>
          {item.discountPercentage > 0 && (
            <View style={detailStyles.discountBadge}>
              <Text style={detailStyles.discountText}>-{item.discountPercentage}%</Text>
            </View>
          )}
        </View>

        <View style={detailStyles.ratingContainer}>
          <StarRating rating={item.averageRating} size={20} color="#FFD700" />
          <Text style={detailStyles.reviewsText}>({item.numberOfReviews} Reviews)</Text>
        </View>

        <Text style={detailStyles.description}>{item.description}</Text>
        <View style={detailStyles.infoRow}>
          <Text style={detailStyles.infoLabel}>Category:</Text>
          <Text style={detailStyles.infoValue}>{item.category}</Text>
        </View>
        <View style={detailStyles.infoRow}>
          <Text style={detailStyles.infoLabel}>Condition:</Text>
          <Text style={detailStyles.infoValue}>{item.condition}</Text>
        </View>
        <View style={detailStyles.infoRow}>
          <Text style={detailStyles.infoLabel}>Location:</Text>
          <Text style={detailStyles.infoValue}>{item.location}</Text>
        </View>
        <View style={detailStyles.infoRow}>
          <Text style={detailStyles.infoLabel}>Seller:</Text>
          <Text style={detailStyles.infoValue}>{item.sellerInfo}</Text>
        </View>
        {/* Add more details or action buttons like "Contact Seller" */}
      </View>
    </SafeAreaView>
  );
}

export default ItemDetailsScreen;

// Styles for the ItemScreen
const detailStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF8E1', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    backgroundColor: '#FF9800', 
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    marginRight: 15,
    padding: 5, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1, 
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  originalPrice: {
    fontSize: 22,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    justifyContent: 'center',
  },
  reviewsText: {
    marginLeft: 10,
    fontSize: 17,
    color: '#666666',
  },
  description: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'justify',
    marginBottom: 25,
    lineHeight: 25,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
  },
  starRatingContainer: {
    flexDirection: 'row',
  },
});
