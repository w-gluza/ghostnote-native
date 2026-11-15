import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
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
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [styles.target, pressed && styles.pressed]}
      >
        <AppText variant="body" tone="accent">
          Cancel
        </AppText>
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
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    ...textVariants.body,
    color: colors.text.primary,
  },
  target: {
    minHeight: 44,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
