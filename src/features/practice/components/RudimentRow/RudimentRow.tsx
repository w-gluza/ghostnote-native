import type { VideoSource } from "expo-video";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { RowText } from "@/components/RowText/RowText";
import { RudimentThumbnail } from "@/features/rudiments/components/RudimentThumbnail/RudimentThumbnail";
import { colors } from "@/theme/colors";
import { layoutStyles, spacing } from "@/theme/layout";

export type Rudiment = {
  name: string;
  minutes: number;
  rounds: number;
  bpm: number;
  video?: VideoSource;
};

type RudimentRowProps = {
  rudiment: Rudiment;
  position: number;
  isLast: boolean;
  onPress?: () => void;
};

export function RudimentRow({
  rudiment,
  position,
  isLast,
  onPress,
}: RudimentRowProps) {
  return (
    <View style={styles.row}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.timeline}
      >
        <View style={styles.line} />
        <AppText variant="bodySmall" tone="violet" tabular>
          {String(position).padStart(2, "0")}
        </AppText>
        <View style={styles.line} />
      </View>
      <View style={[styles.body, !isLast && styles.bodyDivider]}>
        <Pressable
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={`${position}. ${rudiment.name}, ${rudiment.minutes} minutes, ${rudiment.rounds} rounds, ${rudiment.bpm} beats per minute`}
          disabled={!onPress}
          onPress={onPress}
          style={({ pressed }) => [
            styles.details,
            pressed && layoutStyles.pressed,
          ]}
        >
          <RowText
            label={`${rudiment.minutes} MIN · ${rudiment.rounds} ROUNDS`}
            title={rudiment.name}
            detail={`${rudiment.bpm} BPM`}
          />
        </Pressable>
        <RudimentThumbnail
          video={rudiment.video}
          label={rudiment.name}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timeline: {
    minWidth: 24,
    alignItems: "center",
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.disabled,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  bodyDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.disabled,
  },
  details: {
    flex: 1,
  },
});
