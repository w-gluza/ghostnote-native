import { Stack } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { RowText } from "@/components/RowText/RowText";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import {
  plannedKitExercises,
  voicesLabel,
} from "@/features/kit-coordination/domain/exercises";
import { divider, layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

export default function KitCoordinationScreen() {
  return (
    <View style={layoutStyles.screen}>
      <Stack.Screen options={{ ...nativeHeader, headerBackTitle: "Library" }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle>Kit Coordination</PageTitle>
        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          Guided exercises for limb independence and timing across the ride,
          snare, kick and hi-hat pedal. They are not ready to play yet.
        </AppText>

        <SectionHeader title="COMING SOON" style={styles.sectionHeader} />

        {plannedKitExercises.map((exercise, index) => {
          const voices = voicesLabel(exercise.voices);
          return (
            <View
              key={exercise.id}
              accessible
              accessibilityLabel={`${exercise.name}, coming soon, ${voices}`}
              style={[
                styles.row,
                index < plannedKitExercises.length - 1 && divider.bottom,
              ]}
            >
              <RowText title={exercise.name} detail={voices} />
            </View>
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
  row: {
    paddingVertical: spacing.xl,
  },
});
