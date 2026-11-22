import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { InstrumentIcon } from "@/features/kit-coordination/components/RhythmGrid/InstrumentIcon";
import { limbName } from "@/features/kit-coordination/domain/exercises";
import type { MidiNote } from "@/features/kit-coordination/domain/midi-map";
import {
  countLabels,
  rowsOf,
  type KitCell,
  type KitRow,
} from "@/features/kit-coordination/domain/timeline";
import type { KitPattern } from "@/features/kit-coordination/domain/types";
import { limbColor } from "@/features/kit-coordination/instrument-colors";
import { colors } from "@/theme/colors";
import { layoutStyles, spacing } from "@/theme/layout";

type RhythmGridProps = {
  pattern: KitPattern;
  enabled: MidiNote[];
  playingColumn: number | null;
  onToggle: (row: KitRow) => void;
};

const LABEL_WIDTH = 96;
const ROW_HEIGHT = 52;
const COUNT_HEIGHT = 28;
const STRIKE_SIZE = 16;
const REST_SIZE = 4;
const PLAYHEAD_RADIUS = 8;

function Marker({ cell, color }: { cell: KitCell; color: string }) {
  if (cell === "rest") {
    return <View style={styles.rest} />;
  }
  return (
    <View
      style={[
        styles.strike,
        cell === "open"
          ? { borderColor: color }
          : { borderColor: color, backgroundColor: color },
      ]}
    />
  );
}

export function RhythmGrid({
  pattern,
  enabled,
  playingColumn,
  onToggle,
}: RhythmGridProps) {
  const { fontScale } = useWindowDimensions();
  const labelColumn = { width: LABEL_WIDTH * Math.min(fontScale, 1.4) };
  const counts = countLabels(pattern);
  const rows = rowsOf(pattern);
  const playing = rows.filter((row) =>
    row.notes.every((note) => enabled.includes(note)),
  ).length;
  const hint =
    playing === rows.length ? "TAP TO MUTE" : `${playing} OF ${rows.length} ON`;

  return (
    <View>
      <View
        style={styles.row}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.hint, labelColumn]}>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {hint}
          </AppText>
        </View>
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

      {rows.map((row, position) => {
        const isOn = row.notes.every((note) => enabled.includes(note));
        const color = isOn ? limbColor(row.limb) : colors.border;
        const spoken = counts.filter(
          (_, column) => row.cells[column] !== "rest",
        );

        return (
          <View key={row.id} style={styles.row}>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isOn }}
              accessibilityLabel={`${row.name}, ${limbName(row.limb).toLowerCase()}, plays on ${spoken.join(", ")}`}
              onPress={() => onToggle(row)}
              style={({ pressed }) => [
                styles.label,
                labelColumn,
                pressed && layoutStyles.pressed,
              ]}
            >
              <InstrumentIcon note={row.id} color={color} />
              <AppText
                variant="label"
                tone={isOn ? "primary" : "secondary"}
                numberOfLines={1}
                style={[styles.name, !isOn && styles.muted]}
              >
                {row.name}
              </AppText>
            </Pressable>
            {row.cells.map((cell, column) => (
              <View
                key={column}
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.cell,
                  column === playingColumn && styles.playing,
                  column === playingColumn &&
                    position === rows.length - 1 &&
                    styles.playingBottom,
                ]}
              >
                <Marker cell={cell} color={color} />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  hint: {
    justifyContent: "center",
  },
  label: {
    minHeight: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  muted: {
    opacity: 0.6,
  },
  cell: {
    flex: 1,
    minHeight: ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  countCell: {
    minHeight: COUNT_HEIGHT,
  },
  playing: {
    backgroundColor: colors.surface,
  },
  playingTop: {
    borderTopLeftRadius: PLAYHEAD_RADIUS,
    borderTopRightRadius: PLAYHEAD_RADIUS,
  },
  playingBottom: {
    borderBottomLeftRadius: PLAYHEAD_RADIUS,
    borderBottomRightRadius: PLAYHEAD_RADIUS,
  },
  strike: {
    width: STRIKE_SIZE,
    height: STRIKE_SIZE,
    borderRadius: STRIKE_SIZE / 2,
    borderWidth: 2,
  },
  rest: {
    width: REST_SIZE,
    height: REST_SIZE,
    borderRadius: REST_SIZE / 2,
    backgroundColor: colors.border,
  },
});
