import { useRef } from "react";
import { StyleSheet, View, type GestureResponderEvent } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import {
  ARC_END,
  ARC_START,
  isOnRing,
  touchAngle,
  turnBetween,
  turnedBpm,
} from "@/features/metronome/domain/dial";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const TICK_STEP = 3;
const MAJOR_EVERY = 10;

const tickAngles = Array.from(
  { length: (ARC_END - ARC_START) / TICK_STEP + 1 },
  (_, index) => ARC_START + index * TICK_STEP,
);

type TempoDialProps = {
  bpm: number;
  min: number;
  max: number;
  size: number;
  onChange: (bpm: number) => void;
};

export function TempoDial({ bpm, min, max, size, onChange }: TempoDialProps) {
  const position = (bpm - min) / (max - min);
  const markerAngle = ARC_START + position * (ARC_END - ARC_START);

  const drag = useRef({ angle: 0, bpm });

  const touchOf = (event: GestureResponderEvent) => ({
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY,
  });
  const startsOnRing = (event: GestureResponderEvent) =>
    isOnRing(touchOf(event), size);
  const startTurn = (event: GestureResponderEvent) => {
    drag.current = { angle: touchAngle(touchOf(event), size), bpm };
  };
  const turn = (event: GestureResponderEvent) => {
    const touch = touchOf(event);
    if (!isOnRing(touch, size)) {
      return;
    }
    const angle = touchAngle(touch, size);
    const turned = turnedBpm(
      drag.current.bpm,
      turnBetween(drag.current.angle, angle),
      min,
      max,
    );
    drag.current = { angle, bpm: turned };
    onChange(Math.round(turned));
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Tempo"
      accessibilityValue={{ text: `${bpm} beats per minute` }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(event) =>
        onChange(bpm + (event.nativeEvent.actionName === "increment" ? 1 : -1))
      }
      onStartShouldSetResponder={startsOnRing}
      onMoveShouldSetResponder={startsOnRing}
      onResponderTerminationRequest={() => false}
      onResponderGrant={startTurn}
      onResponderMove={turn}
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
        <AppText
          variant="body"
          tabular
          maxFontSizeMultiplier={1.3}
          style={styles.value}
        >
          {bpm}
        </AppText>
        <AppText variant="caption" tone="secondary" style={styles.unit}>
          BPM
        </AppText>
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
    fontSize: typography.fontSize.numeral,
    letterSpacing: -1,
  },
  unit: {
    letterSpacing: 1,
  },
});
