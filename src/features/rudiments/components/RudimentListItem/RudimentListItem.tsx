import { SymbolView } from "expo-symbols";
import type { VideoSource } from "expo-video";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { RudimentVideo } from "@/features/rudiments/components/RudimentVideo/RudimentVideo";
import { colors } from "@/theme/colors";
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
                <Text style={styles.grace}>{stroke.grace.join("")}</Text>
              ) : null}
              <Text style={styles.stroke}>{stroke.hand}</Text>
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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.thumbnail}>
        {rudiment.video ? (
          <RudimentVideo source={rudiment.video} label={rudiment.name} />
        ) : (
          <Image
            accessible={false}
            source={placeholder}
            resizeMode="cover"
            style={styles.photo}
          />
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{rudiment.name}</Text>
        <Text style={styles.meta}>
          {rudiment.category} · Lvl {rudiment.level}
        </Text>
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

const placeholder = require("@/assets/images/rudiment-placeholder.jpg");

const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: "100%",
  },
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
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    lineHeight: 22,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
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
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    lineHeight: 16,
  },
  stroke: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
    lineHeight: 22,
  },
});
