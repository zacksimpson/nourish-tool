import { MaterialIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";

interface NavbarProps {
  currentScreenName: string;
  navigation: BottomTabBarProps["navigation"];
}

export function Navbar({ currentScreenName, navigation }: NavbarProps) {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const isOnHistory = currentScreenName === "history";

  return (
    <View style={[styles.navbar, { backgroundColor: bg }]}>
      <HapticPressable onPress={() => router.push("/settings")}>
        <MaterialIcons color={textColor} name="settings" size={n(48)} />
      </HapticPressable>

      <HapticPressable
        onPress={() => navigation.navigate(isOnHistory ? "index" : "history")}
      >
        <StyledText style={[styles.centerLabel, { color: textColor }]}>
          {isOnHistory ? "today" : "view logs"}
        </StyledText>
      </HapticPressable>

      <HapticPressable onPress={() => router.push("/search")}>
        <MaterialIcons color={textColor} name="search" size={n(48)} />
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: n(11),
    paddingHorizontal: n(20),
  },
  centerLabel: {
    fontSize: n(13),
    letterSpacing: n(2),
    textTransform: "uppercase",
  },
});
