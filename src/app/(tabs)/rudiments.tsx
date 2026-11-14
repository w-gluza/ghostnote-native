import { useRouter } from "expo-router";
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
import {
  ALL_CATEGORIES,
  categoryOptions,
  filterRudiments,
} from "@/rudiments/filter";
import {
  availableRudiments,
  defaultPattern,
  stickingOf,
} from "@/rudiments/library";
import { buildTimeline } from "@/rudiments/timeline";
import { rudimentVideos } from "@/rudiments/videos";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const rudiments: RudimentSummary[] = availableRudiments.map((rudiment) => {
  const timeline = buildTimeline(defaultPattern(rudiment));
  return {
    id: rudiment.id,
    name: rudiment.name,
    category: rudiment.category,
    level: rudiment.level,
    sticking: stickingOf(rudiment),
    phrases: timeline.phrases.map((phrase) =>
      phrase.flatMap((index) => timeline.strokes[index] ?? []),
    ),
    video: rudimentVideos[rudiment.id],
  };
});

const categories = categoryOptions(rudiments);

function Separator() {
  return <View style={styles.separator} />;
}

export default function RudimentsScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const router = useRouter();
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const results = filterRudiments(rudiments, category, query);

  function closeSearch() {
    setIsSearching(false);
    setQuery("");
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(rudiment) => rudiment.name}
      renderItem={({ item }) => {
        const { id } = item;
        return (
          <RudimentListItem
            rudiment={item}
            onPress={
              id
                ? () =>
                    router.push({ pathname: "/rudiment/[id]", params: { id } })
                : undefined
            }
          />
        );
      }}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {category === ALL_CATEGORIES
            ? `No rudiments match "${query.trim()}".`
            : `No ${category.toLowerCase()} match "${query.trim()}".`}
        </Text>
      }
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
                label="Search rudiments"
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
                style={({ pressed }) => [
                  styles.search,
                  pressed && styles.pressed,
                ]}
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
          <FilterChips
            options={categories}
            selected={category}
            onSelect={setCategory}
          />
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
  pressed: {
    opacity: 0.7,
  },
  empty: {
    paddingVertical: 24,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  searchRow: {
    marginTop: 10,
    minHeight: 56,
    justifyContent: "flex-end",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
