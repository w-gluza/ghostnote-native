import { SymbolView } from "expo-symbols";
import type { VideoSource } from "expo-video";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { RudimentThumbnail } from "@/features/rudiments/components/RudimentThumbnail/RudimentThumbnail";
import { colors } from "@/theme/colors";
import { layoutStyles } from "@/theme/layout";
import { typography } from "@/theme/typography";

export type StickingStroke = { hand: string; grace: string[] };

export type RudimentSummary = {
  id?: string;
  name: string;
  category: string;
  level: number;
  sticking: string;
  phrases: StickingStroke[][];
  video?: VideoSource;
};

const CELL_WIDTH = 18;

type RudimentListItemProps = {
  rudiment: RudimentSummary;
  onPress?: () => void;
};

function Sticking({ phrases }: { phrases: StickingStroke[][] }) {
  const { fontScale } = useWindowDimensions();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.sticking}
    >
      {phrases.map((phrase, phraseIndex) => (
        <View key={phraseIndex} style={styles.phrase}>
          {phrase.map((stroke, index) => (
            <View
              key={index}
              style={[styles.cell, { minWidth: CELL_WIDTH * fontScale }]}
            >
              {stroke.grace.length > 0 ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={styles.grace}
                >
                  {stroke.grace.join("")}
                </AppText>
              ) : null}
              <AppText variant="bodyStrong" style={styles.stroke}>
                {stroke.hand}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function RudimentListItem({ rudiment, onPress }: RudimentListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      accessibilityLabel={`${rudiment.name}, ${rudiment.category}, level ${rudiment.level}, sticking ${rudiment.sticking}`}
      style={({ pressed }) => [styles.row, pressed && layoutStyles.pressed]}
    >
      <RudimentThumbnail video={rudiment.video} label={rudiment.name} />
      <View style={styles.details}>
        <AppText variant="headline" style={styles.name}>
          {rudiment.name}
        </AppText>
        <AppText variant="bodySmall" tone="secondary" style={styles.meta}>
          {rudiment.category} · Lvl {rudiment.level}
        </AppText>
        <Sticking phrases={rudiment.phrases} />
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
  details: {
    flex: 1,
    gap: 3,
  },
  name: {
    lineHeight: 22,
  },
  meta: {
    lineHeight: 20,
  },
  sticking: {
    marginTop: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
  },
  phrase: {
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 1,
  },
  grace: {
    fontFamily: typography.fontFamily.medium,
    lineHeight: 16,
  },
  stroke: {
    lineHeight: 22,
  },
});
