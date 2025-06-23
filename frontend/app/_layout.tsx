// app/_layout.tsx

import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        
        <Stack
          screenOptions={{
            headerShown: false, // Hide header for all screens
            animation: 'slide_from_right', // Smooth transitions
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Welcome' }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
          <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="home/index" options={{ title: 'Home' }} />
          <Stack.Screen name="GetStarted" options={{ title: 'Get Started' }} />
          <Stack.Screen name="FreeFood" options={{ title: 'Free Food' }} />
          <Stack.Screen name="FreeNonFood" options={{ title: 'Free Non-Food' }} />
          <Stack.Screen name="ForSale" options={{ title: 'For Sale' }} />
          <Stack.Screen name="Wanted" options={{ title: 'Wanted' }} />
          <Stack.Screen name="Explore" options={{ title: 'Explore' }} />
          <Stack.Screen name="Add" options={{ title: 'Add Item' }} />
          <Stack.Screen name="Message" options={{ title: 'Messages' }} />
          <Stack.Screen name="Community" options={{ title: 'Community' }} />

          {/* Item Details Screen - Used by ForSaleScreen, FreeFoodScreen, etc. */}
          <Stack.Screen name="ProductScreen" options={{ title: 'Product Details' }} />
          

        </Stack>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}