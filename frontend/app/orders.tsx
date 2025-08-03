import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, Modal, Dimensions, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Order {
  id: string;
  requester_id: string;
  owner_id: string;
  item_id: string;
  item_name: string;
  requester_name: string;
  owner_name: string;
  status: 'pending' | 'accepted' | 'declined' | 'delivered';
  delivery_status: 'booked' | 'rejected' | 'delivered';
  delivery_otp?: string;
  delivered_at?: string;
  delivery_verified?: boolean;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

interface BillDetails {
  productPrice: number;
  platformFee: number;
  totalAmount: number;
  orderId: string;
  itemName: string;
}

interface OrdersProps {
  userId?: string;
}

const Orders: React.FC<OrdersProps> = (props) => {
  const params = useLocalSearchParams();
  const userId = props.userId || params.userId;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching orders for userId:', userId);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const response = await fetch(`${API_BASE_URL}/api/orders/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Orders fetched successfully:', data.orders);
        setOrders(data.orders || []);
      } else {
        console.error('❌ Failed to fetch orders:', data);
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Network error fetching orders:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderResponse = async (order: Order, response: 'accepted' | 'declined') => {
    try {
      console.log(`🔄 ${response} order:`, order.id);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const apiResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response,
          owner_id: order.owner_id,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ Order response updated:', data);
        
        // Update the order in local state
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { ...o, status: response, delivery_status: response === 'accepted' ? 'booked' : 'rejected', updated_at: new Date().toISOString() }
            : o
        ));
        
        Alert.alert(
          'Success', 
          `Order ${response} successfully!`,
          [{ text: 'OK' }]
        );
      } else {
        console.error('❌ Failed to update order:', data);
        Alert.alert('Error', data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('❌ Network error updating order:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleDeliver = async (order: Order) => {
    try {
      console.log('🔄 Delivering order:', order.id);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const apiResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_id: order.owner_id,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ Order delivered:', data);
        
        // Update the order in local state
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { 
                ...o, 
                status: 'delivered', 
                delivery_status: 'delivered',
                delivered_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : o
        ));
        
        Alert.alert(
          'Order Delivered!', 
          'OTP has been generated and sent to the receiver. Wait for them to pay the bill and provide the OTP for verification.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('❌ Failed to deliver order:', data);
        Alert.alert('Error', data.error || 'Failed to deliver order');
      }
    } catch (error) {
      console.error('❌ Network error delivering order:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleGenerateBill = async (order: Order) => {
    try {
      console.log('🔄 Generating bill for order:', order.id);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const apiResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/generate-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_id: order.requester_id,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ Bill generated:', data);
        
        // Show bill breakdown in modal
        const breakdown = data.breakdown;
        setBillDetails({
          productPrice: breakdown.productPrice,
          platformFee: breakdown.platformFee,
          totalAmount: breakdown.totalAmount,
          orderId: order.id,
          itemName: order.item_name
        });
        setShowBillModal(true);
      } else {
        console.error('❌ Failed to generate bill:', data);
        Alert.alert('Error', data.error || 'Failed to generate bill');
      }
    } catch (error) {
      console.error('❌ Network error generating bill:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handlePayBill = async (order: Order) => {
    try {
      console.log('🔄 Paying bill for order:', order.id);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const apiResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/pay-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_id: order.requester_id,
          owner_id: order.owner_id,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ Bill paid:', data);
        Alert.alert(
          'Payment Successful!',
          'Total bill amount (including platform fee) has been paid and credits transferred to the seller.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('❌ Failed to pay bill:', data);
        Alert.alert('Error', data.error || 'Failed to pay bill');
      }
    } catch (error) {
      console.error('❌ Network error paying bill:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleVerifyOTP = async (order: Order, otp: string) => {
    try {
      console.log('🔄 Verifying OTP for order:', order.id);
      
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
      const apiResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp,
          owner_id: order.owner_id,
        }),
      });

      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ OTP verified:', data);
        
        // Update the order in local state
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { 
                ...o, 
                delivery_verified: true,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : o
        ));
        
        Alert.alert(
          '🎉 Delivery Completed!', 
          'OTP verified successfully! The delivery has been completed and payment processed.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('❌ Failed to verify OTP:', data);
        Alert.alert('Error', data.error || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('❌ Network error verifying OTP:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isOwner = item.owner_id === userId;
    const isRequester = item.requester_id === userId;
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: 
              item.status === 'accepted' ? '#22c55e' : 
              item.status === 'declined' ? '#ef4444' : 
              item.status === 'delivered' ? '#3b82f6' : '#f59e0b'
          }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          {isOwner ? (
            <Text style={styles.detailText}>
              Requested by: <Text style={styles.boldText}>{item.requester_name}</Text>
            </Text>
          ) : (
            <Text style={styles.detailText}>
              Offered by: <Text style={styles.boldText}>{item.owner_name}</Text>
            </Text>
          )}
          
          <Text style={styles.detailText}>
            Delivery Status: <Text style={styles.boldText}>{item.delivery_status?.toUpperCase() || 'N/A'}</Text>
          </Text>
          
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Action buttons based on user role and order status */}
        {isOwner && item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleOrderResponse(item, 'accepted')}
            >
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleOrderResponse(item, 'declined')}
            >
              <Feather name="x" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery actions for owner */}
        {isOwner && item.status === 'accepted' && item.delivery_status === 'booked' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deliverButton]}
              onPress={() => handleDeliver(item)}
            >
              <Feather name="truck" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Deliver</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OTP verification for owner - show when order is delivered but not verified */}
        {isOwner && item.status === 'delivered' && item.delivery_otp && !item.delivery_verified && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.verifyButton]}
              onPress={() => {
                Alert.prompt(
                  'Verify OTP',
                  'Enter the OTP provided by the receiver to complete delivery:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Verify', 
                      onPress: (otp) => handleVerifyOTP(item, otp || '')
                    }
                  ],
                  'plain-text'
                );
              }}
            >
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bill and payment actions for requester */}
        {isRequester && item.status === 'accepted' && item.delivery_status === 'booked' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.billButton]}
              onPress={() => handleGenerateBill(item)}
            >
              <Feather name="file-text" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Bill</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment action for requester - show when order is delivered */}
        {isRequester && item.status === 'delivered' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.payButton]}
              onPress={() => handlePayBill(item)}
            >
              <Feather name="credit-card" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Pay Bill</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show OTP for requester (receiver) only */}
        {isRequester && item.delivery_otp && (
          <View style={styles.otpContainer}>
            <Text style={styles.otpText}>OTP: {item.delivery_otp}</Text>
            <Text style={styles.otpSubtext}>Share this OTP with the seller to complete delivery</Text>
          </View>
        )}

        {/* Completion status */}
        {item.delivery_verified && (
          <View style={styles.completedContainer}>
            <Feather name="check-circle" size={20} color="#22c55e" />
            <Text style={styles.completedText}>Delivery Completed</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.emptyState}>
          <Feather name="package" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>No orders found.</Text>
          <Text style={styles.emptySubtext}>Your orders will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bill Details Modal */}
      <Modal
        visible={showBillModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bill Details</Text>
              <TouchableOpacity 
                onPress={() => setShowBillModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {billDetails && (
              <View style={styles.billDetails}>
                <Text style={styles.billItemName}>{billDetails.itemName}</Text>
                
                <View style={styles.billBreakdown}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Product Price:</Text>
                    <Text style={styles.billValue}>{billDetails.productPrice} credits</Text>
                  </View>
                  
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Platform Fee (2%):</Text>
                    <Text style={styles.billValue}>{billDetails.platformFee} credits</Text>
                  </View>
                  
                  <View style={styles.billDivider} />
                  
                  <View style={styles.billRow}>
                    <Text style={styles.billTotalLabel}>Total Amount:</Text>
                    <Text style={styles.billTotalValue}>{billDetails.totalAmount} credits</Text>
                  </View>
                </View>
                
                <Text style={styles.billNote}>
                  You need to pay the total amount (product price + platform fee) to complete the order.
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowBillModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#2563eb',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e7ef',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#222',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  deliverButton: {
    backgroundColor: '#3b82f6',
  },
  verifyButton: {
    backgroundColor: '#8b5cf6',
  },
  billButton: {
    backgroundColor: '#f59e0b',
  },
  payButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 18,
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  otpContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  otpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  otpSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: Math.min(screenWidth - 40, 400),
    maxHeight: screenHeight * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  billDetails: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  billItemName: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  billBreakdown: {
    borderRadius: 12,
    backgroundColor: '#f0f9eb',
    padding: Math.min(screenWidth * 0.04, 15),
    marginBottom: 15,
    width: '100%',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  billLabel: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  billValue: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#22c55e',
    fontWeight: '600',
    textAlign: 'right',
    marginLeft: 10,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
    width: '100%',
  },
  billTotalLabel: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    color: '#222',
    fontWeight: '700',
    flex: 1,
  },
  billTotalValue: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    color: '#22c55e',
    fontWeight: '700',
    textAlign: 'right',
    marginLeft: 10,
  },
  billNote: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  modalButtons: {
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: '#2563eb',
    paddingVertical: Math.min(screenHeight * 0.015, 12),
    paddingHorizontal: Math.min(screenWidth * 0.05, 20),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '600',
  },
});

export default Orders;