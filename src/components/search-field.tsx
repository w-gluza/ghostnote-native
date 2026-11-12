import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type SearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
};

export function SearchField({
  value,
  placeholder,
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
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onCancel}>
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
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
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    height: 44,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  cancel: {
    color: colors.accent,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
});
