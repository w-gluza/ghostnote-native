import { SymbolView } from "expo-symbols";
import type { VideoSource } from "expo-video";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RudimentVideo } from "@/components/rudiment-video";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type RudimentSummary = {
  id?: string;
  name: string;
  category: string;
  level: number;
  sticking: string;
  video?: VideoSource;
};

type RudimentListItemProps = {
  rudiment: RudimentSummary;
  onPress?: () => void;
};

export function RudimentListItem({ rudiment, onPress }: RudimentListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      accessibilityLabel={`${rudiment.name}, ${rudiment.category}, level ${rudiment.level}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.thumbnail}>
        {rudiment.video ? (
          <RudimentVideo source={rudiment.video} label={rudiment.name} />
        ) : (
          <SymbolView
            name="play.circle.fill"
            size={28}
            tintColor={colors.accent}
          />
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{rudiment.name}</Text>
        <Text style={styles.meta}>
          {rudiment.category} · Lvl {rudiment.level}
        </Text>
        <Text numberOfLines={1} style={styles.sticking}>
          {rudiment.sticking}
        </Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={16}
        weight="medium"
        tintColor={colors.text.secondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  sticking: {
    marginTop: 3,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    letterSpacing: 1,
  },
});
