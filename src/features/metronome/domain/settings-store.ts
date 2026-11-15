import {
  defaultSettings,
  isMetronomeSettings,
  type MetronomeSettings,
} from "./metronome.ts";

type SettingsStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

export const SETTINGS_KEY = "metronome";

export function createMetronomeSettingsStore(storage: SettingsStorage) {
  const listeners = new Set<() => void>();
  const stored = storage.load(SETTINGS_KEY);
  let settings = isMetronomeSettings(stored) ? stored : defaultSettings;

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    settings() {
      return settings;
    },

    change(next: (current: MetronomeSettings) => MetronomeSettings) {
      settings = next(settings);
      listeners.forEach((listener) => listener());
      return storage.save(SETTINGS_KEY, settings);
    },
  };
}
