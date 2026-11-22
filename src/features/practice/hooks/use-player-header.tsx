import { useRouter } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { IconButton } from "@/components/IconButton/IconButton";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

const HEADER_BUTTONS_WIDTH = 152;

export function usePlayerHeader(backTitle: string) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  return {
    ...nativeHeader,
    headerBackTitle: backTitle,
    headerTitle: () => (
      <View
        style={[styles.wordmark, { width: windowWidth - HEADER_BUTTONS_WIDTH }]}
      >
        <AppText variant="headline">ghostnote</AppText>
        <View style={styles.rule} />
      </View>
    ),
    unstable_headerRightItems: () => [
      {
        type: "custom" as const,
        hidesSharedBackground: true,
        element: (
          <IconButton
            icon="person"
            accessibilityLabel="Profile"
            size={24}
            weight="light"
            onPress={() => router.push("/profile")}
          />
        ),
      },
    ],
  };
}

const styles = StyleSheet.create({
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
