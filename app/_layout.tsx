import { Stack } from "expo-router";
// biome-ignore lint/performance/noNamespaceImport: expo-splash-screen is designed for namespace usage
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { NourishProvider } from "@/contexts/NourishContext";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { invertColors, loaded } = useInvertColors();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: {
          backgroundColor: invertColors ? "white" : "black",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InvertColorsProvider>
        <NourishProvider>
          <StatusBar hidden />
          <RootLayout />
        </NourishProvider>
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}
