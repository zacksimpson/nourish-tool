import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Entry {
  breakfast: string;
  date: string;
  dinner: string;
  lunch: string;
  note: string;
  savedAt: number;
  signals: Record<string, "on track" | "roughly" | "off track" | null>;
  snacks: string;
  tags: string[];
}

export const SIGNAL_OPTIONS = [
  { id: "calories", label: "calories" },
  { id: "protein", label: "protein" },
  { id: "carbs", label: "carbs" },
  { id: "fat", label: "fat" },
] as const;

export type SignalId = (typeof SIGNAL_OPTIONS)[number]["id"];

const DEFAULT_SIGNALS: SignalId[] = ["calories", "protein"];

interface NourishContextType {
  entries: Record<string, Entry>;
  loaded: boolean;
  saveEntry: (entry: Entry) => Promise<void>;
  saveSignals: (signals: SignalId[]) => Promise<void>;
  saveTargets: (targets: Record<string, number>) => Promise<void>;
  signals: SignalId[];
  targets: Record<string, number>;
}

const NourishContext = createContext<NourishContextType>({
  loaded: false,
  entries: {},
  signals: DEFAULT_SIGNALS,
  targets: {},
  saveEntry: () => {
    throw new Error("useNourish must be used within NourishProvider");
  },
  saveSignals: () => {
    throw new Error("useNourish must be used within NourishProvider");
  },
  saveTargets: () => {
    throw new Error("useNourish must be used within NourishProvider");
  },
});

export const useNourish = () => useContext(NourishContext);

async function loadStoredData(): Promise<{
  entries: Record<string, Entry>;
  signals: SignalId[] | null;
  targets: Record<string, number> | null;
}> {
  const allKeys = await AsyncStorage.getAllKeys();
  const entryKeys = allKeys.filter((k) => k.startsWith("entry:"));
  const pairs = await AsyncStorage.multiGet([
    ...entryKeys,
    "settings:signals",
    "settings:targets",
  ]);

  const entries: Record<string, Entry> = {};
  let signals: SignalId[] | null = null;
  let targets: Record<string, number> | null = null;

  for (const [key, value] of pairs) {
    if (value === null) {
      continue;
    }
    try {
      if (key.startsWith("entry:")) {
        entries[key.slice("entry:".length)] = JSON.parse(value);
      } else if (key === "settings:signals") {
        signals = JSON.parse(value);
      } else if (key === "settings:targets") {
        targets = JSON.parse(value);
      }
    } catch {
      // skip malformed values
    }
  }

  return { entries, signals, targets };
}

export const NourishProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [signals, setSignals] = useState<SignalId[]>(DEFAULT_SIGNALS);
  const [targets, setTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStoredData()
      .then(({ entries: e, signals: s, targets: t }) => {
        setEntries(e);
        if (s !== null) {
          setSignals(s);
        }
        if (t !== null) {
          setTargets(t);
        }
      })
      .catch(() => {
        // storage read failure — app starts with defaults
      })
      .finally(() => setLoaded(true));
  }, []);

  const saveEntry = useCallback(async (entry: Entry) => {
    setEntries((prev) => ({ ...prev, [entry.date]: entry }));
    await AsyncStorage.setItem(`entry:${entry.date}`, JSON.stringify(entry));
  }, []);

  const saveSignals = useCallback(async (newSignals: SignalId[]) => {
    setSignals(newSignals);
    await AsyncStorage.setItem("settings:signals", JSON.stringify(newSignals));
  }, []);

  const saveTargets = useCallback(
    async (newTargets: Record<string, number>) => {
      setTargets(newTargets);
      await AsyncStorage.setItem(
        "settings:targets",
        JSON.stringify(newTargets)
      );
    },
    []
  );

  return (
    <NourishContext.Provider
      value={{
        loaded,
        entries,
        signals,
        targets,
        saveEntry,
        saveSignals,
        saveTargets,
      }}
    >
      {children}
    </NourishContext.Provider>
  );
};
