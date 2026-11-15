import { useIsFocused } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef } from "react";
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BeatPattern } from "@/features/metronome/components/BeatPattern/BeatPattern";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import { PlayButton } from "@/components/PlayButton/PlayButton";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { TempoDial } from "@/features/metronome/components/TempoDial/TempoDial";
import {
  buildClicks,
  clampBpm,
  clickSound,
  MAX_BPM,
  meterFromLabel,
  meterLabel,
  METERS,
  MIN_BPM,
  playingBeat,
  subdivisionName,
  subdivisionsFor,
  tempoOf,
  withMeter,
  withNextBeatKind,
} from "@/features/metronome/domain/metronome";
import {
  changeMetronomeSettings as change,
  useMetronomeSettings,
} from "@/features/metronome/stores/metronome-settings";
import { useRudimentPlayback } from "@/features/rudiments/hooks/use-rudiment-playback";
import { useClickSound } from "@/features/rudiments/hooks/use-stroke-sound";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const SCREEN_PADDING = 24;
const STEP_BUTTON_SIZE = 36;
const DIAL_GAP = 4;
const MAX_DIAL_SIZE = 300;
const REPEAT_MS = 80;

const meterOptions = METERS.map((meter) => ({
  key: meterLabel(meter),
  label: meterLabel(meter),
}));

export default function MetronomeScreen() {
  const { width } = useWindowDimensions();
  const dialSize = Math.min(
    width - 2 * (SCREEN_PADDING + STEP_BUTTON_SIZE + DIAL_GAP),
    MAX_DIAL_SIZE,
  );
  const settings = useMetronomeSettings();
  const sound = useClickSound();
  const loop = useMemo(() => buildClicks(settings), [settings]);

  const changeBpm = (bpm: number) =>
    change((current) => ({ ...current, bpm: clampBpm(bpm) }));
  const stepBpm = (step: number) =>
    change((current) => ({ ...current, bpm: clampBpm(current.bpm + step) }));

  const repeat = useRef<ReturnType<typeof setInterval>>(undefined);
  const startRepeat = (step: number) => {
    clearInterval(repeat.current);
    repeat.current = setInterval(() => stepBpm(step), REPEAT_MS);
  };
  const stopRepeat = () => clearInterval(repeat.current);
  useEffect(() => () => clearInterval(repeat.current), []);

  const playback = useRudimentPlayback({
    timeline: loop,
    tempo: tempoOf(settings),
    clock: sound?.now,
    restartOnPlay: true,
    onSchedule: (index, timeMs) => {
      const click = clickSound(loop.strokes[index]);
      if (click) {
        sound?.play(click.sample, click.level, timeMs);
      }
    },
    onCancel: sound?.cancel,
  });

  const isFocused = useIsFocused();
  const pause = useRef(() => {});
  useEffect(() => {
    pause.current = playback.pause;
  });
  useEffect(() => {
    if (!isFocused) {
      pause.current();
    }
  }, [isFocused]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        pause.current();
      }
    });
    return () => subscription.remove();
  }, []);

  const subdivisionOptions = subdivisionsFor(settings.meter).map((option) => ({
    key: option.clicks,
    label: option.name,
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <ScreenHeader />

        <View style={styles.rhythm}>
          <OptionMenu
            name="Time signature"
            options={meterOptions}
            selected={meterLabel(settings.meter)}
            onChange={(label) => {
              const meter = meterFromLabel(label);
              if (meter) {
                change((current) => withMeter(current, meter));
              }
            }}
          >
            <Text style={styles.signatureLabel}>
              {meterLabel(settings.meter)}
            </Text>
          </OptionMenu>
          <View style={styles.rhythmSeparator} />
          <OptionMenu
            name="Subdivision"
            options={subdivisionOptions}
            selected={settings.subdivision}
            onChange={(subdivision) =>
              change((current) => ({ ...current, subdivision }))
            }
          >
            <Text style={styles.subdivisionIcon}>♫</Text>
            <Text numberOfLines={1} style={styles.subdivisionLabel}>
              {subdivisionName(settings)}
            </Text>
            <SymbolView
              name="chevron.down"
              size={13}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </OptionMenu>
        </View>

        <View style={styles.stage}>
          <View style={styles.dialRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease tempo"
              disabled={settings.bpm <= MIN_BPM}
              hitSlop={8}
              onPress={() => stepBpm(-1)}
              onLongPress={() => startRepeat(-1)}
              onPressOut={stopRepeat}
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
            <TempoDial
              bpm={settings.bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              size={dialSize}
              onChange={changeBpm}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase tempo"
              disabled={settings.bpm >= MAX_BPM}
              hitSlop={8}
              onPress={() => stepBpm(1)}
              onLongPress={() => startRepeat(1)}
              onPressOut={stopRepeat}
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
          <BeatPattern
            beats={settings.beats}
            playingBeat={playingBeat(
              loop.strokes,
              playback.isPlaying ? playback.activeIndex : null,
            )}
            onPressBeat={(index) =>
              change((current) => withNextBeatKind(current, index))
            }
          />
        </View>

        <View style={styles.transport}>
          <PlayButton
            isPlaying={playback.isPlaying}
            onPress={playback.toggle}
          />
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
    gap: 12,
    backgroundColor: colors.surface,
  },
  subdivisionIcon: {
    color: colors.accent,
    fontSize: typography.fontSize.title,
  },
  rhythmSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.disabled,
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
