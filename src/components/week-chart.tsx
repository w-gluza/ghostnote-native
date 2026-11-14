import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type DayPractice = { day: string; label: string; minutes: number };

type WeekChartProps = {
  days: DayPractice[];
  todayIndex: number;
};

const BAR_AREA_HEIGHT = 120;

export function WeekChart({ days, todayIndex }: WeekChartProps) {
  const longest = Math.max(...days.map((day) => day.minutes), 1);
  const summary = days
    .map((day) => `${day.day} ${day.minutes} minutes`)
    .join(", ");

  return (
    <View accessible accessibilityLabel={summary} style={styles.chart}>
      {days.map((day, index) => {
        const isToday = index === todayIndex;
        return (
          <View key={day.day} style={styles.column}>
            {day.minutes > 0 ? (
              <>
                <Text style={[styles.value, isToday && styles.today]}>
                  {day.minutes}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: (day.minutes / longest) * BAR_AREA_HEIGHT },
                    isToday && styles.barToday,
                  ]}
                />
              </>
            ) : (
              <View style={styles.rest} />
            )}
            <Text style={[styles.day, isToday && styles.today]}>
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: BAR_AREA_HEIGHT + 52,
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  value: {
    marginBottom: 6,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontVariant: ["tabular-nums"],
  },
  bar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: colors.disabled,
  },
  barToday: {
    backgroundColor: colors.accent,
  },
  rest: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.disabled,
  },
  day: {
    marginTop: 8,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  today: {
    color: colors.accent,
  },
});
