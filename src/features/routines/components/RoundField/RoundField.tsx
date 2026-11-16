import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { TextField } from "@/components/TextField/TextField";
import { colors } from "@/theme/colors";
import { layout, spacing } from "@/theme/layout";
export function RoundField({
  label,
  value,
  format,
  parse,
  keyboardType,
  onChange,
  onReject,
}: {
  label: string;
  value: number;
  format: (value: number) => string;
  parse: (text: string) => number | undefined;
  keyboardType: "number-pad" | "numbers-and-punctuation";
  onChange: (value: number) => void;
  onReject: () => void;
}) {
  const [draft, setDraft] = useState(format(value));

  return (
    <View style={styles.field}>
      <TextField
        accessibilityLabel={label}
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          const parsed = parse(text);
          if (parsed !== undefined) {
            onChange(parsed);
          }
        }}
        onEndEditing={() => {
          if (parse(draft) === undefined) {
            onReject();
          }
          setDraft(format(value));
        }}
        keyboardType={keyboardType}
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
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontVariant: ["tabular-nums"],
  },
});
