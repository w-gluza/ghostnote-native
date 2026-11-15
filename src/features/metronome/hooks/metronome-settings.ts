import { useSyncExternalStore } from "react";

import { load, save } from "../../../storage/storage";
import { createMetronomeSettingsStore } from "../domain/settings-store";

const store = createMetronomeSettingsStore({ load, save });

export const changeMetronomeSettings = store.change;

export function useMetronomeSettings() {
  return useSyncExternalStore(store.subscribe, store.settings);
}
