const BASE = "https://us.openfoodfacts.org";
const SEARCH_FIELDS = "code,product_name,brands,serving_size,serving_quantity";
const DETAIL_FIELDS =
  "product_name,brands,nutriments,serving_size,serving_quantity";

// OFF requires a descriptive User-Agent to avoid rate-limiting
const HEADERS = {
  "User-Agent": "Nourish/1.0 (Android; github.com/zacksimpson/nourish-tool)",
};

export function searchUrl(query: string): string {
  return `${BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=25&fields=${SEARCH_FIELDS}&sort_by=unique_scans_n&lc=en`;
}

export function foodDetailUrl(id: string): string {
  return `${BASE}/api/v2/product/${id}.json?fields=${DETAIL_FIELDS}`;
}

export async function offFetch(url: string): Promise<Response> {
  const retryDelays = [500, 1000, 1500];
  let res = await fetch(url, { headers: HEADERS });
  for (const delay of retryDelays) {
    if (res.status !== 503) {
      break;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    res = await fetch(url, { headers: HEADERS });
  }
  return res;
}
