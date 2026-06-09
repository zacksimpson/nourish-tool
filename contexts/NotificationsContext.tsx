import AsyncStorage from "@react-native-async-storage/async-storage";
// biome-ignore lint/performance/noNamespaceImport: expo-notifications is designed for namespace usage
import * as ExpoNotifications from "expo-notifications";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const NOTIF_ENABLED_KEY = "notifications:enabled";
const REMINDER_ENABLED_KEY = "notifications:reminder:enabled";
const REMINDER_TIME_KEY = "notifications:reminder:time";

const DAILY_REMINDER_ID = "daily-log-reminder";

// ─── Foreground handler ───────────────────────────────────────────────────────

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTime(time24: string): { hour: number; minute: number } {
  const [h, m] = time24.split(":").map(Number);
  return { hour: h, minute: m };
}

async function scheduleDaily(time: string): Promise<void> {
  await ExpoNotifications.cancelScheduledNotificationAsync(
    DAILY_REMINDER_ID
  ).catch(() => {
    /* notification may not exist */
  });
  const { hour, minute } = parseTime(time);
  await ExpoNotifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      body: "Time to log today's meals",
      data: {},
      title: "Nourish",
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      type: ExpoNotifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

async function cancelDaily(): Promise<void> {
  await ExpoNotifications.cancelScheduledNotificationAsync(
    DAILY_REMINDER_ID
  ).catch(() => {
    /* notification may not exist */
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface NotificationsContextType {
  enabled: boolean;
  permissionDenied: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  setEnabled: (v: boolean) => Promise<void>;
  setReminderEnabled: (v: boolean) => Promise<void>;
  setReminderTime: (time: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null
);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [reminderEnabled, setReminderEnabledState] = useState(false);
  const [reminderTime, setReminderTimeState] = useState("09:00");
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [en, re, rt] = await Promise.all([
        AsyncStorage.getItem(NOTIF_ENABLED_KEY),
        AsyncStorage.getItem(REMINDER_ENABLED_KEY),
        AsyncStorage.getItem(REMINDER_TIME_KEY),
      ]);
      if (en) {
        setEnabledState(en === "true");
      }
      if (re) {
        setReminderEnabledState(re === "true");
      }
      if (rt) {
        setReminderTimeState(rt);
      }
    };
    load();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status: existing } = await ExpoNotifications.getPermissionsAsync();
    if (existing === "granted") {
      setPermissionDenied(false);
      return true;
    }
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    if (status === "granted") {
      setPermissionDenied(false);
      return true;
    }
    setPermissionDenied(true);
    return false;
  }, []);

  const setEnabled = useCallback(
    async (v: boolean) => {
      if (v) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }
      setEnabledState(v);
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(v));
      if (!v) {
        await cancelDaily();
      }
    },
    [requestPermission]
  );

  const setReminderEnabled = useCallback(
    async (v: boolean) => {
      setReminderEnabledState(v);
      await AsyncStorage.setItem(REMINDER_ENABLED_KEY, String(v));
      if (v && enabled) {
        await scheduleDaily(reminderTime);
      } else {
        await cancelDaily();
      }
    },
    [enabled, reminderTime]
  );

  const setReminderTime = useCallback(
    async (time: string) => {
      setReminderTimeState(time);
      await AsyncStorage.setItem(REMINDER_TIME_KEY, time);
      if (enabled && reminderEnabled) {
        await scheduleDaily(time);
      }
    },
    [enabled, reminderEnabled]
  );

  return (
    <NotificationsContext.Provider
      value={{
        enabled,
        permissionDenied,
        reminderEnabled,
        reminderTime,
        setEnabled,
        setReminderEnabled,
        setReminderTime,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
