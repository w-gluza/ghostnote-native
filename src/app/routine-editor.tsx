import { removeRoutine } from "@/features/practice/stores/practice-session";
import RoutineEditor from "@/features/routines/RoutineEditor";

export default function RoutineEditorRoute() {
  return <RoutineEditor onDelete={removeRoutine} />;
}
