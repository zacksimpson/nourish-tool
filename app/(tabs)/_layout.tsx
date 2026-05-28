import { Tabs } from "expo-router";
import { Navbar } from "@/components/Navbar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        const activeScreenName = props.state.routes[props.state.index].name;
        return (
          <Navbar
            currentScreenName={activeScreenName}
            navigation={props.navigation}
          />
        );
      }}
    >
      <Tabs.Screen name="index" options={{ header: () => null }} />
      <Tabs.Screen name="history" options={{ header: () => null }} />
    </Tabs>
  );
}
