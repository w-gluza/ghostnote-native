import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { TextField } from "@/components/TextField/TextField";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { layout, spacing } from "@/theme/layout";

type SearchFieldProps = {
  value: string;
  placeholder: string;
  label: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
};

export function SearchField({
  value,
  placeholder,
  label,
  onChangeText,
  onCancel,
}: SearchFieldProps) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <SymbolView
          name="magnifyingglass"
          size={18}
          tintColor={colors.text.secondary}
        />
        <TextField
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={styles.input}
        />
      </View>
      <Button variant="text" tone="accent" onPress={onCancel}>
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  field: {
    flex: 1,
    minHeight: layout.minTouchSize,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchSize,
  },
});
