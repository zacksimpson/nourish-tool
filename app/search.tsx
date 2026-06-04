import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { TextInput } from "@/components/TextInput";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";

export default function SearchScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";

  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push({ pathname: "/search-results", params: { query: trimmed } });
    }
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header
          headerTitle="Nutrition Lookup"
          rightAction={{
            icon: "search",
            onPress: handleSearch,
            show: query.length > 0,
          }}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            autoFocus
            onChangeText={setQuery}
            onSubmit={handleSearch}
            placeholder="search foods..."
            value={query}
          />
        </View>
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputWrapper: {
    paddingHorizontal: n(28),
    paddingTop: n(48),
  },
});
