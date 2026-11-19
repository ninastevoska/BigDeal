import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
  size?: 'compact' | 'default';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SecondaryButton({
  title,
  onPress,
  size = 'default',
  fullWidth = false,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' ? styles.compact : styles.default,
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, size === 'compact' && styles.compactText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  default: { minHeight: 48, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { backgroundColor: colors.surfaceSecondary },
  disabled: { opacity: 0.5 },
  text: { ...typography.button, color: colors.primary, textAlign: 'center' },
  compactText: { ...typography.bodySmall, fontWeight: '600' },
});
