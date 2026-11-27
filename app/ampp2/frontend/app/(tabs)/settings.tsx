import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { settingsApi } from '../../src/api';
import { Settings } from '../../src/types';
import { Button, TextField, ErrorBanner, ScreenHeader, Select } from '../../src/components';
import { Text } from 'react-native';

export default function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState('true');
  const [defaultAutoMode, setDefaultAutoMode] = useState('false');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((res: any) => {
      const s = res?.settings ?? res;
      setSettings(s); setTheme(s.theme); setLanguage(s.language);
      setNotificationsEnabled(String(s.notificationsEnabled)); setDefaultAutoMode(String(s.defaultAutoMode));
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await settingsApi.update({ theme: theme as any, language, notificationsEnabled: notificationsEnabled === 'true', defaultAutoMode: defaultAutoMode === 'true' });
      setSuccess('Saved');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ScreenHeader title="Settings" />
        <ErrorBanner message={error} />
        {success ? <Text style={{ color: colors.success, marginBottom: spacing.md }}>{success}</Text> : null}
        <TextField label="Theme (system/light/dark)" value={theme} onChangeText={setTheme} />
        <TextField label="Language" value={language} onChangeText={setLanguage} />
        <Select label="Notifications enabled" value={notificationsEnabled} options={['true','false']} onChange={setNotificationsEnabled} />
        <Select label="Default auto mode" value={defaultAutoMode} options={['true','false']} onChange={setDefaultAutoMode} />
        <Button title="Save" onPress={save} loading={saving} />
        <Text style={{ color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.sm }}>Device simulator</Text>
        <TextField label="Device ID" value={''} onChangeText={() => {}} placeholder="esp32-basil-01" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
