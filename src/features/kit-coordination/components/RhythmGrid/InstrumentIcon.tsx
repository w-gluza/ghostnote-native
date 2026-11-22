import { Image, StyleSheet, type ImageSourcePropType } from "react-native";

import type { MidiNote } from "@/features/kit-coordination/domain/midi-map";

type InstrumentIconProps = {
  note: MidiNote;
  color: string;
};

const PICTURES: Record<MidiNote, ImageSourcePropType> = {
  36: require("@/assets/images/instruments/kick.png"),
  38: require("@/assets/images/instruments/snare.png"),
  42: require("@/assets/images/instruments/hihat.png"),
  44: require("@/assets/images/instruments/pedal.png"),
  45: require("@/assets/images/instruments/floor-tom.png"),
  46: require("@/assets/images/instruments/hihat.png"),
  47: require("@/assets/images/instruments/mid-tom.png"),
  48: require("@/assets/images/instruments/high-tom.png"),
  49: require("@/assets/images/instruments/crash.png"),
  51: require("@/assets/images/instruments/ride.png"),
};

export function InstrumentIcon({ note, color }: InstrumentIconProps) {
  return (
    <Image source={PICTURES[note]} tintColor={color} style={styles.picture} />
  );
}

const styles = StyleSheet.create({
  picture: {
    width: 20,
    height: 24,
    marginVertical: -2,
  },
});
