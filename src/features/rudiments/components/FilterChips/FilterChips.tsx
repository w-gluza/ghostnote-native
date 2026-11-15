import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { layout, layoutStyles, spacing } from "@/theme/layout";

type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
};

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => {
        const isSelected = option === selected;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.target,
              pressed && layoutStyles.pressed,
            ]}
          >
            <View style={[styles.chip, isSelected && styles.chipSelected]}>
              <AppText
                variant="label"
                tone={isSelected ? "onAccent" : "secondary"}
              >
                {option}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: -layout.screenInset,
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: layout.screenInset,
    gap: spacing.sm,
  },
  target: {
    minHeight: layout.minTouchSize,
    justifyContent: "center",
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
});
