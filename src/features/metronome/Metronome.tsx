import { useIsFocused } from "expo-router";
import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import {
  AppState,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { NoteIcon } from "@/components/NoteIcon/NoteIcon";
import {
  RhythmBar,
  RhythmBarSeparator,
} from "@/components/RhythmBar/RhythmBar";
import { IconButton } from "@/components/IconButton/IconButton";
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
import { layout, layoutStyles } from "@/theme/layout";

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
    width - 2 * (layout.screenInset + STEP_BUTTON_SIZE + DIAL_GAP),
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
  const pause = useEffectEvent(() => playback.pause());
  useEffect(() => {
    if (!isFocused) {
      pause();
    }
  }, [isFocused]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        pause();
      }
    });
    return () => subscription.remove();
  }, []);

  const subdivisionOptions = subdivisionsFor(settings.meter).map((option) => ({
    key: option.clicks,
    label: option.name,
  }));

  return (
    <SafeAreaView style={layoutStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <ScreenHeader />

        <RhythmBar style={styles.rhythm}>
          <OptionMenu
            name="Time signature"
            chevron={false}
            options={meterOptions}
            selected={meterLabel(settings.meter)}
            onChange={(label) => {
              const meter = meterFromLabel(label);
              if (meter) {
                change((current) => withMeter(current, meter));
              }
            }}
          >
            <AppText variant="bodyStrong">{meterLabel(settings.meter)}</AppText>
          </OptionMenu>
          <RhythmBarSeparator />
          <OptionMenu
            name="Subdivision"
            options={subdivisionOptions}
            selected={settings.subdivision}
            onChange={(subdivision) =>
              change((current) => ({ ...current, subdivision }))
            }
          >
            <NoteIcon />
            <AppText
              variant="bodyStrong"
              numberOfLines={1}
              style={styles.subdivisionLabel}
            >
              {subdivisionName(settings)}
            </AppText>
          </OptionMenu>
        </RhythmBar>

        <View style={styles.stage}>
          <View style={styles.dialRow}>
            <IconButton
              icon="minus"
              accessibilityLabel="Decrease tempo"
              size={28}
              weight="light"
              disabled={settings.bpm <= MIN_BPM}
              hitSlop={8}
              style={[styles.step, styles.stepStart]}
              onPress={() => stepBpm(-1)}
              onLongPress={() => startRepeat(-1)}
              onPressOut={stopRepeat}
            />
            <TempoDial
              bpm={settings.bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              size={dialSize}
              onChange={changeBpm}
            />
            <IconButton
              icon="plus"
              accessibilityLabel="Increase tempo"
              size={28}
              weight="light"
              disabled={settings.bpm >= MAX_BPM}
              hitSlop={8}
              style={[styles.step, styles.stepEnd]}
              onPress={() => stepBpm(1)}
              onLongPress={() => startRepeat(1)}
              onPressOut={stopRepeat}
            />
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
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingHorizontal: layout.screenInset,
  },
  rhythm: {
    marginTop: 24,
  },
  subdivisionLabel: {
    flexShrink: 1,
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
    minWidth: STEP_BUTTON_SIZE,
    minHeight: STEP_BUTTON_SIZE,
    width: STEP_BUTTON_SIZE,
    height: STEP_BUTTON_SIZE,
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
