import type { ImageSourcePropType } from "react-native";

import type { CatalogueSource } from "@/features/library/domain/catalogue";

export const libraryPhotos: Record<CatalogueSource, ImageSourcePropType> = {
  rudiment: require("@/assets/images/photos/rudiments.jpg"),
  "kit-coordination": require("@/assets/images/photos/kit-coordination.jpg"),
  groove: require("@/assets/images/photos/grooves.jpg"),
};
