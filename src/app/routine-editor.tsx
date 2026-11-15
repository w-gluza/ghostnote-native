import { removeRoutine } from "@/features/practice/hooks/practice-session";
import RoutineEditor from "@/features/routines/RoutineEditor";

export default function RoutineEditorRoute() {
  return <RoutineEditor onDelete={removeRoutine} />;
}
