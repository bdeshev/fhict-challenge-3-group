import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { plantsApi } from '../../src/api';
import { Button, TextField, ErrorBanner, ScreenHeader, Select } from '../../src/components';

export default function NewPlant() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [threshold, setThreshold] = useState('30');
  const [moisture, setMoisture] = useState('');
  const [autoMode, setAutoMode] = useState('false');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!name || !species || !threshold) { setError('Name, species, threshold required'); return; }
    setLoading(true);
    try {
      await plantsApi.create({ name, species, threshold: Number(threshold), moisture: moisture ? Number(moisture) : undefined, autoMode: autoMode === 'true' });
      router.back();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ScreenHeader title="New plant" />
        <ErrorBanner message={error} />
        <TextField label="Name" value={name} onChangeText={setName} />
        <TextField label="Species" value={species} onChangeText={setSpecies} />
        <TextField label="Threshold" value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
        <TextField label="Moisture (optional)" value={moisture} onChangeText={setMoisture} keyboardType="numeric" />
        <Select label="Auto mode" value={autoMode} options={['true','false']} onChange={setAutoMode} />
        <Button title="Save" onPress={submit} loading={loading} />
        <View style={{ marginTop: spacing.md }}><Button title="Cancel" variant="secondary" onPress={() => router.back()} /></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
