import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import {
  scrollIndicatorBaseStyles,
  useScrollIndicator,
} from "@/hooks/useScrollIndicator";
import { n } from "@/utils/scaling";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

interface FoodResult {
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

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  const [status, setStatus] = useState<Status>("loading");
  const [results, setResults] = useState<FoodResult[]>([]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  useEffect(() => {
    if (!query) {
      setStatus("empty");
      return;
    }

    const apiKey =
      (Constants.expoConfig?.extra?.usdaApiKey as string | undefined) ?? "";
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&dataType=Foundation,SR+Legacy&pageSize=25&api_key=${apiKey}`;

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
          setResults(data.foods);
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
      params: { id: String(food.fdcId), name: food.description },
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
      <View style={styles.scrollWrapper}>
        <Animated.ScrollView
          onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
          onScroll={handleScroll}
          overScrollMode="never"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
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
                  {food.description}
                </StyledText>
                <StyledText
                  numberOfLines={1}
                  style={[styles.foodCategory, { color: textColor }]}
                >
                  {food.foodCategory ?? food.dataType}
                </StyledText>
              </HapticPressable>
            ))}
            <View style={styles.bottomPad} />
          </View>
        </Animated.ScrollView>

        {scrollIndicatorHeight > 0 && (
          <View style={[styles.scrollTrack, { backgroundColor: textColor }]}>
            <Animated.View
              style={[
                styles.scrollThumb,
                {
                  backgroundColor: textColor,
                  height: scrollIndicatorHeight,
                  transform: [{ translateY: scrollIndicatorPosition }],
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
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
  scrollWrapper: { flex: 1, flexDirection: "row", position: "relative" },
  scrollTrack: scrollIndicatorBaseStyles.track,
  scrollThumb: scrollIndicatorBaseStyles.thumb,
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
