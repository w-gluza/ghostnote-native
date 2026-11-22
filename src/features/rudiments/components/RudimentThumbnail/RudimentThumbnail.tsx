import type { VideoSource } from "expo-video";
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";

import { libraryPhotos } from "@/features/library/photos";

import { RudimentVideo } from "@/features/rudiments/components/RudimentVideo/RudimentVideo";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";

type RudimentThumbnailProps = {
  label: string;
  video?: VideoSource;
  photo?: ImageSourcePropType;
  size?: "small" | "large";
};

export function RudimentThumbnail({
  label,
  video,
  photo = libraryPhotos.rudiment,
  size = "small",
}: RudimentThumbnailProps) {
  return (
    <View style={[styles.thumbnail, styles[size]]}>
      {video ? (
        <RudimentVideo source={video} label={label} />
      ) : (
        <Image
          accessible={false}
          source={photo}
          resizeMode="cover"
          style={styles.photo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    borderRadius: layout.radius.thumbnail,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    width: 72,
    height: 72,
    backgroundColor: colors.surface,
  },
  large: {
    width: 88,
    height: 80,
    backgroundColor: colors.background,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
});
