import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useTheme } from '../theme';

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: any) {
  const { colors, radius, spacing } = useTheme();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.card;
  const fg = variant === 'secondary' ? colors.text : '#fff';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[{ backgroundColor: bg, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', opacity: disabled ? 0.5 : 1 }, style]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={{ color: fg, fontWeight: '600', fontSize: 16 }}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function TextField({ label, value, onChangeText, error, secureTextEntry, ...rest }: any) {
  const { colors, radius, spacing } = useTheme();
  const [show, setShow] = React.useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: error ? colors.danger : colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !show}
          placeholderTextColor={colors.muted}
          style={{ flex: 1, padding: spacing.md, color: colors.text, fontSize: 16 }}
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setShow(!show)} style={{ padding: spacing.md }}>
            <Text style={{ color: colors.muted }}>{show ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={{ color: colors.danger, fontSize: 13, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: any) {
  const { colors, radius, spacing } = useTheme();
  return <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }, style]}>{children}</View>;
}

export function Badge({ label, color }: any) {
  const { radius, spacing } = useTheme();
  return <View style={{ backgroundColor: color || '#2E7D32', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{label}</Text></View>;
}

export function EmptyState({ icon, message, action }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl }}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{icon}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginBottom: spacing.md }}>{message}</Text>
      {action}
    </View>
  );
}

export function LoadingView() {
  const { colors } = useTheme();
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} size="large" /></View>;
}

export function ErrorBanner({ message }: any) {
  const { colors, spacing, radius } = useTheme();
  if (!message) return null;
  return <View style={{ backgroundColor: colors.danger + '22', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}><Text style={{ color: colors.danger }}>{message}</Text></View>;
}

export function Select({ label, value, options, onChange }: any) {
  const { colors, radius, spacing } = useTheme();
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>{label}</Text> : null}
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card, padding: spacing.md }}>
        <Text style={{ color: colors.text }}>{String(value)}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card, marginTop: 4 }}>
          {options.map((o: any) => (
            <TouchableOpacity key={String(o)} onPress={() => { onChange(o); setOpen(false); }} style={{ padding: spacing.md }}>
              <Text style={{ color: colors.text }}>{String(o)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ScreenHeader({ title }: any) {
  const { colors, typography, spacing } = useTheme();
  return <Text style={[typography.title, { color: colors.text, marginBottom: spacing.md }]}>{title}</Text>;
}
