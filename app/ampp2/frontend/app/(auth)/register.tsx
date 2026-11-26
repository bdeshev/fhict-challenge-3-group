import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import { Button, TextField, ErrorBanner, ScreenHeader } from '../../src/components';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (username.length < 3) { setError('Username min 3 chars'); return; }
    if (!email.includes('@')) { setError('Invalid email'); return; }
    if (password.length < 8) { setError('Password min 8 chars'); return; }
    setLoading(true);
    try { await register(username, email, password); router.replace('/(tabs)/plants' as any); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 80 }}>
        <ScreenHeader title="Create account" />
        <ErrorBanner message={error} />
        <TextField label="Username" value={username} onChangeText={setUsername} />
        <TextField label="Email" value={email} onChangeText={setEmail} />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Register" onPress={submit} loading={loading} />
        <View style={{ marginTop: spacing.md }}>
          <Button title="Back to login" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
