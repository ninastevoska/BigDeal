import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Poišči ponudbe ali trgovine',
  onSubmit,
  onFilterPress,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.searchSymbol} accessible={false}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Iskanje ponudb"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        style={styles.input}
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Odpri filtre"
          style={({ pressed }) => [styles.filterButton, pressed && styles.filterPressed]}
        >
          <Text style={styles.filterLabel}>Filtri</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  searchSymbol: { color: colors.textSecondary, fontSize: 26, lineHeight: 30 },
  input: { ...typography.body, color: colors.text, minWidth: 0, flex: 1, paddingVertical: spacing.sm },
  filterButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterPressed: { backgroundColor: colors.primaryPressed },
  filterLabel: { ...typography.bodySmall, color: colors.textInverse, fontWeight: '600' },
});
