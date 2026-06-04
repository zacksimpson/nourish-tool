import Constants from "expo-constants";

const BASE = "https://api.nal.usda.gov/fdc/v1";

function getApiKey(): string {
  return (Constants.expoConfig?.extra?.usdaApiKey as string | undefined) ?? "";
}

export function searchUrl(query: string): string {
  return `${BASE}/foods/search?query=${encodeURIComponent(query)}&dataType=SR+Legacy,Branded&pageSize=25&api_key=${getApiKey()}`;
}

export function foodDetailUrl(id: string): string {
  return `${BASE}/food/${id}?api_key=${getApiKey()}`;
}
