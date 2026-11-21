import type { SymbolViewProps } from "expo-symbols";

import { rudimentLibrary } from "../../rudiments/domain/library.ts";

export type LibraryCategory = {
  id: string;
  title: string;
  description: string;
  detail: string;
  symbol: SymbolViewProps["name"];
  route: "/rudiments" | "/kit-coordination";
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
];
