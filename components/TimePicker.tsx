import { MaterialIcons } from "@expo/vector-icons";
import { Modal, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useThemeColors } from "@/hooks/useThemeColors";
import { n } from "@/utils/scaling";

// ─── Digit validation ─────────────────────────────────────────────────────────
// Display slots (right-to-left fill):
// 1 digit  "6"    →  "  : 6"
// 2 digits "63"   →  "  :63"
// 3 digits "630"  →  "6:30"
// 4 digits "1230" →  "12:30"

function isValidNextDigit(current: string, next: string): boolean {
  const proposed = current + next;

  switch (proposed.length) {
    case 1:
      return true;

    case 2:
      if (proposed[0] === "0") {
        return Number.parseInt(next, 10) >= 1 && Number.parseInt(next, 10) <= 9;
      }
      return Number.parseInt(next, 10) <= 5;

    case 3: {
      const firstDigit = Number.parseInt(proposed[0], 10);
      if (firstDigit === 0) {
        const hourOnes = Number.parseInt(proposed[1], 10);
        const minTens = Number.parseInt(proposed[2], 10);
        return hourOnes >= 1 && hourOnes <= 9 && minTens >= 0 && minTens <= 5;
      }
      const m = Number.parseInt(proposed.slice(1), 10);
      return firstDigit >= 1 && firstDigit <= 9 && m >= 0 && m <= 59;
    }

    case 4: {
      const h = Number.parseInt(proposed.slice(0, 2), 10);
      const m = Number.parseInt(proposed.slice(2), 10);
      return h >= 1 && h <= 12 && m >= 0 && m <= 59;
    }

    default:
      return false;
  }
}

function buildDisplay(digits: string): string {
  switch (digits.length) {
    case 0:
      return "  :  ";
    case 1:
      return `  : ${digits[0]}`;
    case 2:
      return `  :${digits}`;
    case 3:
      return `${digits[0]}:${digits.slice(1)}`;
    case 4:
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    default:
      return "  :  ";
  }
}

interface TimePickerProps {
  ampm: "AM" | "PM";
  digits: string;
  onAmPm: (v: "AM" | "PM") => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onDigit: (d: string) => void;
  onDismiss: () => void;
  visible: boolean;
}

export function TimePicker({
  visible,
  digits,
  ampm,
  onDigit,
  onBackspace,
  onAmPm,
  onConfirm,
  onDismiss,
}: TimePickerProps) {
  const { bg, textColor } = useThemeColors();
  const hasDigits = digits.length > 0;
  const canConfirm = digits.length === 3 || digits.length === 4;

  let saveOrDismissBtn: React.ReactNode;
  if (canConfirm) {
    saveOrDismissBtn = (
      <HapticPressable onPress={onConfirm} style={styles.numBtn}>
        <StyledText style={[styles.saveText, { color: textColor }]}>
          SAVE
        </StyledText>
      </HapticPressable>
    );
  } else if (hasDigits) {
    saveOrDismissBtn = <View style={styles.numBtn} />;
  } else {
    saveOrDismissBtn = (
      <HapticPressable onPress={onDismiss} style={styles.numBtn}>
        <StyledText style={[styles.dismissX, { color: textColor }]}>
          ✕
        </StyledText>
      </HapticPressable>
    );
  }

  const handleDigit = (d: string) => {
    if (digits.length >= 4) {
      return;
    }
    if (isValidNextDigit(digits, d)) {
      onDigit(d);
    }
  };

  const numRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <Modal
      animationType="none"
      statusBarTranslucent
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.topSpacer} />

        <View style={styles.topSection}>
          <HapticPressable onPress={() => onAmPm("AM")} style={styles.ampmLeft}>
            <StyledText style={[styles.ampmText, { color: textColor }]}>
              AM
            </StyledText>
            {ampm === "AM" && (
              <View
                style={[styles.ampmUnderline, { backgroundColor: textColor }]}
              />
            )}
          </HapticPressable>

          <View pointerEvents="none" style={styles.timeContainer}>
            <StyledText style={[styles.timeDisplay, { color: textColor }]}>
              {buildDisplay(digits)}
            </StyledText>
          </View>

          <HapticPressable
            onPress={() => onAmPm("PM")}
            style={styles.ampmRight}
          >
            <StyledText style={[styles.ampmText, { color: textColor }]}>
              PM
            </StyledText>
            {ampm === "PM" && (
              <View
                style={[styles.ampmUnderline, { backgroundColor: textColor }]}
              />
            )}
          </HapticPressable>
        </View>

        <View style={styles.numpad}>
          {numRows.map((row, ri) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static numpad rows
            <View key={`row-${ri}`} style={styles.numRow}>
              {row.map((d) => (
                <HapticPressable
                  key={d}
                  onPress={() => handleDigit(d)}
                  style={styles.numBtn}
                >
                  <StyledText style={[styles.numText, { color: textColor }]}>
                    {d}
                  </StyledText>
                </HapticPressable>
              ))}
            </View>
          ))}

          <View style={styles.numRow}>
            {saveOrDismissBtn}
            <HapticPressable
              onPress={() => handleDigit("0")}
              style={styles.numBtn}
            >
              <StyledText style={[styles.numText, { color: textColor }]}>
                0
              </StyledText>
            </HapticPressable>
            {hasDigits ? (
              <HapticPressable onPress={onBackspace} style={styles.numBtn}>
                <MaterialIcons
                  color={textColor}
                  name="chevron-left"
                  size={n(44)}
                />
              </HapticPressable>
            ) : (
              <View style={styles.numBtn} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: n(56) },
  topSpacer: { height: n(40) },
  topSection: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: n(-32),
    paddingBottom: n(8),
    paddingTop: n(32),
    position: "relative",
  },
  ampmLeft: { alignItems: "center", paddingLeft: n(8), width: n(60) },
  ampmRight: { alignItems: "center", paddingRight: n(8), width: n(60) },
  timeContainer: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  ampmText: { fontSize: n(24) },
  ampmUnderline: { height: n(3), marginTop: n(2), width: n(32) },
  timeDisplay: {
    fontFamily: "PublicSans-Thin",
    fontSize: n(90),
    includeFontPadding: false,
    textAlign: "center",
  },
  numpad: { flex: 1, justifyContent: "space-evenly", paddingBottom: n(16) },
  numRow: { flexDirection: "row", justifyContent: "space-between" },
  numBtn: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: n(3),
  },
  numText: { fontFamily: "PublicSans-Regular", fontSize: n(35) },
  saveText: { fontFamily: "PublicSans-Regular", fontSize: n(20) },
  dismissX: { fontSize: n(24) },
});
