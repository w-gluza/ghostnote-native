import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type ScreenHeaderProps = {
  onBack?: () => void;
};

export function ScreenHeader({ onBack }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [
            styles.target,
            styles.back,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name="chevron.left"
            size={20}
            weight="medium"
            tintColor={colors.text.primary}
          />
        </Pressable>
      ) : null}
      <Text style={styles.wordmark}>ghostnote</Text>
      <View style={styles.rule} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push("/profile")}
        style={({ pressed }) => [
          styles.target,
          styles.profile,
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name="person"
          size={24}
          weight="light"
          tintColor={colors.text.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: -10,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  target: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  back: {
    marginRight: -24,
    alignItems: "flex-start",
  },
  profile: {
    marginLeft: -20,
    alignItems: "flex-end",
  },
  pressed: {
    opacity: 0.7,
  },
  wordmark: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
