import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { minutesLabel } from "@/features/practice/domain/insights";
import { colors } from "@/theme/colors";

export type DayPractice = { day: string; label: string; ms: number };

type WeekChartProps = {
  days: DayPractice[];
  todayIndex: number;
};

const BAR_AREA_HEIGHT = 120;
const SHORTEST_BAR = 4;

function spoken(ms: number) {
  const label = minutesLabel(ms);
  if (label === "<1") {
    return "less than a minute";
  }
  return label === "1" ? "1 minute" : `${label} minutes`;
}

export function WeekChart({ days, todayIndex }: WeekChartProps) {
  const longest = Math.max(...days.map((day) => day.ms), 1);
  const summary = days.map((day) => `${day.day} ${spoken(day.ms)}`).join(", ");

  return (
    <View accessible accessibilityLabel={summary} style={styles.chart}>
      {days.map((day, index) => {
        const isToday = index === todayIndex;
        return (
          <View key={day.day} style={styles.column}>
            {day.ms > 0 ? (
              <>
                <AppText
                  variant="bodySmall"
                  tone={isToday ? "accent" : "secondary"}
                  tabular
                  style={styles.value}
                >
                  {minutesLabel(day.ms)}
                </AppText>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(
                        SHORTEST_BAR,
                        (day.ms / longest) * BAR_AREA_HEIGHT,
                      ),
                    },
                    isToday && styles.barToday,
                  ]}
                />
              </>
            ) : (
              <View style={styles.rest} />
            )}
            <AppText
              variant="caption"
              tone={isToday ? "accent" : "secondary"}
              style={styles.day}
            >
              {day.label}
            </AppText>
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
  },
});
