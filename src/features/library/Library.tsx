import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { RowText } from "@/components/RowText/RowText";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { SettingsRow } from "@/components/SettingsRow/SettingsRow";
import { libraryCategories } from "@/features/library/domain/categories";
import { colors } from "@/theme/colors";
import { layoutStyles, spacing } from "@/theme/layout";

export default function LibraryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={layoutStyles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={layoutStyles.contentBelowHeader}
    >
      <ScreenHeader />

      <PageTitle style={styles.title}>Library</PageTitle>
      <AppText variant="body" tone="secondary" style={styles.subtitle}>
        Explore exercises and build your skills.
      </AppText>

      <View style={styles.categories}>
        {libraryCategories.map((category, index) => (
          <SettingsRow
            key={category.id}
            symbol={category.symbol}
            accessibilityLabel={`${category.title}, ${category.description}, ${category.detail}`}
            isLast={index === libraryCategories.length - 1}
            style={styles.row}
            onPress={() => router.push(category.route)}
          >
            <RowText
              label={category.detail.toUpperCase()}
              title={category.title}
              detail={category.description}
              style={styles.text}
            />
            <SymbolView
              name="chevron.right"
              size={13}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </SettingsRow>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  categories: {
    marginTop: spacing.section,
  },
  row: {
    paddingVertical: spacing.xl,
  },
  text: {
    flex: 1,
  },
});
