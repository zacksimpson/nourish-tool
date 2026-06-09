import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import { foodDetailUrl, offFetch } from "@/utils/offApi";
import { n } from "@/utils/scaling";
import { consumeServingCount } from "@/utils/servingCounterStore";

// OFF stores sodium and caffeine in g/100g; display wants mg
const NUTRIENTS = [
  { key: "energy-kcal_100g", label: "Calories", unit: "kcal", mult: 1 },
  { key: "proteins_100g", label: "Protein", unit: "g", mult: 1 },
  { key: "carbohydrates_100g", label: "Carbs", unit: "g", mult: 1 },
  { key: "fat_100g", label: "Fat", unit: "g", mult: 1 },
  { key: "fiber_100g", label: "Fiber", unit: "g", mult: 1 },
  { key: "sugars-added_100g", label: "Added Sugar", unit: "g", mult: 1 },
  { key: "sodium_100g", label: "Sodium", unit: "mg", mult: 1000 },
  { key: "water_100g", label: "Water", unit: "g", mult: 1 },
  { key: "caffeine_100g", label: "Caffeine", unit: "mg", mult: 1000 },
] as const;

interface Nutriments {
  [key: string]: number | undefined;
}

interface FoodDetail {
  nutriments: Nutriments;
  serving_quantity?: number;
  serving_size?: string;
}

interface OFFResponse {
  product: FoodDetail;
  status: number;
}

type Status = "loading" | "success" | "error";

function roundTo1(n: number): number {
  return Number.parseFloat(n.toFixed(1));
}

function cleanServingLabel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\d+\.\d+/g, (m) => String(roundTo1(Number.parseFloat(m))));
}

function resolveServing(data: FoodDetail): { scale: number; label: string } {
  if (data.serving_quantity && data.serving_quantity > 0) {
    const label = data.serving_size
      ? cleanServingLabel(data.serving_size)
      : `${roundTo1(data.serving_quantity)}g`;
    return { label, scale: data.serving_quantity / 100 };
  }
  return { label: "100g", scale: 1 };
}

export default function FoodDetailScreen() {
  const { bg, textColor } = useThemeColors();

  const { id, name, category } = useLocalSearchParams<{
    id: string;
    name: string;
    category: string;
  }>();

  const [status, setStatus] = useState<Status>("loading");
  const [nutriments, setNutriments] = useState<Nutriments>({});
  const [servingScale, setServingScale] = useState<number>(1);
  const [servingLabel, setServingLabel] = useState<string>("100g");
  const [servingCount, setServingCount] = useState(1);

  useFocusEffect(
    useCallback(() => {
      const count = consumeServingCount();
      if (count !== null) {
        setServingCount(count);
      }
    }, [])
  );

  useEffect(() => {
    setServingCount(1);

    if (!id) {
      setStatus("error");
      return;
    }

    const url = foodDetailUrl(id);

    offFetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Not found: ${res.status}`);
        }
        return res.json() as Promise<OFFResponse>;
      })
      .then((data) => {
        if (data.status !== 1 || !data.product) {
          throw new Error("Not found");
        }
        setNutriments(data.product.nutriments ?? {});
        const { scale, label } = resolveServing(data.product);
        setServingScale(scale);
        setServingLabel(label);
        setStatus("success");
      })
      .catch((err) => {
        console.error("OFF detail error:", err);
        setStatus("error");
      });
  }, [id]);

  const getNutrientAmount = (key: string): number | null => {
    const val = nutriments[key];
    return typeof val === "number" ? val : null;
  };

  const renderBody = () => {
    if (status === "loading") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            loading...
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

    return (
      <ScrollViewWithIndicator textColor={textColor}>
        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <StyledText style={[styles.titleName, { color: textColor }]}>
              {name}
            </StyledText>
            {category ? (
              <StyledText style={[styles.titleCategory, { color: textColor }]}>
                {category}
              </StyledText>
            ) : null}
          </View>
          <StyledText style={[styles.servingInfo, { color: textColor }]}>
            {servingCount} {servingCount === 1 ? "serving" : "servings"} ·{" "}
            {servingLabel} each
          </StyledText>
          {NUTRIENTS.map((nutrient) => {
            const amount = getNutrientAmount(nutrient.key);
            if (amount === null) {
              return null;
            }
            const display = `${roundTo1(amount * servingScale * servingCount * nutrient.mult)} ${nutrient.unit}`;
            return (
              <StyledText
                key={nutrient.key}
                style={[styles.nutrientLine, { color: textColor }]}
              >
                {nutrient.label} – {display}
              </StyledText>
            );
          })}
        </View>
      </ScrollViewWithIndicator>
    );
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header />
        {renderBody()}
        {status === "success" && (
          <View style={styles.footer}>
            <HapticPressable
              onPress={() => router.push("/serving-counter")}
              style={styles.footerBtn}
            >
              <StyledText style={[styles.footerLabel, { color: textColor }]}>
                SERVINGS
              </StyledText>
            </HapticPressable>
          </View>
        )}
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
  content: {
    paddingLeft: n(22),
    paddingRight: n(32),
    paddingTop: n(24),
    paddingBottom: n(40),
    gap: n(16),
  },
  titleBlock: {
    gap: n(2),
  },
  titleName: {
    fontSize: n(28),
  },
  titleCategory: {
    fontSize: n(18),
  },
  servingInfo: {
    fontSize: n(22),
    marginBottom: n(4),
  },
  nutrientLine: {
    fontSize: n(22),
  },
  footer: {
    alignItems: "center",
    paddingVertical: n(14),
  },
  footerBtn: {
    padding: n(8),
  },
  footerLabel: {
    fontSize: n(23),
    letterSpacing: n(3),
    textTransform: "uppercase",
  },
});
