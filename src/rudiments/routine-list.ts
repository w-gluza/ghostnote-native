import type { Routine } from "./types";

export function withRoutine(routines: Routine[], routine: Routine) {
  return routines.some((saved) => saved.id === routine.id)
    ? routines.map((saved) => (saved.id === routine.id ? routine : saved))
    : [...routines, routine];
}

export function withoutRoutine(routines: Routine[], id: string) {
  return routines.filter((saved) => saved.id !== id);
}
