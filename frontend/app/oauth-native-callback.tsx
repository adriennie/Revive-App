import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OAuthNativeCallback() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/GetStarted');
    }, 100); // 100ms delay to ensure router is ready
    return () => clearTimeout(timeout);
  }, [router]);

  return null;
} 