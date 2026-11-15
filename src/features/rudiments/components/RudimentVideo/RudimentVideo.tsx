import { SymbolView } from "expo-symbols";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/theme/colors";
import { layoutStyles } from "@/theme/layout";

type RudimentVideoProps = {
  source: VideoSource;
  label: string;
};

export function RudimentVideo({ source, label }: RudimentVideoProps) {
  const view = useRef<VideoView>(null);
  const player = useVideoPlayer(source, (created) => {
    created.loop = true;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const open = async () => {
    setIsFullscreen(true);
    await view.current?.enterFullscreen();
    player.replay();
    player.play();
  };

  const close = () => {
    setIsFullscreen(false);
    player.pause();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Play ${label} video`}
      onPress={open}
      style={({ pressed }) => [styles.frame, pressed && layoutStyles.pressed]}
    >
      <VideoView
        ref={view}
        player={player}
        nativeControls={isFullscreen}
        contentFit="cover"
        allowsVideoFrameAnalysis={false}
        onFullscreenExit={close}
        style={StyleSheet.absoluteFill}
      />
      <SymbolView name="play.circle.fill" size={28} tintColor={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
});
