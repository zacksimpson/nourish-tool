import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { TimePicker } from "@/components/TimePicker";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import {
  digitsToTime,
  formatTime,
  timeToDisplayParts,
} from "@/utils/notifTime";
import { n } from "@/utils/scaling";

export default function NotificationsScreen() {
  const { bg, textColor } = useThemeColors();
  const {
    enabled,
    reminderEnabled,
    reminderTime,
    permissionDenied,
    setEnabled,
    setReminderEnabled,
    setReminderTime,
  } = useNotifications();

  const initParts = timeToDisplayParts(reminderTime);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeDigits, setTimeDigits] = useState(initParts.digits);
  const [ampm, setAmPm] = useState<"AM" | "PM">(initParts.ampm);

  const handleTimeConfirm = useCallback(() => {
    if (timeDigits.length !== 3 && timeDigits.length !== 4) {
      return;
    }
    const t24 = digitsToTime(timeDigits, ampm);
    setReminderTime(t24);
    setShowTimePicker(false);
  }, [timeDigits, ampm, setReminderTime]);

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle="Notifications" />

        <View style={styles.row}>
          <ToggleSwitch
            label="Enable Notifications"
            onValueChange={setEnabled}
            value={enabled}
          />
        </View>

        {permissionDenied && (
          <View style={styles.row}>
            <StyledText style={[styles.permissionMsg, { color: textColor }]}>
              Please enable notification permissions for Nourish in your device
              settings.
            </StyledText>
          </View>
        )}

        {enabled && (
          <>
            <View style={styles.row}>
              <ToggleSwitch
                label="Daily Log Reminder"
                onValueChange={setReminderEnabled}
                value={reminderEnabled}
              />
            </View>

            {reminderEnabled && (
              <HapticPressable
                onPress={() => setShowTimePicker(true)}
                style={styles.row}
              >
                <StyledText
                  style={[styles.selectorLabel, { color: textColor }]}
                >
                  Notification Time
                </StyledText>
                <StyledText
                  style={[styles.selectorValue, { color: textColor }]}
                >
                  {formatTime(reminderTime)}
                </StyledText>
              </HapticPressable>
            )}
          </>
        )}

        <TimePicker
          ampm={ampm}
          digits={timeDigits}
          onAmPm={setAmPm}
          onBackspace={() => setTimeDigits((prev) => prev.slice(0, -1))}
          onConfirm={handleTimeConfirm}
          onDigit={(d) =>
            setTimeDigits((prev) => (prev.length < 4 ? prev + d : prev))
          }
          onDismiss={() => setShowTimePicker(false)}
          visible={showTimePicker}
        />
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    paddingHorizontal: n(22),
    paddingVertical: n(16),
  },
  permissionMsg: {
    fontSize: n(16),
    opacity: 0.6,
  },
  selectorLabel: {
    fontSize: n(20),
    lineHeight: n(20),
    paddingTop: n(7.5),
  },
  selectorValue: {
    fontSize: n(30),
    paddingBottom: n(10),
  },
});
