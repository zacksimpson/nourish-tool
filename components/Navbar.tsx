import { MaterialIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { HapticPressable } from "@/components/HapticPressable";
import { SettingsIcon } from "@/components/SettingsIcon";
import { StyledText } from "@/components/StyledText";
import { useThemeColors } from "@/hooks/useThemeColors";
import { n } from "@/utils/scaling";

interface NavbarProps {
  currentScreenName: string;
  navigation: BottomTabBarProps["navigation"];
}

export function Navbar({ currentScreenName, navigation }: NavbarProps) {
  const { bg, textColor } = useThemeColors();

  const isOnHistory = currentScreenName === "history";

  return (
    <View style={[styles.navbar, { backgroundColor: bg }]}>
      <HapticPressable onPress={() => router.push("/settings")}>
        <SettingsIcon color={textColor} size={40} />
      </HapticPressable>

      <HapticPressable
        onPress={() => navigation.navigate(isOnHistory ? "index" : "history")}
      >
        <StyledText style={[styles.centerLabel, { color: textColor }]}>
          {isOnHistory ? "view today" : "view logs"}
        </StyledText>
      </HapticPressable>

      <HapticPressable onPress={() => router.push("/search")}>
        <MaterialIcons color={textColor} name="search" size={n(40)} />
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
    fontSize: n(23),
    letterSpacing: n(3),
    textTransform: "uppercase",
  },
});
