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
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ title: 'Welcome' }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
          <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="GetStarted" />
          <Stack.Screen name="FreeFood" />
          <Stack.Screen name="FreeNonFood" />
          <Stack.Screen name="ForSale" />
          <Stack.Screen name="Wanted" />
          <Stack.Screen name="Explore" />
          <Stack.Screen name="Message" />
          <Stack.Screen name="Community" />
          <Stack.Screen name="Chat" />
          <Stack.Screen name="ProductScreen" />
          
          {/* Main Tab Screens */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
