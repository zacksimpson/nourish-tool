import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text as DefaultText, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { useThemeColors } from "@/hooks/useThemeColors";
import { todayDateString } from "@/utils/formatDate";
import { n } from "@/utils/scaling";

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function HistoryScreen() {
  const { bg, textColor } = useThemeColors();

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (date: string) => {
    router.push({ pathname: "/entry/[date]", params: { date } });
  };

  const todayStr = todayDateString();

  const rows = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(
        cells
          .slice(i, i + 7)
          .concat(new Array(7).fill(null))
          .slice(0, 7)
      );
    }
    return result;
  }, [viewYear, viewMonth]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <Header
        headerTitle={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
        hideBackButton
        leftAction={{ icon: "chevron-left", onPress: handlePrevMonth }}
        rightAction={{ icon: "chevron-right", onPress: handleNextMonth }}
      />

      <View style={styles.content}>
        <View style={styles.dayHeaderRow}>
          {DAY_HEADERS.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static day-of-week headers, index is correct key
            <View key={`h-${i}`} style={styles.dayHeaderCell}>
              <DefaultText
                allowFontScaling={false}
                style={[styles.dayHeader, { color: textColor }]}
              >
                {d}
              </DefaultText>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {rows.map((row, ri) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: calendar grid rows have no stable identity
            <View key={`row-${ri}`} style={styles.row}>
              {row.map((day, ci) => {
                if (!day) {
                  // biome-ignore lint/suspicious/noArrayIndexKey: empty calendar cells have no identity
                  return <View key={`e-${ci}`} style={styles.cell} />;
                }
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;
                return (
                  <HapticPressable
                    key={`d-${day}`}
                    onPress={() => handleSelectDate(dateStr)}
                    style={styles.cell}
                  >
                    <StyledText style={[styles.dayText, { color: textColor }]}>
                      {day}
                    </StyledText>
                    {isToday && (
                      <View
                        style={[
                          styles.todayUnderline,
                          { backgroundColor: textColor },
                        ]}
                      />
                    )}
                  </HapticPressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: n(16),
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: n(4),
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: n(8),
  },
  dayHeader: {
    fontSize: n(20),
    textAlign: "center",
    fontFamily: "PublicSans-Regular",
  },
  grid: {},
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: n(9),
    position: "relative",
  },
  dayText: {
    fontSize: n(22),
    textAlign: "center",
    fontFamily: "PublicSans-Regular",
  },
  todayUnderline: {
    position: "absolute",
    bottom: n(7),
    width: n(14),
    height: n(1.5),
  },
});
