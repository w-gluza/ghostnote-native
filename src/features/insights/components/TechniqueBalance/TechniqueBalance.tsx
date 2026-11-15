import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";

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
            <AppText variant="body" tone="secondary" style={styles.name}>
              {technique.name}
            </AppText>
            <AppText variant="bodyStrong" tabular>
              {technique.percent}%
            </AppText>
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
  },
});
