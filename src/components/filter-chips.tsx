import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type FilterChipsProps = {
  options: string[];
  selected: string;
};

export function FilterChips({ options, selected }: FilterChipsProps) {
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
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: -24,
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  labelSelected: {
    color: colors.text.onAccent,
    fontFamily: typography.fontFamily.medium,
  },
});
