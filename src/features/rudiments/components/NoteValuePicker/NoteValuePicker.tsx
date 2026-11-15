import { SymbolView } from "expo-symbols";
import { useRef, useState, type ComponentRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type NoteValuePickerProps = {
  subdivision: number;
  onChange: (subdivision: number) => void;
};

type Anchor = { top: number; right: number };

const NOTE_VALUES = [
  { subdivision: 1, label: "1/4", name: "Quarter notes" },
  { subdivision: 2, label: "1/8", name: "Eighth notes" },
  { subdivision: 4, label: "1/16", name: "Sixteenth notes" },
];
const MENU_GAP = 8;

export function NoteValuePicker({
  subdivision,
  onChange,
}: NoteValuePickerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const current = NOTE_VALUES.find(
    (noteValue) => noteValue.subdivision === subdivision,
  );

  const open = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      setAnchor({
        top: y + height + MENU_GAP,
        right: windowWidth - (x + width),
      });
    });
  };
  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`Note value, ${current?.name ?? "not set"}`}
        accessibilityState={{ expanded: anchor !== null }}
        hitSlop={12}
        onPress={open}
        style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
      >
        <Text style={styles.icon}>♫</Text>
        <AppText variant="body" tabular>
          {current?.label}
        </AppText>
        <SymbolView
          name="chevron.down"
          size={13}
          weight="medium"
          tintColor={colors.text.secondary}
        />
      </Pressable>

      <Modal
        transparent
        visible={anchor !== null}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          accessibilityLabel="Close note value menu"
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
        {anchor ? (
          <View
            accessibilityRole="menu"
            style={[styles.menu, { top: anchor.top, right: anchor.right }]}
          >
            {NOTE_VALUES.map((noteValue, index) => {
              const isSelected = noteValue.subdivision === subdivision;
              return (
                <Pressable
                  key={noteValue.subdivision}
                  accessibilityRole="menuitem"
                  accessibilityLabel={noteValue.name}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(noteValue.subdivision);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    index > 0 && styles.itemDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.check}>
                    {isSelected ? (
                      <SymbolView
                        name="checkmark"
                        size={14}
                        weight="semibold"
                        tintColor={colors.accent}
                      />
                    ) : null}
                  </View>
                  <AppText variant="body" tabular>
                    {noteValue.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    color: colors.accent,
    fontSize: typography.fontSize.title,
  },
  menu: {
    position: "absolute",
    minWidth: 128,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  item: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  check: {
    width: 16,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
