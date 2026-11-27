import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, TextInput, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/theme';
import { plantsApi } from '../../src/api';
import { Plant } from '../../src/types';
import { Card, EmptyState, LoadingView, ErrorBanner, Button } from '../../src/components';
import { Ionicons } from '@expo/vector-icons';

export default function PlantsList() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async (q?: string) => {
    setError('');
    try {
      const res = q ? await plantsApi.search(q) : await plantsApi.list();
      setPlants(res.plants);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput value={query} onChangeText={(t) => { setQuery(t); if (t.length > 1) load(t); if (t === '') load(); }} placeholder="Search plants" placeholderTextColor={colors.muted} style={{ flex: 1, padding: spacing.md, color: colors.text }} />
      </View>
      <ErrorBanner message={error} />
      <FlatList
        data={plants}
        keyExtractor={(p) => String(p.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(query || undefined); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/plants/${item.id}` as any)}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 18 }}>{item.name}</Text>
                  <Text style={{ color: colors.muted }}>{item.species} · {item.moisture ?? '-'}%</Text>
                </View>
                <Ionicons name="water" size={24} color={colors.primary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="🌱" message="No plants yet" action={<Button title="Add plant" onPress={() => router.push('/plants/new' as any)} />} />}
      />
      <TouchableOpacity onPress={() => router.push('/plants/new' as any)} style={{ position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 }}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
