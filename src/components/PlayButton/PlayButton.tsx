import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/theme/colors";

type PlayButtonProps = {
  isPlaying: boolean;
  onPress?: () => void;
};

export function PlayButton({ isPlaying, onPress }: PlayButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? "Pause" : "Play"}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <SymbolView
        name={isPlaying ? "pause.fill" : "play.fill"}
        size={30}
        tintColor={colors.text.onAccent}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
