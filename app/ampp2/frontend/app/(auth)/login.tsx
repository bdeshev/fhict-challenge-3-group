import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import { Button, TextField, ErrorBanner, ScreenHeader } from '../../src/components';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!identifier || !password) { setError('All fields required'); return; }
    setLoading(true);
    try { await login(identifier, password); router.replace('/(tabs)/plants' as any); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 80 }}>
        <ScreenHeader title="Welcome back" />
        <ErrorBanner message={error} />
        <TextField label="Email or username" value={identifier} onChangeText={setIdentifier} />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={submit} loading={loading} />
        <View style={{ marginTop: spacing.md }}>
          <Button title="Create account" variant="secondary" onPress={() => router.push('/(auth)/register')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
