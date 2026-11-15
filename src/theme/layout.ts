import { StyleSheet } from "react-native";

import { colors } from "@/theme/colors";

export const layout = {
  screenInset: 24,
  minTouchSize: 44,

  radius: {
    panel: 16,
    thumbnail: 12,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 32,
} as const;

export const divider = {
  top: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
} as const;

const content = {
  paddingHorizontal: layout.screenInset,
  paddingBottom: spacing.xl,
} as const;

export const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content,
  contentBelowHeader: {
    ...content,
    paddingTop: spacing.sm,
  },
  contentPadded: {
    ...content,
    paddingTop: spacing.xl,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
