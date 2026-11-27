import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { plantsApi } from '../../src/api';
import { Plant } from '../../src/types';
import { Button, TextField, ErrorBanner, ScreenHeader, Select } from '../../src/components';

export default function EditPlant() {
  const { id } = useLocalSearchParams();
  const pid = Number(id);
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [threshold, setThreshold] = useState('');
  const [autoMode, setAutoMode] = useState('false');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { plantsApi.get(pid).then((res: any) => { const p = res?.plant ?? res; setPlant(p); setName(p.name); setSpecies(p.species); setThreshold(String(p.threshold)); setAutoMode(String(p.autoMode)); }); }, [pid]);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await plantsApi.update(pid, { name, species, threshold: Number(threshold), autoMode: autoMode === 'true' });
      router.back();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ScreenHeader title="Edit plant" />
        <ErrorBanner message={error} />
        <TextField label="Name" value={name} onChangeText={setName} />
        <TextField label="Species" value={species} onChangeText={setSpecies} />
        <TextField label="Threshold" value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
        <Select label="Auto mode" value={autoMode} options={['true','false']} onChange={setAutoMode} />
        <Button title="Save" onPress={submit} loading={loading} />
        <View style={{ marginTop: spacing.md }}><Button title="Cancel" variant="secondary" onPress={() => router.back()} /></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
