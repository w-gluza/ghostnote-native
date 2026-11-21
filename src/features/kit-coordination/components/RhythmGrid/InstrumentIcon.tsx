import { StyleSheet, View } from "react-native";

import type { MidiNote } from "@/features/kit-coordination/domain/midi-map";

type InstrumentIconProps = {
  note: MidiNote;
  color: string;
};

const SIZE = 20;
const STROKE = 1.5;

const CYMBALS: MidiNote[] = [49, 51];
const HIHATS: MidiNote[] = [42, 46];
const PEDAL = 44;
const KICK = 36;

export function InstrumentIcon({ note, color }: InstrumentIconProps) {
  const tint = { borderColor: color };

  if (CYMBALS.includes(note)) {
    return (
      <View style={styles.box}>
        <View style={[styles.cymbal, tint]} />
      </View>
    );
  }
  if (HIHATS.includes(note)) {
    return (
      <View style={styles.box}>
        <View style={[styles.cymbal, tint]} />
        <View style={[styles.cymbal, tint]} />
      </View>
    );
  }
  if (note === PEDAL) {
    return (
      <View style={styles.box}>
        <View style={[styles.cymbal, tint]} />
        <View style={[styles.stem, { backgroundColor: color }]} />
        <View style={[styles.plate, { backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <View style={[styles.drum, note === KICK && styles.kick, tint]}>
        {note === KICK ? (
          <View style={[styles.beater, { backgroundColor: color }]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cymbal: {
    width: SIZE,
    height: 6,
    borderRadius: 3,
    borderWidth: STROKE,
  },
  stem: {
    width: STROKE,
    height: 5,
  },
  plate: {
    width: 12,
    height: STROKE,
  },
  drum: {
    width: 15,
    height: 15,
    borderRadius: 999,
    borderWidth: STROKE,
    alignItems: "center",
    justifyContent: "center",
  },
  kick: {
    width: SIZE,
    height: SIZE,
  },
  beater: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
});
