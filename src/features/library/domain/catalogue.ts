import { findGroove, grooves } from "../../grooves/domain/grooves.ts";
import {
  findKitExercise,
  kitExercises,
  notesLabel,
  notesOf,
} from "../../kit-coordination/domain/exercises.ts";
import type { KitExercise } from "../../kit-coordination/domain/types";
import {
  defaultBpm,
  findRudiment,
  rudimentLibrary,
  stickingOf,
} from "../../rudiments/domain/library.ts";
import type { Rudiment } from "../../rudiments/domain/types";

export type CatalogueSource = "rudiment" | "kit-coordination" | "groove";

export type CatalogueEntry = {
  id: string;
  source: CatalogueSource;
  name: string;
  level: number;
  category: string;
  detail: string;
  defaultBpm: number;
};

function rudimentEntry(rudiment: Rudiment): CatalogueEntry {
  return {
    id: rudiment.id,
    source: "rudiment",
    name: rudiment.name,
    level: rudiment.level,
    category: rudiment.category,
    detail: stickingOf(rudiment),
    defaultBpm: defaultBpm(rudiment),
  };
}

function kitEntry(
  item: KitExercise,
  source: CatalogueSource,
  category: string,
): CatalogueEntry {
  return {
    id: item.id,
    source,
    name: item.name,
    level: item.level,
    category,
    detail: notesLabel(notesOf(item.pattern)),
    defaultBpm: item.defaultTempo.bpm,
  };
}

export function findKitItem(id: string) {
  return findKitExercise(id) ?? findGroove(id);
}

export function findEntry(id: string): CatalogueEntry | undefined {
  const rudiment = findRudiment(id);
  if (rudiment) {
    return rudimentEntry(rudiment);
  }
  const exercise = findKitExercise(id);
  if (exercise) {
    return kitEntry(exercise, "kit-coordination", "Kit Coordination");
  }
  const groove = findGroove(id);
  return groove ? kitEntry(groove, "groove", groove.style) : undefined;
}

export const catalogueSections: { title: string; entries: CatalogueEntry[] }[] =
  [
    { title: "Rudiments", entries: rudimentLibrary.map(rudimentEntry) },
    {
      title: "Kit Coordination",
      entries: kitExercises.map((exercise) =>
        kitEntry(exercise, "kit-coordination", "Kit Coordination"),
      ),
    },
    {
      title: "Grooves",
      entries: grooves.map((groove) =>
        kitEntry(groove, "groove", groove.style),
      ),
    },
  ];
