import { useSyncExternalStore } from "react";

import { load, save } from "../../../storage/storage";
import { createStrokeVoiceStore } from "../domain/stroke-voice-store";

const store = createStrokeVoiceStore({ load, save });

export const setStrokeVoice = store.setStrokeVoice;

export function useStrokeVoice() {
  return useSyncExternalStore(store.subscribe, store.strokeVoice);
}

export function useStrokeVoiceSelections() {
  return useSyncExternalStore(store.subscribe, store.selections);
}
