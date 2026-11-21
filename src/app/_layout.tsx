import { DarkTheme, Stack, ThemeProvider } from "expo-router";

import { startPracticeTracking } from "@/features/practice/stores/practice-session";
import { LaunchPad } from "@/features/rudiments/components/LaunchPad/LaunchPad";
import { colors } from "@/theme/colors";

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text.primary,
    border: colors.border,
  },
};

export const unstable_settings = { anchor: "(tabs)" };

startPracticeTracking();

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false, statusBarStyle: "light" }}>
        <Stack.Screen name="profile" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="routine-editor"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <LaunchPad />
    </ThemeProvider>
  );
}
