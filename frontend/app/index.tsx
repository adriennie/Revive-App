import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const features = [
  { icon: 'gift', title: 'Share & Care', desc: 'Donate and receive essentials' },
  { icon: 'account-group', title: 'Community', desc: 'Connect with neighbors' },
  { icon: 'recycle', title: 'Reduce Waste', desc: 'Give items a second life' },
  { icon: 'swap-horizontal', title: 'Barter', desc: 'Exchange with credits' },
];

export default function LandingPage() {
  const router = useRouter();

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
        <View style={styles.grid}>
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
        <Button
          mode="contained"
          style={styles.cta}
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          onPress={() => router.push('/(auth)/login')}
          contentStyle={{ paddingVertical: 8 }}
        >
          Get Started
        </Button>
        <Text style={styles.stats}>10K+ Items Donated • 5K+ Members • 500+ NGOs</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  grid: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 'auto',
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
  cta: {
    width: '90%',
    borderRadius: 30,
    backgroundColor: '#fb923c',
    marginTop: 16,
    marginBottom: 12,
    elevation: 4,
  },
  stats: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});