// biome-ignore lint/performance/noNamespaceImport: expo-notifications is designed for namespace usage
import * as ExpoNotifications from "expo-notifications";
import { router, Stack } from "expo-router";
// biome-ignore lint/performance/noNamespaceImport: expo-splash-screen is designed for namespace usage
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  InvertColorsProvider,
  useInvertColors,
} from "@/contexts/InvertColorsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
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
  useEffect(() => {
    const sub = ExpoNotifications.addNotificationResponseReceivedListener(
      (response) => {
        if (
          response.actionIdentifier ===
          ExpoNotifications.DEFAULT_ACTION_IDENTIFIER
        ) {
          router.navigate("/(tabs)/index");
        }
      }
    );
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InvertColorsProvider>
        <NourishProvider>
          <NotificationsProvider>
            <StatusBar hidden />
            <RootLayout />
          </NotificationsProvider>
        </NourishProvider>
      </InvertColorsProvider>
    </GestureHandlerRootView>
  );
}
