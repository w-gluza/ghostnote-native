import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { IconButton } from "@/components/IconButton/IconButton";
import { colors } from "@/theme/colors";

type ScreenHeaderProps = {
  onBack?: () => void;
};

export function ScreenHeader({ onBack }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton
          icon="chevron.left"
          accessibilityLabel="Back"
          style={styles.back}
          onPress={onBack}
        />
      ) : null}
      <AppText variant="headline">ghostnote</AppText>
      <View style={styles.rule} />
      <IconButton
        icon="person"
        accessibilityLabel="Profile"
        size={24}
        weight="light"
        style={styles.profile}
        onPress={() => router.push("/profile")}
      />
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
  back: {
    marginRight: -24,
    alignItems: "flex-start",
  },
  profile: {
    marginLeft: -20,
    alignItems: "flex-end",
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
