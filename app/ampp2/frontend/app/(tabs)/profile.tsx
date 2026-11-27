import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/theme';
import { profileApi } from '../../src/api';
import { Profile } from '../../src/types';
import { Button, TextField, ErrorBanner, ScreenHeader, LoadingView } from '../../src/components';
import { Text } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi.get().then((res: any) => { const p = res?.profile ?? res; setProfile(p); setUsername(p.username); setEmail(p.email); setPicture(p.profilePicture || ''); })
      .catch((e) => { console.log('PROFILE ERR', e?.message); setError(e.message); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await profileApi.update({ username, email, profilePicture: picture || null });
      setSuccess('Saved');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const doLogout = async () => { await logout(); router.replace('/(auth)/login'); };

  if (loading) return <LoadingView />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ScreenHeader title="Profile" />
        <ErrorBanner message={error} />
        {success ? <Text style={{ color: colors.success, marginBottom: spacing.md }}>{success}</Text> : null}
        <TextField label="Username" value={username} onChangeText={setUsername} />
        <TextField label="Email" value={email} onChangeText={setEmail} />
        <TextField label="Profile picture URL" value={picture} onChangeText={setPicture} />
        <Button title="Save" onPress={save} loading={saving} />
        <View style={{ marginTop: spacing.md }}>
          <Button title="Logout" variant="danger" onPress={doLogout} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
