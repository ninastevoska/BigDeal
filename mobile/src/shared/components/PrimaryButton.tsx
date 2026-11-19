import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  size?: 'compact' | 'default';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  size = 'default',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) {
  const unavailable = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' ? styles.compact : styles.default,
        fullWidth && styles.fullWidth,
        pressed && !unavailable && styles.pressed,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} size="small" />
      ) : (
        <Text style={[styles.text, size === 'compact' && styles.compactText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  default: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { backgroundColor: colors.disabled },
  text: { ...typography.button, color: colors.textInverse, textAlign: 'center' },
  compactText: { ...typography.bodySmall, fontWeight: '600' },
});
