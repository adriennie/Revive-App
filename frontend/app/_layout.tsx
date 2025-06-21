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
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Landing and Auth Screens */}
          <Stack.Screen name="LandingPage" options={{ title: 'Welcome' }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
          <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />

          {/* New Top-Level Feature Screens */}
          <Stack.Screen name="FreeFood" options={{ title: 'Free Food' }} />
          <Stack.Screen name="FreeNonFood" options={{ title: 'Free Non-Food' }} />
          <Stack.Screen name="ForSale" options={{ title: 'For Sale' }} />
          <Stack.Screen name="Wanted" options={{ title: 'Wanted' }} />
          <Stack.Screen name="Explore" options={{ title: 'Explore' }} />
          <Stack.Screen name="Add" options={{ title: 'Add Item' }} />
          <Stack.Screen name="Message" options={{ title: 'Messages' }} />
          <Stack.Screen name="Community" options={{ title: 'Community' }} />

          {/* Tab layout - Home, Explore, Add, Community, Messages */}
          <Stack.Screen name="(tabs)/index" options={{ title: 'Home Tabs' }} />
          {/* Item Details Screen - Used by ForSaleScreen, FreeFoodScreen, etc. */}
          <Stack.Screen name="screens/ForSaleItem" options={{ title: 'Item Details' }} />


        </Stack>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}