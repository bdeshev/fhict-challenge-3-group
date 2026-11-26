import { useColorScheme } from 'react-native';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24 };
export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
};

const light = {
  primary: '#2E7D32',
  primaryLight: '#A5D6A7',
  background: '#F5F7F4',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#D32F2F',
  success: '#388E3C',
  shadow: '#000000',
};

const dark = {
  primary: '#66BB6A',
  primaryLight: '#2E5A31',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  muted: '#9CA3AF',
  border: '#2D2D2D',
  danger: '#EF5350',
  success: '#66BB6A',
  shadow: '#000000',
};

export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;
  return { colors, spacing, radius, typography, isDark: scheme === 'dark' };
}
