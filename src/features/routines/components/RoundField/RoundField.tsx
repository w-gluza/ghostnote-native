import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { colors } from "@/theme/colors";
import { layout, spacing } from "@/theme/layout";
import { textVariants } from "@/theme/typography";
export function RoundField({
  label,
  value,
  format,
  parse,
  keyboardType,
  onChange,
}: {
  label: string;
  value: number;
  format: (value: number) => string;
  parse: (text: string) => number | undefined;
  keyboardType: "number-pad" | "numbers-and-punctuation";
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(format(value));

  return (
    <View style={styles.field}>
      <TextInput
        accessibilityLabel={label}
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          const parsed = parse(text);
          if (parsed !== undefined) {
            onChange(parsed);
          }
        }}
        onEndEditing={() => setDraft(format(value))}
        keyboardType={keyboardType}
        keyboardAppearance="dark"
        selectionColor={colors.accent}
        selectTextOnFocus
        maxLength={5}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    padding: spacing.sm,
    borderRadius: layout.radius.panel,
    backgroundColor: colors.surface,
  },
  fieldInput: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...textVariants.body,
    color: colors.text.primary,
    fontVariant: ["tabular-nums"],
  },
});
