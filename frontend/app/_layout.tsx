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

          {/* Tab layout - Home, Explore, Add, Community, Messages */}
          <Stack.Screen name="(tabs)/index" options={{ title: 'Home Tabs' }} />

        </Stack>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
