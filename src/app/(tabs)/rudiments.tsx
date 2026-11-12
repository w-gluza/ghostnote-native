import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { FilterChips } from "@/components/filter-chips";
import {
  RudimentListItem,
  type RudimentSummary,
} from "@/components/rudiment-list-item";
import { ScreenHeader } from "@/components/screen-header";
import { SearchField } from "@/components/search-field";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const categories = ["All", "Rolls", "Diddles", "Flams", "Drags"];

const rudiments: RudimentSummary[] = [
  {
    name: "Single Stroke Roll",
    category: "Rolls",
    level: 1,
    sticking: "R L R L R L R L",
  },
  {
    name: "Double Stroke Roll",
    category: "Rolls",
    level: 1,
    sticking: "R R L L R R L L",
  },
  {
    name: "Triple Stroke Roll",
    category: "Rolls",
    level: 2,
    sticking: "R R R L L L",
  },
  {
    name: "Single Paradiddle",
    category: "Diddles",
    level: 2,
    sticking: "R L R R L R L L",
  },
  { name: "Flam", category: "Flams", level: 2, sticking: "lR L rL R" },
  { name: "Drag", category: "Drags", level: 2, sticking: "llR rrL" },
];

function Separator() {
  return <View style={styles.separator} />;
}

export default function RudimentsScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const results = term
    ? rudiments.filter((rudiment) => rudiment.name.toLowerCase().includes(term))
    : rudiments;

  function closeSearch() {
    setIsSearching(false);
    setQuery("");
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(rudiment) => rudiment.name}
      renderItem={({ item }) => <RudimentListItem rudiment={item} />}
      ItemSeparatorComponent={Separator}
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenHeader />
          {isSearching ? (
            <View style={styles.searchRow}>
              <SearchField
                value={query}
                placeholder="Search rudiments..."
                onChangeText={setQuery}
                onCancel={closeSearch}
              />
            </View>
          ) : (
            <View style={styles.titleRow}>
              <Text accessibilityRole="header" style={styles.title}>
                Rudiments
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search rudiments"
                hitSlop={12}
                onPress={() => setIsSearching(true)}
                style={styles.search}
              >
                <SymbolView
                  name="magnifyingglass"
                  size={24}
                  weight="light"
                  tintColor={colors.text.secondary}
                />
              </Pressable>
            </View>
          )}
          <FilterChips options={categories} selected="All" />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    gap: 20,
    paddingBottom: 12,
  },
  titleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flexShrink: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.display,
    lineHeight: 46,
    paddingTop: 10,
    letterSpacing: -0.5,
  },
  search: {
    paddingBottom: 10,
  },
  searchRow: {
    marginTop: 10,
    height: 56,
    justifyContent: "flex-end",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
