import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { PlayButton } from "@/components/PlayButton/PlayButton";
import { Stat } from "@/components/Stat/Stat";
import { TempoStepper } from "@/components/TempoStepper/TempoStepper";
import { divider, spacing } from "@/theme/layout";

type PlaybackControlsProps = {
  variant: "bar" | "stacked";
  bpm: number;
  minBpm: number;
  maxBpm: number;
  step: number;
  isPlaying: boolean;
  onChangeBpm: (bpm: number) => void;
  onTogglePlayback: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PlaybackControls({
  variant,
  bpm,
  minBpm,
  maxBpm,
  step,
  isPlaying,
  onChangeBpm,
  onTogglePlayback,
  style,
}: PlaybackControlsProps) {
  return (
    <View style={[styles[variant], style]}>
      <TempoStepper
        canDecrease={bpm > minBpm}
        canIncrease={bpm < maxBpm}
        onDecrease={() => onChangeBpm(bpm - step)}
        onIncrease={() => onChangeBpm(bpm + step)}
      >
        <Stat
          value={bpm}
          label="BPM"
          accessibilityLabel={`${bpm} beats per minute`}
          style={styles.readout}
        />
      </TempoStepper>
      <PlayButton isPlaying={isPlaying} onPress={onTogglePlayback} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    ...divider.top,
  },
  stacked: {
    alignItems: "center",
    gap: spacing.xl,
  },
  readout: {
    minWidth: 72,
  },
});
