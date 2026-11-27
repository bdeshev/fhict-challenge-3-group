import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { plantsApi } from '../../src/api';
import { Plant, WateringHistory } from '../../src/types';
import { Card, Button, LoadingView, ErrorBanner, ScreenHeader, EmptyState } from '../../src/components';
import { Ionicons } from '@expo/vector-icons';

export default function PlantDetails() {
  const { id } = useLocalSearchParams();
  const pid = Number(id);
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [history, setHistory] = useState<WateringHistory[]>([]);
  const [decision, setDecision] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watering, setWatering] = useState(false);

  const load = async () => {
    setError('');
    try {
      const [p, h, d] = await Promise.all([plantsApi.get(pid), plantsApi.history(pid), plantsApi.autoDecision(pid)]);
      setPlant((p as any)?.plant ?? p);
      setHistory((h as any).history || []);
      setDecision((d as any).wateringNeeded);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [pid]);

  const water = async () => {
    setWatering(true);
    try { await plantsApi.water(pid); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setWatering(false); }
  };

  const del = () => {
    Alert.alert('Delete plant', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await plantsApi.delete(pid); router.back(); } },
    ]);
  };

  if (loading) return <LoadingView />;
  if (!plant) return <ErrorBanner message={error || 'Not found'} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginLeft: spacing.md }}>{plant.name}</Text>
      </View>
      <ErrorBanner message={error} />
      <Card>
        <Text style={{ color: colors.text }}>Species: {plant.species}</Text>
        <Text style={{ color: colors.text }}>Moisture: {plant.moisture ?? '-'}</Text>
        <Text style={{ color: colors.text }}>Threshold: {plant.threshold}</Text>
        <Text style={{ color: colors.text }}>Auto mode: {String(plant.autoMode)}</Text>
        <Text style={{ color: colors.text }}>Watering: {String(plant.isWatering)}</Text>
        {plant.lastWateredAt ? <Text style={{ color: colors.text }}>Last watered: {plant.lastWateredAt}</Text> : null}
      </Card>
      <Card>
        <Text style={{ color: colors.text, fontWeight: '600' }}>Auto decision</Text>
        <Text style={{ color: colors.muted }}>{decision ? 'Watering needed' : 'No watering needed'}</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Button title="Water now" onPress={water} loading={watering} />
        <Button title="Edit" variant="secondary" onPress={() => router.push(`/plants/edit?id=${pid}` as any)} />
        <Button title="Delete" variant="danger" onPress={del} />
      </View>
      <Text style={{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }}>History</Text>
      {history.length === 0 ? <EmptyState icon="💧" message="No history" /> : history.map((h) => (
        <Card key={h.id}><Text style={{ color: colors.text }}>{h.status} · {h.startedAt} · {h.duration}s</Text></Card>
      ))}
    </ScrollView>
  );
}
