import type { VideoSource } from "expo-video";
import { Image, StyleSheet, View } from "react-native";

import { RudimentVideo } from "@/features/rudiments/components/RudimentVideo/RudimentVideo";
import { colors } from "@/theme/colors";

type RudimentThumbnailProps = {
  label: string;
  video?: VideoSource;
  size?: "small" | "large";
};

export function RudimentThumbnail({
  label,
  video,
  size = "small",
}: RudimentThumbnailProps) {
  return (
    <View style={[styles.thumbnail, styles[size]]}>
      {video ? (
        <RudimentVideo source={video} label={label} />
      ) : (
        <Image
          accessible={false}
          source={placeholder}
          resizeMode="cover"
          style={styles.photo}
        />
      )}
    </View>
  );
}

const placeholder = require("@/assets/images/rudiment-placeholder.jpg");

const styles = StyleSheet.create({
  thumbnail: {
    borderRadius: 12,
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
