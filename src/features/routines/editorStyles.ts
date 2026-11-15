import { StyleSheet } from "react-native";

import { layout, spacing } from "@/theme/layout";

export const editorStyles = StyleSheet.create({
  bar: {
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenInset,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenInset,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.section,
  },
  add: {
    marginTop: spacing.md,
    alignSelf: "center",
  },
  remove: {
    marginTop: spacing.lg,
    alignSelf: "center",
  },
});
