import { StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import {
  limbName,
  limbOf,
  notesOf,
} from "@/features/kit-coordination/domain/exercises";
import {
  midiNoteName,
  type MidiNote,
} from "@/features/kit-coordination/domain/midi-map";
import {
  countLabels,
  strikesOf,
} from "@/features/kit-coordination/domain/timeline";
import type { KitPattern } from "@/features/kit-coordination/domain/types";
import { limbColor } from "@/features/kit-coordination/instrument-colors";
import { colors } from "@/theme/colors";
import { layout, spacing } from "@/theme/layout";

type RhythmGridProps = {
  pattern: KitPattern;
  active: MidiNote[];
  playingColumn: number | null;
};

const LABEL_WIDTH = 92;
const CELL_HEIGHT = 36;
const STRIKE_SIZE = 14;
const REST_SIZE = 4;

export function RhythmGrid({
  pattern,
  active,
  playingColumn,
}: RhythmGridProps) {
  const { fontScale } = useWindowDimensions();
  const labelColumn = { width: LABEL_WIDTH * Math.min(fontScale, 1.4) };
  const counts = countLabels(pattern);
  const tracks = notesOf(pattern).map((note) => {
    const strikes = strikesOf(pattern, note);
    const limb = limbOf(pattern, note);
    return {
      note,
      strikes,
      limb: limb ? limbName(limb) : "",
      color: limb ? limbColor(limb) : colors.text.secondary,
      isActive: active.includes(note),
      spoken: counts.filter((_, column) => strikes[column]).join(", "),
    };
  });
  const description = tracks
    .map((track) =>
      track.isActive
        ? `${midiNoteName(track.note)}, ${track.limb.toLowerCase()}, on ${track.spoken}`
        : `${midiNoteName(track.note)}, not in this stage`,
    )
    .join(". ");

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Rhythm, counted ${counts.join(" ")}. ${description}`}
      style={styles.grid}
    >
      <View style={styles.row}>
        <View style={labelColumn} />
        {counts.map((count, column) => (
          <View
            key={column}
            style={[
              styles.cell,
              styles.countCell,
              column === playingColumn && styles.playing,
              column === playingColumn && styles.playingTop,
            ]}
          >
            <AppText
              variant="caption"
              tone={column === playingColumn ? "primary" : "secondary"}
              tabular
            >
              {count}
            </AppText>
          </View>
        ))}
      </View>

      {tracks.map((track, position) => (
        <View key={track.note} style={styles.row}>
          <View
            style={[
              styles.trackLabel,
              labelColumn,
              !track.isActive && styles.inactive,
            ]}
          >
            <AppText variant="label" numberOfLines={1}>
              {midiNoteName(track.note)}
            </AppText>
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {track.limb}
            </AppText>
          </View>
          {track.strikes.map((isStrike, column) => (
            <View
              key={column}
              style={[
                styles.cell,
                column === playingColumn && styles.playing,
                column === playingColumn &&
                  position === tracks.length - 1 &&
                  styles.playingBottom,
              ]}
            >
              <View
                style={
                  isStrike
                    ? [
                        styles.strike,
                        {
                          backgroundColor: track.isActive
                            ? track.color
                            : colors.border,
                        },
                      ]
                    : [styles.rest, !track.isActive && styles.restInactive]
                }
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: layout.radius.panel,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  inactive: {
    opacity: 0.4,
  },
  trackLabel: {
    justifyContent: "center",
  },
  cell: {
    flex: 1,
    minHeight: CELL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  countCell: {
    minHeight: 24,
  },
  playing: {
    backgroundColor: colors.surfaceRaised,
  },
  playingTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  playingBottom: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  strike: {
    width: STRIKE_SIZE,
    height: STRIKE_SIZE,
    borderRadius: STRIKE_SIZE / 2,
  },
  rest: {
    width: REST_SIZE,
    height: REST_SIZE,
    borderRadius: REST_SIZE / 2,
    backgroundColor: colors.disabled,
  },
  restInactive: {
    backgroundColor: colors.border,
  },
});
