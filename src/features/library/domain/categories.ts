import type { SymbolViewProps } from "expo-symbols";

import { grooves } from "../../grooves/domain/grooves.ts";
import { rudimentLibrary } from "../../rudiments/domain/library.ts";

export type LibraryCategory = {
  id: string;
  title: string;
  description: string;
  detail: string;
  symbol: SymbolViewProps["name"];
  route: "/rudiments" | "/kit-coordination" | "/grooves";
};

export const libraryCategories: LibraryCategory[] = [
  {
    id: "rudiments",
    title: "Rudiments",
    description: "Sticking, technique & control",
    detail: `${rudimentLibrary.length} patterns`,
    symbol: "music.quarternote.3",
    route: "/rudiments",
  },
  {
    id: "kit-coordination",
    title: "Kit Coordination",
    description: "Limb independence & timing",
    detail: "Guided exercises",
    symbol: "circle.grid.2x2",
    route: "/kit-coordination",
  },
  {
    id: "grooves",
    title: "Grooves",
    description: "Essential beats by style",
    detail: `${grooves.length} beats`,
    symbol: "waveform",
    route: "/grooves",
  },
];
