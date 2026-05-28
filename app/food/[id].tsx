import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

const NUTRIENTS = [
  { id: 1008, label: "Calories", unit: "kcal" },
  { id: 1003, label: "Protein", unit: "g" },
  { id: 1004, label: "Fat", unit: "g" },
  { id: 1005, label: "Carbs", unit: "g" },
] as const;

interface FoodNutrient {
  amount: number;
  nutrient: { id: number };
}

interface FoodDetail {
  foodNutrients: FoodNutrient[];
  householdServingFullText?: string;
  servingSize?: number;
  servingSizeUnit?: string;
}

type Status = "loading" | "success" | "error";

export default function FoodDetailScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const [status, setStatus] = useState<Status>("loading");
  const [nutrients, setNutrients] = useState<FoodNutrient[]>([]);
  const [servingScale, setServingScale] = useState<number>(1);
  const [servingLabel, setServingLabel] = useState<string>("100g");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    const apiKey =
      (Constants.expoConfig?.extra?.usdaApiKey as string | undefined) ?? "";
    const url = `${USDA_BASE}/food/${id}?api_key=${apiKey}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not found");
        }
        return res.json() as Promise<FoodDetail>;
      })
      .then((data) => {
        setNutrients(data.foodNutrients ?? []);

        if (data.servingSize && data.servingSize > 0) {
          setServingScale(data.servingSize / 100);
          if (data.householdServingFullText) {
            setServingLabel(data.householdServingFullText.toLowerCase());
          } else {
            setServingLabel(
              `${Math.round(data.servingSize)}${data.servingSizeUnit ?? "g"}`
            );
          }
        }

        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [id]);

  const getNutrientAmount = (nutrientId: number): number | null => {
    const match = nutrients.find((n) => n.nutrient.id === nutrientId);
    return match ? match.amount : null;
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
      <View style={styles.content}>
        <StyledText style={[styles.perLabel, { color: textColor }]}>
          per {servingLabel}
        </StyledText>
        {NUTRIENTS.map((nutrient) => {
          const amount = getNutrientAmount(nutrient.id);
          const display =
            amount === null
              ? "—"
              : `${Math.round(amount * servingScale)} ${nutrient.unit}`;
          return (
            <StyledText
              key={nutrient.id}
              style={[styles.nutrientLine, { color: textColor }]}
            >
              {nutrient.label} – {display}
            </StyledText>
          );
        })}
      </View>
    );
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle={name} />
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
  content: {
    paddingHorizontal: n(22),
    paddingTop: n(24),
    gap: n(16),
  },
  perLabel: {
    fontSize: n(13),
    letterSpacing: n(1.5),
    textTransform: "uppercase",
    marginBottom: n(4),
  },
  nutrientLine: {
    fontSize: n(22),
  },
});
