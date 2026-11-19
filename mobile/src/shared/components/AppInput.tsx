import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export function AppInput({ label, error, hint, style, onFocus, onBlur, ...props }: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label ?? props.placeholder}
        placeholderTextColor={colors.textSecondary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          Boolean(error) && styles.invalid,
          props.editable === false && styles.disabled,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.error },
  disabled: { backgroundColor: colors.surfaceSecondary, opacity: 0.7 },
  hint: { ...typography.caption, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.error },
});
