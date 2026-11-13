import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { NoteValuePicker } from "@/components/note-value-picker";
import { RudimentPlayer } from "@/components/rudiment-player";
import { ScreenHeader } from "@/components/screen-header";
import { findRudiment } from "@/rudiments/library";
import { useStrokeSound } from "@/rudiments/use-stroke-sound";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export default function RudimentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rudiment = findRudiment(id);
  const router = useRouter();
  const sound = useStrokeSound();
  const [subdivision, setSubdivision] = useState(
    rudiment?.pattern.subdivision ?? 1,
  );
  const pattern = useMemo(
    () => (rudiment ? { ...rudiment.pattern, subdivision } : undefined),
    [rudiment, subdivision],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScreenHeader onBack={router.back} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {rudiment && pattern ? (
          <>
            <Text accessibilityRole="header" style={styles.title}>
              {rudiment.name}
            </Text>
            <View style={styles.settings}>
              <Text
                accessibilityLabel="Time signature, 4 4"
                style={styles.signature}
              >
                4/4
              </Text>
              <View style={styles.separator} />
              <Text numberOfLines={1} style={styles.detail}>
                {rudiment.category} · Lvl {rudiment.level}
              </Text>
              <NoteValuePicker
                subdivision={subdivision}
                onChange={setSubdivision}
              />
            </View>
            <RudimentPlayer
              key={rudiment.id}
              pattern={pattern}
              initialBpm={rudiment.defaultBpm}
              sound={sound}
            />
          </>
        ) : (
          <Text style={styles.meta}>This rudiment has no player yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  scroll: {
    marginTop: 16,
  },
  content: {
    paddingBottom: 32,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
    marginBottom: 12,
  },
  settings: {
    marginBottom: 16,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
  },
  signature: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.disabled,
  },
  detail: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
});
