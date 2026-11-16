import { colors } from "@/theme/colors";

export const nativeHeader = {
  headerShown: true,
  title: "",
  headerBackButtonDisplayMode: "minimal",
  headerShadowVisible: false,
  headerTintColor: colors.text.primary,
  headerStyle: { backgroundColor: colors.background },
} as const;
