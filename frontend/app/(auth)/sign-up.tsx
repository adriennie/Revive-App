import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text, Button, Card, TextInput } from 'react-native-paper';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress: email, password });
      router.replace('/GetStarted');
    } catch (err) {
      console.error('Sign up error', err);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
      style={styles.bg}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.centered}>
        <Card style={styles.card} elevation={5}>
          <Card.Content>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Re:Vive</Text>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />
            <Button
              mode="contained"
              style={styles.signupBtn}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              onPress={handleSignUp}
              contentStyle={{ paddingVertical: 8 }}
            >
              Sign Up
            </Button>
            <Button
              mode="text"
              style={styles.linkBtn}
              labelStyle={{ color: '#fb923c', fontWeight: 'bold' }}
              onPress={() => router.push('./login')}
            >
              Already have an account? Log In
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
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  signupBtn: {
    backgroundColor: '#fb923c',
    borderRadius: 30,
    marginBottom: 12,
    elevation: 2,
  },
  linkBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
});