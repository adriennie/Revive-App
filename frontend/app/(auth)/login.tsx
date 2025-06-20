import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('../home');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80' }}
      style={styles.bg}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.centered}>
        <Card style={styles.card} elevation={5}>
          <Card.Content>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to Re:Vive</Text>
            <Button
              mode="contained"
              icon="google"
              style={styles.googleBtn}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              onPress={handleSignInWithGoogle}
              contentStyle={{ paddingVertical: 8 }}
            >
              Continue with Google
            </Button>
            <Button
              mode="text"
              style={styles.linkBtn}
              labelStyle={{ color: '#fb923c', fontWeight: 'bold' }}
              onPress={() => router.push('./sign-up')}
            >
              Create Account
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fb923c',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  googleBtn: {
    backgroundColor: 'black',
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fb923c',
    elevation: 2,
  },
  linkBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
});