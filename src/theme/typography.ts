import type { TextStyle } from "react-native";

export const typography = {
  fontFamily: {
    display: "BodoniModa-Medium",
    displayBold: "BodoniModa-SemiBold",
    body: "Inter-Regular",
    medium: "Inter-Medium",
    semibold: "Inter-SemiBold",
  },

  fontSize: {
    numeral: 72,
    title: 32,
    value: 28,
    heading: 20,
    body: 16,
    label: 14,
    caption: 12,
  },
} as const;

export const textVariants = {
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.title,
    lineHeight: 38,
  },
  heading: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.heading,
  },
  headline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  bodyStrong: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  body: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  overline: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
