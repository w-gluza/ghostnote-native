import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { RowText } from "@/components/RowText/RowText";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import {
  kitExercises,
  notesLabel,
  notesOf,
} from "@/features/kit-coordination/domain/exercises";
import { layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

export default function KitCoordinationScreen() {
  const router = useRouter();

  return (
    <View style={layoutStyles.screen}>
      <Stack.Screen options={{ ...nativeHeader, headerBackTitle: "Library" }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle>Kit Coordination</PageTitle>
        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          Guided exercises for limb independence and timing on the kit, built up
          one part at a time.
        </AppText>

        <SectionHeader
          title="EXERCISES"
          trailing={
            kitExercises.length === 1
              ? "1 exercise"
              : `${kitExercises.length} exercises`
          }
          style={styles.sectionHeader}
        />

        {kitExercises.map((exercise, index) => {
          const instruments = notesLabel(notesOf(exercise.pattern));
          return (
            <NumberedRow
              key={exercise.id}
              position={index + 1}
              accessibilityLabel={`${exercise.name}, level ${exercise.level}, ${instruments}`}
              isLast={index === kitExercises.length - 1}
              onPress={() =>
                router.push({
                  pathname: "/kit-exercise/[id]",
                  params: { id: exercise.id },
                })
              }
            >
              <RowText
                label={`LVL ${exercise.level}`}
                title={exercise.name}
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
