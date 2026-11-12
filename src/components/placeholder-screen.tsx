import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader />
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.note}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
  },
  note: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
});
