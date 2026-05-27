import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

export default function LogScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: bg }]}>
      <Header headerTitle="Nourish" hideBackButton />
      <View style={styles.empty}>
        <StyledText style={styles.emptyText}>no entries yet</StyledText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: n(20), opacity: 0.4 },
});