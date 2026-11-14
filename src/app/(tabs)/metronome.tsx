import { SymbolView } from "expo-symbols";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BeatPattern, type BeatKind } from "@/components/beat-pattern";
import { PlayButton } from "@/components/play-button";
import { ScreenHeader } from "@/components/screen-header";
import { TempoDial } from "@/components/tempo-dial";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const SCREEN_PADDING = 24;
const STEP_BUTTON_SIZE = 36;
const DIAL_GAP = 4;
const MAX_DIAL_SIZE = 300;

const tempo = { bpm: 120, position: 0.7 };
const timeSignature = { beats: 4, noteValue: 4 };
const subdivision = "Eighth notes";
const beatPattern: BeatKind[] = ["accent", "normal", "normal", "skipped"];

export default function MetronomeScreen() {
  const { width } = useWindowDimensions();
  const dialSize = Math.min(
    width - 2 * (SCREEN_PADDING + STEP_BUTTON_SIZE + DIAL_GAP),
    MAX_DIAL_SIZE,
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <ScreenHeader />

        <View style={styles.rhythm}>
          <View style={styles.rhythmControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Time signature, ${timeSignature.beats} ${timeSignature.noteValue}`}
              style={({ pressed }) => [
                styles.target,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.signatureLabel}>
                {timeSignature.beats}/{timeSignature.noteValue}
              </Text>
            </Pressable>
            <View style={styles.rhythmSeparator} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Subdivision, ${subdivision}`}
              style={({ pressed }) => [
                styles.target,
                styles.subdivision,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.subdivisionIcon}>♫</Text>
              <Text style={styles.subdivisionLabel}>{subdivision}</Text>
              <SymbolView
                name="chevron.down"
                size={13}
                weight="medium"
                tintColor={colors.text.secondary}
              />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rhythm settings"
            style={({ pressed }) => [
              styles.target,
              styles.settings,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name="slider.vertical.3"
              size={22}
              weight="light"
              tintColor={colors.text.secondary}
            />
          </Pressable>
        </View>

        <View style={styles.stage}>
          <View style={styles.dialRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease tempo"
              hitSlop={8}
              style={({ pressed }) => [
                styles.step,
                styles.stepStart,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name="minus"
                size={28}
                weight="light"
                tintColor={colors.text.primary}
              />
            </Pressable>
            <TempoDial {...tempo} size={dialSize} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase tempo"
              hitSlop={8}
              style={({ pressed }) => [
                styles.step,
                styles.stepEnd,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name="plus"
                size={28}
                weight="light"
                tintColor={colors.text.primary}
              />
            </Pressable>
          </View>
          <BeatPattern beats={beatPattern} playingBeat={2} />
        </View>

        <View style={styles.transport}>
          <PlayButton isPlaying />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingHorizontal: SCREEN_PADDING,
  },
  target: {
    minHeight: 44,
    justifyContent: "center",
  },
  settings: {
    minWidth: 44,
    alignItems: "flex-end",
  },
  pressed: {
    opacity: 0.7,
  },
  rhythm: {
    marginTop: 24,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.surface,
  },
  subdivisionIcon: {
    color: colors.accent,
    fontSize: typography.fontSize.title,
  },
  rhythmControls: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rhythmSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.disabled,
  },
  subdivision: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subdivisionLabel: {
    flexShrink: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  signatureLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  stage: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  dialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  step: {
    width: STEP_BUTTON_SIZE,
    height: STEP_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  stepStart: {
    alignItems: "flex-start",
  },
  stepEnd: {
    alignItems: "flex-end",
  },
  transport: {
    marginBottom: 28,
    alignItems: "center",
  },
});
