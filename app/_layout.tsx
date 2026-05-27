import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";

// biome-ignore lint/performance/noNamespaceImport: expo-splash-screen is designed for namespace usage
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
        <StatusBar hidden />
        <RootLayout />
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}