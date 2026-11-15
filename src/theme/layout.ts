import { StyleSheet } from "react-native";

import { colors } from "@/theme/colors";

export const layout = {
  screenInset: 24,

  radius: {
    panel: 16,
    thumbnail: 12,
  },
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

export const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.7,
  },
});
