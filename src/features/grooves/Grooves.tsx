import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { RowText } from "@/components/RowText/RowText";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { grooves } from "@/features/grooves/domain/grooves";
import {
  notesLabel,
  notesOf,
} from "@/features/kit-coordination/domain/exercises";
import { layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

export default function GroovesScreen() {
  const router = useRouter();

  return (
    <View style={layoutStyles.screen}>
      <Stack.Screen options={{ ...nativeHeader, headerBackTitle: "Library" }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle>Grooves</PageTitle>
        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          Essential beats from rock, funk, blues and more. Play the whole groove
          or switch parts off to work on one limb.
        </AppText>

        <SectionHeader
          title="BEATS"
          trailing={`${grooves.length} beats`}
          style={styles.sectionHeader}
        />

        {grooves.map((groove, index) => {
          const instruments = notesLabel(notesOf(groove.pattern));
          return (
            <NumberedRow
              key={groove.id}
              position={index + 1}
              accessibilityLabel={`${groove.name}, ${groove.style}, level ${groove.level}, ${instruments}`}
              isLast={index === grooves.length - 1}
              onPress={() =>
                router.push({
                  pathname: "/groove/[id]",
                  params: { id: groove.id },
                })
              }
            >
              <RowText
                label={`${groove.style.toUpperCase()} · LVL ${groove.level}`}
                title={groove.name}
                detail={instruments}
              />
            </NumberedRow>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    marginTop: spacing.section,
  },
});
