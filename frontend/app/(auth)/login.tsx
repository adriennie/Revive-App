import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TextInput as NativeInput,
} from 'react-native';
import { Text, Button, Card, TextInput } from 'react-native-paper';
import { useOAuth, useSignIn, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
// import { useSignIn } from '@clerk/clerk-expo';

// const { signIn, isLoaded } = useSignIn();


export default function Login() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace('/GetStarted');
    }
  }, [userLoaded, isSignedIn]);

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId } = await startOAuthFlow();
      if (createdSessionId) {
        // Session should be active after OAuth, just redirect
        router.replace('/GetStarted');
      }
    } catch (err: unknown) {
      alert('Google login failed. Try again.');
    }
  };

  const handleManualLogin = async () => {
    if (!email || !password) return alert('Please enter both fields');
    try {
      setPending(true);
      if (!signIn) throw new Error('SignIn not loaded');
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        // Session should be active after manual login, just redirect
        router.replace('/GetStarted');
      } else {
        alert('Login not completed.');
      }
    } catch (err: any) {
      alert(err?.errors?.[0]?.message || err?.message || 'Login failed. Try again.');
    } finally {
      setPending(false);
    }
  };

  if (!signInLoaded || !userLoaded || isSignedIn) return null;

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
      }}
      style={styles.bg}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.centered}>
        <Card style={styles.card} elevation={5}>
          <Card.Content>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to Re:Vive</Text>

            {/* Manual Login */}
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleManualLogin}
              style={styles.manualBtn}
              loading={pending}
            >
              Login with Email
            </Button>

            <Text style={styles.or}>OR</Text>

            {/* Google Login */}
            <Button
              mode="contained"
              icon="google"
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            >
              Continue with Google
            </Button>

            {/* Sign Up Redirect */}
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
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  manualBtn: {
    backgroundColor: '#fb923c',
    borderRadius: 30,
    marginBottom: 12,
  },
  googleBtn: {
    backgroundColor: 'black',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fb923c',
    marginBottom: 12,
  },
  or: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#999',
    marginVertical: 10,
  },
  linkBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
