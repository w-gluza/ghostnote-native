import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { IconButton } from "@/components/IconButton/IconButton";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { FilterChips } from "@/features/rudiments/components/FilterChips/FilterChips";
import {
  RudimentListItem,
  type RudimentSummary,
} from "@/features/rudiments/components/RudimentListItem/RudimentListItem";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { SearchField } from "@/features/rudiments/components/SearchField/SearchField";
import {
  ALL_CATEGORIES,
  categoryOptions,
  filterRudiments,
} from "@/features/rudiments/domain/filter";
import {
  availableRudiments,
  defaultPattern,
  stickingOf,
} from "@/features/rudiments/domain/library";
import { buildTimeline } from "@/features/rudiments/domain/timeline";
import { rudimentVideos } from "@/features/rudiments/domain/videos";
import { colors } from "@/theme/colors";
import { layoutStyles, spacing } from "@/theme/layout";

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
        <AppText variant="body" tone="secondary" style={styles.empty}>
          {category === ALL_CATEGORIES
            ? `No rudiments match "${query.trim()}".`
            : `No ${category.toLowerCase()} match "${query.trim()}".`}
        </AppText>
      }
      style={layoutStyles.screen}
      contentContainerStyle={layoutStyles.contentBelowHeader}
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
              <PageTitle size="large" style={styles.title}>
                Rudiments
              </PageTitle>
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
  header: {
    gap: spacing.xl,
    paddingBottom: spacing.md,
  },
  titleRow: {
    marginTop: spacing.sm,
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
  empty: {
    paddingVertical: spacing.xl,
  },
  searchRow: {
    marginTop: spacing.sm,
    minHeight: 56,
    justifyContent: "flex-end",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
