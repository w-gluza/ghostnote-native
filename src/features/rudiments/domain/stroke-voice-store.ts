type VoiceStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

export const STROKE_VOICES = ["pad", "snare"] as const;

export type StrokeVoice = (typeof STROKE_VOICES)[number];

export const VOICE_KEY = "sound.strokeVoice";

const VOICE_NAMES: Record<StrokeVoice, string> = {
  pad: "Practice pad",
  snare: "Snare drum",
};

export function strokeVoiceName(voice: StrokeVoice) {
  return VOICE_NAMES[voice];
}

export function strokeVoiceFrom(stored: unknown): StrokeVoice {
  return STROKE_VOICES.find((voice) => voice === stored) ?? "pad";
}

export function createStrokeVoiceStore(storage: VoiceStorage) {
  const listeners = new Set<() => void>();
  let strokeVoice = strokeVoiceFrom(storage.load(VOICE_KEY));
  let selections = 0;

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    strokeVoice() {
      return strokeVoice;
    },

    selections() {
      return selections;
    },

    setStrokeVoice(voice: StrokeVoice) {
      if (!storage.save(VOICE_KEY, voice)) {
        return false;
      }
      strokeVoice = voice;
      selections += 1;
      listeners.forEach((listener) => listener());
      return true;
    },
  };
}
