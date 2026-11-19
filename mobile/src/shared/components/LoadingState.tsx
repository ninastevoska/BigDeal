import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export function LoadingState({
  message = 'Nalaganje ...',
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  fullScreen: { flex: 1, backgroundColor: colors.background },
  message: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
});
