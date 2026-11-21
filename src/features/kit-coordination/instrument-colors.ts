import type { Limb } from "@/features/kit-coordination/domain/types";
import { colors } from "@/theme/colors";

const COLORS: Record<Limb, string> = {
  "right-hand": colors.accent,
  "left-hand": colors.violet,
  "right-foot": colors.slate,
  "left-foot": colors.text.primary,
};

export function limbColor(limb: Limb) {
  return COLORS[limb];
}
