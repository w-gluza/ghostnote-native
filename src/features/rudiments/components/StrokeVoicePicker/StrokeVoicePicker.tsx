import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import {
  STROKE_VOICES,
  strokeVoiceName,
} from "@/features/rudiments/domain/stroke-voice-store";
import {
  setStrokeVoice,
  useStrokeVoice,
} from "@/features/rudiments/stores/stroke-voice";

const VOICE_OPTIONS = STROKE_VOICES.map((voice) => ({
  key: voice,
  label: strokeVoiceName(voice),
}));

export function StrokeVoicePicker() {
  const strokeVoice = useStrokeVoice();

  return (
    <View style={styles.slot}>
      <OptionMenu
        name="Stroke sound"
        options={VOICE_OPTIONS}
        selected={strokeVoice}
        onChange={setStrokeVoice}
        hitSlop={12}
        style={styles.picker}
      >
        <AppText variant="bodyStrong" numberOfLines={1}>
          {strokeVoiceName(strokeVoice)}
        </AppText>
      </OptionMenu>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: "flex-start",
  },
  picker: {
    minHeight: 0,
  },
});
