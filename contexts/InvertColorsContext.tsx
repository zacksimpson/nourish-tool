import { setBackgroundColorAsync } from "expo-system-ui";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface InvertColorsContextType {
  invertColors: boolean;
  loaded: boolean;
  setInvertColors: (value: boolean) => Promise<void>;
}

const InvertColorsContext = createContext<InvertColorsContextType>({
  invertColors: false,
  loaded: false,
  setInvertColors: () => {
    throw new Error("useInvertColors must be used within InvertColorsProvider");
  },
});

export const useInvertColors = () => useContext(InvertColorsContext);

export const InvertColorsProvider = ({ children }: { children: ReactNode }) => {
  const [invertColors, setInvertColorsState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("invertColors").then((stored) => {
      if (stored !== null) {
        try {
          setInvertColorsState(JSON.parse(stored));
        } catch {
          // ignore malformed value
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    setBackgroundColorAsync(invertColors ? "white" : "black").catch(() => {
      // Activity may be destroyed during hot reload
    });
  }, [invertColors]);

  const setInvertColors = async (value: boolean) => {
    setInvertColorsState(value);
    await AsyncStorage.setItem("invertColors", JSON.stringify(value));
  };

  return (
    <InvertColorsContext.Provider value={{ invertColors, loaded, setInvertColors }}>
      {children}
    </InvertColorsContext.Provider>
  );
};