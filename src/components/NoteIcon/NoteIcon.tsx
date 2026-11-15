import { StyleSheet, Text } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export function NoteIcon() {
  return <Text style={styles.icon}>♫</Text>;
}

const styles = StyleSheet.create({
  icon: {
    color: colors.accent,
    fontSize: typography.fontSize.body,
  },
});
