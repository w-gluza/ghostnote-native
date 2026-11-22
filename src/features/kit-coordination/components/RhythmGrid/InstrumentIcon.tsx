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

const PICTURES: Partial<Record<MidiNote, ImageSourcePropType>> = {
  36: require("@/assets/images/instruments/kick.png"),
  38: require("@/assets/images/instruments/snare.png"),
  42: require("@/assets/images/instruments/hihat.png"),
  44: require("@/assets/images/instruments/pedal.png"),
  45: require("@/assets/images/instruments/floor-tom.png"),
  46: require("@/assets/images/instruments/hihat.png"),
  47: require("@/assets/images/instruments/mid-tom.png"),
  48: require("@/assets/images/instruments/high-tom.png"),
  51: require("@/assets/images/instruments/ride.png"),
};

export function InstrumentIcon({ note, color }: InstrumentIconProps) {
  const picture = PICTURES[note];
  if (picture !== undefined) {
    return <Image source={picture} tintColor={color} style={styles.picture} />;
  }
  return (
    <View style={styles.box}>
      <View style={[styles.cymbal, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  cymbal: {
    width: SIZE,
    height: 6,
    borderRadius: 3,
    borderWidth: STROKE,
  },
  picture: {
    width: SIZE,
    height: 24,
    marginVertical: -2,
  },
});
