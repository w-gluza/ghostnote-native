import { NativeTabs } from "expo-router/native-tabs";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={colors.accent}
      labelStyle={{ fontFamily: typography.fontFamily.medium }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "play.circle", selected: "play.circle.fill" }}
        />
        <NativeTabs.Trigger.Label>Practice</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="metronome">
        <NativeTabs.Trigger.Icon
          sf={{ default: "metronome", selected: "metronome.fill" }}
        />
        <NativeTabs.Trigger.Label>Metronome</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Icon sf="music.note.list" />
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
        />
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
