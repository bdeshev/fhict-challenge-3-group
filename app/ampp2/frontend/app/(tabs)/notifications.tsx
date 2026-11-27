import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { notificationsApi } from '../../src/api';
import { Notification } from '../../src/types';
import { Card, EmptyState, LoadingView, ErrorBanner } from '../../src/components';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Notifications() {
  const { colors, spacing } = useTheme();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { const res = await notificationsApi.list(); setItems(res.notifications); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    try { await notificationsApi.markRead(id); setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <LoadingView />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: spacing.md }}>Notifications</Text>
      <ErrorBanner message={error} />
      <FlatList
        data={items}
        keyExtractor={(n) => String(n.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markRead(item.id)}>
            <Card style={{ opacity: item.read ? 0.6 : 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{item.title}</Text>
                {!item.read ? <Ionicons name="ellipse" size={10} color={colors.primary} /> : null}
              </View>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{item.message}</Text>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="🔔" message="No notifications" />}
      />
    </View>
  );
}
