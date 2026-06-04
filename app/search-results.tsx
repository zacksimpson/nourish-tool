import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface FoodResult {
  brandOwner?: string;
  dataType: string;
  description: string;
  fdcId: number;
  foodCategory?: string;
}

type Status = "loading" | "success" | "error" | "empty";

export default function SearchResultsScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { query } = useLocalSearchParams<{ query: string }>();

  const [status, setStatus] = useState<Status>("loading");
  const [results, setResults] = useState<FoodResult[]>([]);

  useEffect(() => {
    if (!query) {
      setStatus("empty");
      return;
    }

    const apiKey =
      (Constants.expoConfig?.extra?.usdaApiKey as string | undefined) ?? "";
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&dataType=SR+Legacy,Branded&pageSize=25&api_key=${apiKey}`;

    setStatus("loading");

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Search failed");
        }
        return res.json() as Promise<{ foods: FoodResult[] }>;
      })
      .then((data) => {
        if (data.foods.length === 0) {
          setStatus("empty");
        } else {
          const seen = new Set<string>();
          const deduped = data.foods.filter((food) => {
            const key = food.description.toLowerCase();
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          });
          const sorted = [...deduped].sort((a, b) => {
            if (a.dataType === "SR Legacy" && b.dataType !== "SR Legacy") {
              return -1;
            }
            if (a.dataType !== "SR Legacy" && b.dataType === "SR Legacy") {
              return 1;
            }
            return 0;
          });
          setResults(sorted);
          setStatus("success");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [query]);

  const handleSelectFood = (food: FoodResult) => {
    router.push({
      pathname: "/food/[id]",
      params: { id: String(food.fdcId), name: toTitleCase(food.description) },
    });
  };

  const renderBody = () => {
    if (status === "loading") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            searching...
          </StyledText>
        </View>
      );
    }

    if (status === "error") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            something went wrong
          </StyledText>
        </View>
      );
    }

    if (status === "empty") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            no results
          </StyledText>
        </View>
      );
    }

    return (
      <ScrollViewWithIndicator textColor={textColor}>
        {results.map((food) => (
          <HapticPressable
            key={food.fdcId}
            onPress={() => handleSelectFood(food)}
            style={styles.row}
          >
            <StyledText
              numberOfLines={1}
              style={[styles.foodName, { color: textColor }]}
            >
              {toTitleCase(food.description)}
            </StyledText>
            <StyledText
              numberOfLines={1}
              style={[styles.foodCategory, { color: textColor }]}
            >
              {food.brandOwner ?? food.foodCategory ?? food.dataType}
            </StyledText>
          </HapticPressable>
        ))}
        <View style={styles.bottomPad} />
      </ScrollViewWithIndicator>
    );
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle={query} />
        {renderBody()}
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stateContainer: {
    paddingHorizontal: n(22),
    paddingTop: n(32),
  },
  stateText: {
    fontSize: n(22),
  },
  row: {
    paddingHorizontal: n(22),
    paddingVertical: n(16),
  },
  foodName: {
    fontSize: n(22),
  },
  foodCategory: {
    fontSize: n(16),
    marginTop: n(3),
  },
  bottomPad: {
    height: n(40),
  },
});
