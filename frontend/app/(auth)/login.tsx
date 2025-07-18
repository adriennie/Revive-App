import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TextInput as NativeInput,
  Alert,
} from 'react-native';
import { Text, Button, Card, TextInput } from 'react-native-paper';
import { useOAuth, useSignIn, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { AuthService } from '@/lib/authService';
import { isNetworkError, getNetworkErrorMessage } from '@/utils/networkUtils';
import { useAuth } from '@clerk/clerk-expo';

export default function Login() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { getToken, signOut, isSignedIn: isClerkSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [googleOAuthCompleted, setGoogleOAuthCompleted] = useState(false);

  // Watch for user changes after Google OAuth
  useEffect(() => {
    if (googleOAuthCompleted && user && isSignedIn) {
      console.log('🎉 Google OAuth user detected:', user);
      
      // Create session for Google OAuth user
      const googleUserName = user.firstName || 
                           user.fullName || 
                           user.primaryEmailAddress?.emailAddress?.split('@')[0] || 
                           'User';
      const googleUserEmail = user.primaryEmailAddress?.emailAddress || '';
      const googleUserId = user.id || `google_${Date.now()}`;
      
      const googleSession = {
        id: googleUserId,
        name: googleUserName,
        email: googleUserEmail,
        isAuthenticated: true
      };
      
      console.log('💾 Creating session for Google OAuth user:', googleSession);
      
      AuthService.storeSession(googleSession).then(() => {
        console.log('🔄 Redirecting to GetStarted after Google OAuth session creation...');
        router.replace('/GetStarted');
        setGoogleOAuthCompleted(false); // Reset flag
      });
    }
  }, [googleOAuthCompleted, user, isSignedIn]);

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      console.log('🔄 User already signed in, redirecting to GetStarted...');
      router.replace('/GetStarted');
    }
  }, [userLoaded, isSignedIn]);

  const handleGoogleLogin = async () => {
    try {
      setPending(true);
      console.log('🚀 Starting Google OAuth login process...');
      
      const { createdSessionId, signIn, signUp } = await startOAuthFlow();
      
      console.log('✅ Google OAuth result:', { 
        createdSessionId: !!createdSessionId,
        signIn: !!signIn,
        signUp: !!signUp
      });

      if (createdSessionId) {
        // Wait a moment for Clerk to update the user state
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Log the Clerk user ID if available
        if (user && user.id) {
          console.log('Clerk user ID after Google OAuth:', user.id);
        } else {
          console.log('Clerk user ID not available after Google OAuth.');
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error('💥 Google login error:', err);
      Alert.alert('Error', 'Google login failed. Try again.');
    } finally {
      setPending(false);
      console.log('🏁 Google login process completed');
    }
  };

  const handleManualLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both fields');
      return;
    }
    
    try {
      setPending(true);
      console.log('🚀 Starting manual login process...');
      console.log('📝 Login details:', { email, hasPassword: !!password });
      
      // First, try to authenticate with our database
      console.log('🔍 Looking up user in database...');
      const authResult = await AuthService.authenticateUser(email);
      
      if (authResult.success && authResult.user) {
        console.log('✅ User found in database:', authResult.user);
        
        // Create session for database user
        const session = AuthService.createSession(authResult.user);
        await AuthService.storeSession(session);
        
        console.log('💾 Session created and stored:', session);
        console.log('🔄 Redirecting to GetStarted after database login...');
        
        Alert.alert(
          'Login Successful!',
          `Welcome back, ${authResult.user.name}!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                router.replace('/GetStarted');
              }
            }
          ]
        );
        return;
      }
      
      // If not found in database, try Clerk authentication
      console.log('🔍 User not found in database, trying Clerk authentication...');
      
      if (!signIn) {
        console.error('❌ SignIn not loaded');
        throw new Error('SignIn not loaded');
      }
      
      console.log('🔐 Attempting to sign in with Clerk...');
      const result = await signIn.create({ identifier: email, password });
      
      console.log('✅ Manual login result:', { 
        status: result.status,
        createdSessionId: !!result.createdSessionId
      });
      
      if (result.status === 'complete') {
        console.log('✅ Manual login successful');
        console.log('🔄 Redirecting to GetStarted after manual login...');
        // Session should be active after manual login, just redirect
        router.replace('/GetStarted');
      } else {
        console.error('❌ Manual login not completed:', result.status);
        Alert.alert('Error', 'Login not completed.');
      }
    } catch (err) {
      const error = err as Error & { errors?: Array<{ message: string }> };
      console.error('💥 Manual login error:', err);
      console.error('Error details:', {
        message: error?.message,
        errors: error?.errors,
        stack: error?.stack
      });
      
      // Check if it's a "Couldn't find your account" error
      if (error?.message?.includes("Couldn't find your account")) {
        Alert.alert(
          'Account Not Found',
          'No account found with these credentials. Please check your email and password, or create a new account.',
          [
            {
              text: 'Create Account',
              onPress: () => router.push('./sign-up')
            },
            {
              text: 'Try Again',
              onPress: () => {
                setEmail('');
                setPassword('');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else if (isNetworkError(error)) {
        Alert.alert(
          'Network Error',
          getNetworkErrorMessage(error),
          [
            {
              text: 'Try Again',
              onPress: () => handleManualLogin()
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', error?.errors?.[0]?.message || error?.message || 'Login failed. Try again.');
      }
    } finally {
      setPending(false);
      console.log('🏁 Manual login process completed');
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
              loading={pending}
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
