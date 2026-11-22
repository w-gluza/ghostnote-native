import { useLocalSearchParams } from "expo-router";

import { findGroove } from "@/features/grooves/domain/grooves";
import { KitExerciseScreenFor } from "@/features/kit-coordination/KitExercise";

export default function GrooveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <KitExerciseScreenFor exercise={findGroove(id)} backTitle="Grooves" />;
}
