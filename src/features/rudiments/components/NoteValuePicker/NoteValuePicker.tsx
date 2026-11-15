import { StyleSheet } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NoteIcon } from "@/components/NoteIcon/NoteIcon";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";

type NoteValuePickerProps = {
  subdivision: number;
  onChange: (subdivision: number) => void;
};

const NOTE_VALUES = [
  { key: 1, label: "1/4", accessibilityLabel: "Quarter notes" },
  { key: 2, label: "1/8", accessibilityLabel: "Eighth notes" },
  { key: 4, label: "1/16", accessibilityLabel: "Sixteenth notes" },
];

export function NoteValuePicker({
  subdivision,
  onChange,
}: NoteValuePickerProps) {
  const current = NOTE_VALUES.find(
    (noteValue) => noteValue.key === subdivision,
  );

  return (
    <OptionMenu
      name="Note value"
      options={NOTE_VALUES}
      selected={subdivision}
      onChange={onChange}
      align="end"
      hitSlop={12}
      style={styles.picker}
    >
      <NoteIcon />
      <AppText variant="bodyStrong" tabular>
        {current?.label}
      </AppText>
    </OptionMenu>
  );
}

const styles = StyleSheet.create({
  picker: {
    minHeight: 0,
    flexShrink: 0,
  },
});
