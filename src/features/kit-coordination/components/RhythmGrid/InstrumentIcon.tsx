import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

import type { MidiNote } from "@/features/kit-coordination/domain/midi-map";

type InstrumentIconProps = {
  note: MidiNote;
  color: string;
};

const SIZE = 20;
const STROKE = 1.5;

const CYMBALS: MidiNote[] = [49, 51];
const PEDAL = 44;

const PICTURES: Partial<Record<MidiNote, ImageSourcePropType>> = {
  36: require("@/assets/images/instruments/kick.png"),
  38: require("@/assets/images/instruments/snare.png"),
  42: require("@/assets/images/instruments/hihat.png"),
  46: require("@/assets/images/instruments/hihat.png"),
  51: require("@/assets/images/instruments/ride.png"),
};

export function InstrumentIcon({ note, color }: InstrumentIconProps) {
  const picture = PICTURES[note];
  if (picture !== undefined) {
    return <Image source={picture} tintColor={color} style={styles.picture} />;
  }
  const tint = { borderColor: color };

  if (CYMBALS.includes(note)) {
    return (
      <View style={styles.box}>
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
      <View style={[styles.drum, tint]} />
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
  picture: {
    width: SIZE,
    height: 24,
    marginVertical: -2,
  },
});
