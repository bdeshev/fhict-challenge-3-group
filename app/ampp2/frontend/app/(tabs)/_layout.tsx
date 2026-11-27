import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarStyle: { backgroundColor: colors.card } }}>
      <Tabs.Screen name="plants" options={{ title: 'Plants', tabBarIcon: ({ color }: any) => <Ionicons name="leaf" size={22} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications', tabBarIcon: ({ color }: any) => <Ionicons name="notifications" size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }: any) => <Ionicons name="settings" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }: any) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs>
  );
}
