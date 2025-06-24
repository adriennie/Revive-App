import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity,
  FlatList, TextInput, Modal, StyleSheet, Platform
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';

const BACKEND_URL = 'https://34.131.96.88:3000';

export default function CreditEconomy() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // ────────── Fetch Transactions ──────────
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const res = await fetch(`${BACKEND_URL}/transactions/${userId}`);
      const json = await res.json();
      setTransactions(json.data || []);

      const total = (json.data || []).reduce((sum, tx) => {
        if (tx.receiver_id === userId) return sum + tx.amount;
        if (tx.sender_id === userId) return sum - tx.amount;
        return sum;
      }, 0);
      setBalance(total);
    };

    fetchData();
  }, [refresh, userId]);

  // ────────── Send Credits ──────────
  const sendCredits = async () => {
    if (!receiverId || !amount || isNaN(amount)) {
      alert('Please enter valid receiver ID and amount');
      return;
    }

    const res = await fetch(`${BACKEND_URL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        receiverId,
        amount: parseInt(amount),
        description,
      }),
    });

    const result = await res.json();
    if (result.error) {
      alert('Transfer failed: ' + result.error);
    } else {
      setReceiverId('');
      setAmount('');
      setDescription('');
      setShowModal(false);
      setRefresh(!refresh);
    }
  };

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName ?? 'Guest'}</Text>
        <View style={styles.creditBox}>
          <Text style={styles.creditLabel}>Current Credit</Text>
          <Text style={styles.creditValue}>{balance} pts</Text>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send Credits</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Credit Exchange History</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <View>
                <Text style={styles.historyDesc}>{item.description}</Text>
                <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text
                style={[
                  styles.historyAmount,
                  {
                    color:
                      item.receiver_id === userId ? '#4CAF50' : '#F44336',
                  },
                ]}
              >
                {item.receiver_id === userId ? '+' : '-'}
                {item.amount}
              </Text>
            </View>
          )}
        />
      </View>

      {/* ────── Modal ────── */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Send Credits</Text>

            <TextInput
              placeholder="Receiver ID"
              value={receiverId}
              onChangeText={setReceiverId}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: '#F44336', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendCredits}>
                <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const HEADER_BG = '#FFF4E5';
const ORANGE_LIGHT = '#FFE0B2';
const PRIMARY_ACC = '#FF9800';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  creditBox: {
    backgroundColor: ORANGE_LIGHT,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 14,
    color: '#555',
  },
  creditValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  historyDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  sendButton: {
    backgroundColor: PRIMARY_ACC,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
