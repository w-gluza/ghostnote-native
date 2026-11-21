import type { MidiNote } from "@/features/kit-coordination/domain/midi-map";
import { colors } from "@/theme/colors";

const COLORS: Partial<Record<MidiNote, string>> = {
  51: colors.accent,
  38: colors.violet,
  36: colors.slate,
  44: colors.text.primary,
};

export function instrumentColor(note: MidiNote) {
  return COLORS[note] ?? colors.text.secondary;
}
