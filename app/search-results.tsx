import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import { offFetch, searchUrl } from "@/utils/offApi";
import { n } from "@/utils/scaling";

interface FoodResult {
  brands?: string;
  code: string;
  product_name?: string;
}

type Status = "loading" | "success" | "error" | "empty";

function processResults(products: FoodResult[]): FoodResult[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const name = p.product_name?.trim();
    if (!name) {
      return false;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default function SearchResultsScreen() {
  const { bg, textColor } = useThemeColors();

  const { query } = useLocalSearchParams<{ query: string }>();

  const [status, setStatus] = useState<Status>("loading");
  const [results, setResults] = useState<FoodResult[]>([]);

  useEffect(() => {
    if (!query) {
      setStatus("empty");
      return;
    }

    const url = searchUrl(query);

    setStatus("loading");

    offFetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        return res.json() as Promise<{ products: FoodResult[] }>;
      })
      .then((data) => {
        const processed = processResults(data.products ?? []);
        if (processed.length === 0) {
          setStatus("empty");
        } else {
          setResults(processed);
          setStatus("success");
        }
      })
      .catch((err) => {
        console.error("OFF search error:", err);
        setStatus("error");
      });
  }, [query]);

  const handleSelectFood = (food: FoodResult) => {
    router.push({
      pathname: "/food/[id]",
      params: {
        id: food.code,
        name: food.product_name ?? "",
        category: food.brands ?? "",
      },
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
            key={food.code}
            onPress={() => handleSelectFood(food)}
            style={styles.row}
          >
            <StyledText
              numberOfLines={1}
              style={[styles.foodName, { color: textColor }]}
            >
              {food.product_name}
            </StyledText>
            {food.brands ? (
              <StyledText
                numberOfLines={1}
                style={[styles.foodCategory, { color: textColor }]}
              >
                {food.brands}
              </StyledText>
            ) : null}
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
    paddingLeft: n(22),
    paddingRight: n(32),
    paddingTop: n(32),
  },
  stateText: {
    fontSize: n(22),
  },
  row: {
    paddingLeft: n(22),
    paddingRight: n(32),
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
