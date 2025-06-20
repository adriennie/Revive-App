import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, Alert, FlatList } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const features = [
  { icon: 'gift', title: 'Share & Care', desc: 'Donate and receive essentials' },
  { icon: 'account-group', title: 'Community', desc: 'Connect with neighbors' },
  { icon: 'recycle', title: 'Reduce Waste', desc: 'Give items a second life' },
  { icon: 'swap-horizontal', title: 'Barter', desc: 'Exchange with credits' },
];

export default function LandingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  // Debug output
  useEffect(() => {
    if (isLoaded) {
      console.log('[Clerk Debug] isLoaded:', isLoaded);
      console.log('[Clerk Debug] isSignedIn:', isSignedIn);
      console.log('[Clerk Debug] user:', user);
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Clear AsyncStorage (app cache)
  const clearAppStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Storage Cleared', 'App storage has been cleared. Please restart the app.');
    } catch (e) {
      Alert.alert('Error', 'Failed to clear storage.');
    }
  };

  // While loading, show nothing or a loader
  if (!isLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
      style={styles.bg}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.logo}>🧡</Text>
        <Text style={styles.title}>Re:Vive</Text>
        <Text style={styles.tagline}>Where shared goods find new life</Text>
        {/* Greeting if user is signed in and not redirected for any reason */}
        {isSignedIn && user && (
          <Text style={styles.greeting}>Hello, {user.firstName || user.fullName || 'User'}!</Text>
        )}
        {/* Manual grid for 4 features */}
        <View style={styles.manualGrid}>
          <View style={styles.gridRow}>
            {[features[0], features[1]].map(f => (
              <Card key={f.title} style={styles.featureCard} elevation={4}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text style={styles.featureIcon}>{f.icon === 'gift' ? '🎁' : f.icon === 'account-group' ? '👥' : f.icon === 'recycle' ? '♻️' : '🔄'}</Text>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
          <View style={styles.gridRow}>
            {[features[2], features[3]].map(f => (
              <Card key={f.title} style={styles.featureCard} elevation={4}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text style={styles.featureIcon}>{f.icon === 'gift' ? '🎁' : f.icon === 'account-group' ? '👥' : f.icon === 'recycle' ? '♻️' : '🔄'}</Text>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
        <View style={styles.bottomArea}>
          <Button
            mode="contained"
            style={styles.cta}
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            onPress={() => router.push('../(auth)/login')}
            contentStyle={{ paddingVertical: 8 }}
          >
            Get Started
          </Button>
      
          <Text style={styles.stats}>10K+ Items Donated • 5K+ Members • 500+ NGOs</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const CARD_MARGIN = 12;
const CARD_WIDTH = (width - 60 - CARD_MARGIN * 2) / 2; // 60 for container padding, 2*margin for both sides

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 0,
  },
  logo: { fontSize: 64, marginBottom: 8 },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#fb923c',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 20,
    color: '#fb923c',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureGrid: {
    // no longer used
  },
  featureRow: {
    // no longer used
  },
  manualGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    height: 150,
    minWidth: 0,
    maxWidth: '48%',
  },
  featureIcon: { fontSize: 32, marginBottom: 6 },
  featureTitle: { fontWeight: 'bold', fontSize: 16, color: '#fb923c', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#374151', textAlign: 'center' },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  cta: {
    width: '90%',
    borderRadius: 30,
    backgroundColor: '#fb923c',
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
  },
  clearBtn: {
    width: '90%',
    borderRadius: 30,
    marginTop: 4,
    marginBottom: 4,
    borderColor: '#fb923c',
  },
  stats: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});