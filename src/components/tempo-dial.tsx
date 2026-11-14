import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const ARC_START = -150;
const ARC_END = 150;
const TICK_STEP = 3;
const MAJOR_EVERY = 10;

const tickAngles = Array.from(
  { length: (ARC_END - ARC_START) / TICK_STEP + 1 },
  (_, index) => ARC_START + index * TICK_STEP,
);

type TempoDialProps = {
  bpm: number;
  position: number;
  size: number;
};

export function TempoDial({ bpm, position, size }: TempoDialProps) {
  const markerAngle = ARC_START + position * (ARC_END - ARC_START);

  return (
    <View
      accessible
      accessibilityLabel="Tempo"
      accessibilityValue={{ text: `${bpm} beats per minute` }}
      style={{ width: size, height: size }}
    >
      {tickAngles.map((angle, index) => (
        <View
          key={angle}
          pointerEvents="none"
          style={[styles.spoke, { transform: [{ rotate: `${angle}deg` }] }]}
        >
          <View
            style={[
              styles.tick,
              index % MAJOR_EVERY === 0 && styles.tickMajor,
              angle <= markerAngle && styles.tickActive,
            ]}
          />
        </View>
      ))}
      <View
        pointerEvents="none"
        style={[styles.spoke, { transform: [{ rotate: `${markerAngle}deg` }] }]}
      >
        <View style={styles.marker} />
      </View>
      <View pointerEvents="none" style={styles.readout}>
        <Text maxFontSizeMultiplier={1.3} style={styles.value}>
          {bpm}
        </Text>
        <Text style={styles.unit}>BPM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spoke: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
  },
  tick: {
    width: 1,
    height: 9,
    marginTop: 4,
    backgroundColor: colors.text.secondary,
  },
  tickMajor: {
    height: 13,
    marginTop: 0,
  },
  tickActive: {
    backgroundColor: colors.accent,
  },
  marker: {
    width: 7,
    height: 20,
    marginTop: -3,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
  },
  readout: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.numeral,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  unit: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
    letterSpacing: 1,
  },
});
