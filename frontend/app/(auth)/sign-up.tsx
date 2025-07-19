import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Alert } from 'react-native';
import { Text, Button, Card, TextInput } from 'react-native-paper';
import { useSignUp, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { isNetworkError, getNetworkErrorMessage } from '@/utils/networkUtils';
import { AuthService } from '@/lib/authService';

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setPending(true);
      setSuccess(false);
      console.log('🚀 Starting simplified user registration...');
      console.log('📝 Registration details:', { email, name, hasPassword: !!password });
      
      // Generate a simple user ID for database storage
      const simpleUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated user ID:', simpleUserId);
      
      // Create user data for database
      const userData = {
        clerk_user_id: simpleUserId,
        name: name,
        email: email,
        photo_url: null,
        phone_number: null
      };

      console.log('📊 User data to be inserted:', userData);
      
      // Save directly to database
      console.log('🗄️ Saving user to database...');
      const dbResult = await api.createUser(userData);
      
      if (dbResult.success) {
        console.log('✅ User saved successfully in database');
        console.log('📋 Database user details:', dbResult.user);
        
        // Store user info locally for session management
        const userSession = {
          id: simpleUserId,
          name: name,
          email: email,
          isAuthenticated: true
        };
        
        // Store session using AuthService
        await AuthService.storeSession(userSession);
        console.log('💾 User session created and stored:', userSession);
        
        // Clear form fields
        setEmail('');
        setPassword('');
        setName('');
        setSuccess(true);
        
        // Show success message and redirect
        console.log('🎉 Registration successful! Redirecting to login...');
        
        // Use setTimeout to ensure the alert shows before navigation
        setTimeout(() => {
          Alert.alert(
            'Success!', 
            'Account created successfully! You can now sign in.',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('🔄 Redirecting to sign-in screen...');
                  try {
                    router.replace('/(auth)/login');
                  } catch (navError) {
                    console.error('Navigation error:', navError);
                    // Fallback navigation
                    window.location.href = '/(auth)/login';
                  }
                }
              }
            ]
          );
        }, 100);
        
      } else {
        console.error('❌ Failed to save user in database:', dbResult.error);
        
        // Show error message
        setTimeout(() => {
          Alert.alert(
            'Error', 
            'Failed to create account. Please try again.',
            [
              {
                text: 'Try Again',
                onPress: () => handleSignUp()
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        }, 100);
      }
      
    } catch (err) {
      const error = err as Error & { errors?: Array<{ message: string }> };
      console.error('💥 Registration error:', err);
      console.error('Error details:', {
        message: error?.message,
        errors: error?.errors,
        stack: error?.stack
      });
      
      if (isNetworkError(error)) {
        Alert.alert(
          'Network Error',
          getNetworkErrorMessage(error),
          [
            {
              text: 'Try Again',
              onPress: () => handleSignUp()
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', error?.errors?.[0]?.message || error?.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setPending(false);
      console.log('Registration process ended');
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
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>✅ Account Created!</Text>
                <Text style={styles.successMessage}>
                  Your account has been created successfully. Redirecting to login...
                </Text>
                <Button
                  mode="contained"
                  style={styles.successBtn}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  Go to Login
                </Button>
              </View>
            ) : (
              <>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Re:Vive</Text>
                
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                />
                
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
                  loading={pending}
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
              </>
            )}
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  successBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 30,
    paddingVertical: 8,
    elevation: 2,
  },
});