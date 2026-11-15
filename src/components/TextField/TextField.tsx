import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { colors } from "@/theme/colors";
import { textVariants } from "@/theme/typography";

type TextFieldProps = Omit<
  TextInputProps,
  "keyboardAppearance" | "selectionColor" | "placeholderTextColor"
> & {
  accessibilityLabel: string;
};

export function TextField({ style, ...props }: TextFieldProps) {
  return (
    <TextInput
      {...props}
      keyboardAppearance="dark"
      selectionColor={colors.accent}
      placeholderTextColor={colors.text.secondary}
      style={[styles.field, style]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    ...textVariants.body,
    color: colors.text.primary,
  },
});
