import { StyleSheet, View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { RowText } from "@/components/RowText/RowText";
import { stickingPreview } from "@/features/rudiments/domain/sticking-preview";
import { spacing } from "@/theme/layout";
import { typography } from "@/theme/typography";

export type StickingStroke = { hand: string; grace: string[] };

export type RudimentSummary = {
  id?: string;
  name: string;
  category: string;
  level: number;
  sticking: string;
  phrases: StickingStroke[][];
};

const CELL_WIDTH = 14;

type RudimentListItemProps = {
  rudiment: RudimentSummary;
  position: number;
  isLast: boolean;
  onPress: () => void;
};

function Sticking({ phrases }: { phrases: StickingStroke[][] }) {
  const { fontScale } = useWindowDimensions();
  const preview = stickingPreview(phrases);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.sticking}
    >
      {preview.phrases.map((phrase, phraseIndex) => (
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
              <AppText
                variant="bodySmall"
                tone="secondary"
                style={styles.stroke}
              >
                {stroke.hand}
              </AppText>
            </View>
          ))}
        </View>
      ))}
      {preview.isShortened ? (
        <AppText variant="bodySmall" tone="secondary" style={styles.stroke}>
          …
        </AppText>
      ) : null}
    </View>
  );
}

export function RudimentListItem({
  rudiment,
  position,
  isLast,
  onPress,
}: RudimentListItemProps) {
  return (
    <NumberedRow
      position={position}
      isLast={isLast}
      accessibilityLabel={`${rudiment.name}, ${rudiment.category}, level ${rudiment.level}, sticking ${rudiment.sticking}`}
      onPress={onPress}
    >
      <RowText
        label={`${rudiment.category} · Lvl ${rudiment.level}`.toUpperCase()}
        title={rudiment.name}
        detail={<Sticking phrases={rudiment.phrases} />}
      />
    </NumberedRow>
  );
}

const styles = StyleSheet.create({
  sticking: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.md,
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
    lineHeight: 20,
  },
});
