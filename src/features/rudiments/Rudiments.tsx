import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState/EmptyState";
import { IconButton } from "@/components/IconButton/IconButton";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { FilterChips } from "@/features/rudiments/components/FilterChips/FilterChips";
import {
  RudimentListItem,
  type RudimentSummary,
} from "@/features/rudiments/components/RudimentListItem/RudimentListItem";
import { SearchField } from "@/features/rudiments/components/SearchField/SearchField";
import {
  ALL_CATEGORIES,
  categoryOptions,
  filterRudiments,
} from "@/features/rudiments/domain/filter";
import {
  rudimentLibrary,
  defaultPattern,
  stickingOf,
} from "@/features/rudiments/domain/library";
import { buildTimeline } from "@/features/rudiments/domain/timeline";
import { layout, layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

const rudiments: RudimentSummary[] = rudimentLibrary.map((rudiment) => {
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
  };
});

const categories = categoryOptions(rudiments);

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
      renderItem={({ item, index }) => {
        const { id } = item;
        return (
          <RudimentListItem
            rudiment={item}
            position={index + 1}
            isLast={index === results.length - 1}
            onPress={() => {
              if (id) {
                router.push({ pathname: "/rudiment/[id]", params: { id } });
              }
            }}
          />
        );
      }}
      ListEmptyComponent={
        <EmptyState>
          {category === ALL_CATEGORIES
            ? `No rudiments match "${query.trim()}".`
            : `No ${category.toLowerCase()} match "${query.trim()}".`}
        </EmptyState>
      }
      style={layoutStyles.screen}
      contentContainerStyle={layoutStyles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View>
          <Stack.Screen
            options={{ ...nativeHeader, headerBackTitle: "Library" }}
          />
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
              <PageTitle style={styles.title}>Rudiments</PageTitle>
              <IconButton
                icon="magnifyingglass"
                accessibilityLabel="Search rudiments"
                tone="muted"
                size={24}
                weight="light"
                style={styles.search}
                onPress={() => setIsSearching(true)}
              />
            </View>
          )}
          {isSearching ? null : (
            <AppText variant="body" tone="secondary" style={styles.subtitle}>
              The 40 essential sticking patterns, from rolls and diddles to
              flams and drags. Play each one against a click at your own tempo.
            </AppText>
          )}
          <View style={styles.filters}>
            <FilterChips
              options={categories}
              selected={category}
              onSelect={setCategory}
            />
          </View>
          {results.length > 0 ? (
            <SectionHeader
              title="PATTERNS"
              trailing={
                results.length === 1
                  ? "1 pattern"
                  : `${results.length} patterns`
              }
              style={styles.sectionHeader}
            />
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.sm,
  },
  filters: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    marginTop: spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flexShrink: 1,
  },
  search: {
    paddingBottom: 10,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  searchRow: {
    minHeight: layout.minTouchSize,
    justifyContent: "flex-end",
  },
});
