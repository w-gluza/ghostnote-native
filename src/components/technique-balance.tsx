import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type TechniqueShare = { name: string; percent: number; color: string };

type TechniqueBalanceProps = {
  techniques: TechniqueShare[];
};

export function TechniqueBalance({ techniques }: TechniqueBalanceProps) {
  return (
    <View>
      <View style={styles.bar}>
        {techniques
          .filter((technique) => technique.percent > 0)
          .map((technique) => (
            <View
              key={technique.name}
              style={{
                flex: technique.percent,
                backgroundColor: technique.color,
              }}
            />
          ))}
      </View>

      <View style={styles.legend}>
        {techniques.map((technique) => (
          <View
            key={technique.name}
            accessible
            accessibilityLabel={`${technique.name} ${technique.percent} percent`}
            style={styles.item}
          >
            <View style={[styles.dot, { backgroundColor: technique.color }]} />
            <Text style={styles.name}>{technique.name}</Text>
            <Text style={styles.percent}>{technique.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  legend: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 24,
  },
  item: {
    flexBasis: "40%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  percent: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
});
