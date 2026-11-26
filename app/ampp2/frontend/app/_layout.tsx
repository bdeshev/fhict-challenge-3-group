import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/theme';
import { registerPush, setupNotificationHandlers } from '../src/push';

function Inner() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user) registerPush(); }, [user]);
  useEffect(() => { return setupNotificationHandlers(() => router.push('/(tabs)/notifications' as any)); }, [router]);
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
  </Stack>;
}

export default function RootLayout() {
  return <AuthProvider><Inner /></AuthProvider>;
}
