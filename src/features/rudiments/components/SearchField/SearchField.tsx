import { SymbolView } from "expo-symbols";
import { StyleSheet, TextInput, View } from "react-native";

import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { textVariants } from "@/theme/typography";

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
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          selectionColor={colors.accent}
          keyboardAppearance="dark"
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
    gap: 16,
  },
  field: {
    flex: 1,
    minHeight: layout.minTouchSize,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchSize,
    ...textVariants.body,
    color: colors.text.primary,
  },
});
