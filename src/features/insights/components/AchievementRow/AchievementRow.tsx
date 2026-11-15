import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";

export type Achievement = {
  symbol: SymbolViewProps["name"];
  title: string;
  description: string;
  progress: number;
  goal: number;
};

type AchievementRowProps = {
  achievement: Achievement;
};

export function AchievementRow({ achievement }: AchievementRowProps) {
  const { symbol, title, description, progress, goal } = achievement;

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${description}. ${progress} of ${goal}`}
      style={styles.row}
    >
      <View style={styles.badge}>
        <SymbolView
          name={symbol}
          size={26}
          weight="medium"
          tintColor={colors.accent}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.heading}>
          <AppText variant="bodyStrong" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="bodyStrong" tabular>
            {progress}
            <AppText variant="body" tone="secondary">
              /{goal}
            </AppText>
          </AppText>
        </View>
        <AppText
          variant="bodySmall"
          tone="secondary"
          style={styles.description}
        >
          {description}
        </AppText>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${goal > 0 ? Math.min(progress / goal, 1) * 100 : 0}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
  },
  heading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  track: {
    marginTop: 10,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
