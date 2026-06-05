# Nourish Tool — Claude Project Context

## Project Overview
A LightOS meal check-in app for the **Light Phone III**. Built as a native Android app using React Native / Expo. Android only — no iOS target. Minimal and monochromatic to match the Light Phone aesthetic.

Users log daily meals (breakfast, lunch, dinner, snacks), rate nutrition signals (calories, protein, water, etc.) as on track / roughly / off track, tag contextual factors, and add free-form notes. A calendar history view and OpenFoodFacts nutrition lookup are also included.

**GitHub:** https://github.com/zacksimpson/nourish-tool
**Working directory:** `~/Dev/nourish`
**Primary branch:** `main`

---

## Tech Stack
- **React Native** + **Expo** ~55
- **Expo Router** (file-based routing)
- **TypeScript**
- **Bun** (package manager — use `bun install`, never npm/yarn)
- **AsyncStorage** for all data persistence
- **EAS Build** for production APKs
- **Biome / Ultracite** for linting (`bun run check` / `bun run fix`)
- **PublicSans-Regular** font throughout

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Daily log screen — today's meal entry |
| `app/(tabs)/history.tsx` | Calendar view for browsing past entries |
| `app/entry/[date].tsx` | View/edit a past entry, swipe left/right between days |
| `app/context-picker.tsx` | Tag selector for context (stress, traveling, etc.) |
| `app/search.tsx` | OpenFoodFacts nutrition lookup search input |
| `app/search-results.tsx` | OpenFoodFacts search results list |
| `app/food/[id].tsx` | Food detail with serving size calculator |
| `app/settings/index.tsx` | Settings screen |
| `app/settings/signals.tsx` | Enable/disable nutrition focus signals, set targets |
| `app/settings/notifications.tsx` | Daily reminder notification settings |
| `components/EntryForm.tsx` | Shared meal entry form (used by index + [date]) |
| `components/ScrollViewWithIndicator.tsx` | Scroll view with custom indicator |
| `components/Header.tsx` | App header with back/action buttons |
| `contexts/NourishContext.tsx` | All app data — entries, signals, targets + persistence |
| `contexts/NotificationsContext.tsx` | Notification enabled/reminder state + persistence |
| `hooks/useScrollIndicator.ts` | Custom scroll indicator logic |
| `hooks/useThemeColors.ts` | Returns `{ bg, textColor }` based on invert state |
| `utils/formatDate.ts` | `formatDateShort()` and `todayDateString()` |
| `utils/navigation.ts` | `goBack()` — use instead of inline router.canGoBack/back |
| `utils/offApi.ts` | OpenFoodFacts API — `searchUrl()`, `foodDetailUrl()`, `offFetch()` |
| `utils/servingCounterStore.ts` | Module-level store for passing serving count from food detail |
| `utils/notifTime.ts` | Notification time helpers — `formatTime()`, `digitsToTime()`, etc. |
| `utils/tags.ts` | Tag definitions — `POSITIVE_TAGS`, `CONTEXT_TAGS`, `ALL_TAGS` |
| `utils/contextPickerStore.ts` | Module-level store for passing tag picker results back |

---

## Data Model

### Entry
```ts
{
  date: string;        // "YYYY-MM-DD"
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  signals: Record<string, "on track" | "roughly" | "off track" | null>;
  tags: string[];      // TagId values
  note: string;
  savedAt: number;     // Date.now()
}
```
Entries are stored in AsyncStorage as `entry:YYYY-MM-DD`.

### Signals
Defined in `NourishContext.tsx` as `SIGNAL_OPTIONS`. Users enable up to 3 at a time. Available signals: calories, protein, carbs, fat, water, fiber, sodium, added-sugar, caffeine. Units defined in `app/settings/signals.tsx` as `SIGNAL_UNITS`. The settings screen labels this "Nutrition Focus".

### Tags
Two groups in `utils/tags.ts`: `POSITIVE_TAGS` (slept well, exercised, etc.) and `CONTEXT_TAGS` (stressed, traveling, etc.). Combined as `ALL_TAGS`.

---

## Design Rules (strict — same as all LightOS tools)

- **No gray** — all text is white on black (or black on white in inverted mode). Never use `dimColor` or any gray-toned color.
- **No dividers** — no `borderBottomWidth`, `borderTopWidth`, or separator Views anywhere.
- **Always use `n()`** for every dimension — padding, margin, font size, border width, icon size.
- **`HapticPressable`** instead of `Pressable` or `TouchableOpacity` everywhere.
- **`allowFontScaling={false}`** on all text and inputs.
- **`overScrollMode="never"`** on all ScrollViews.
- **`cursorColor={textColor}`** and **`selectionColor={textColor}`** on all TextInputs.
- **`paddingLeft: 0`** on TextInput styles to override Android's default offset.
- Standard horizontal padding: `n(28)` on entry/form screens, `n(22)` on most others.

---

## Component Patterns

### Theme Colors
Never derive colors inline. Always use the hook:
```ts
const { bg, textColor } = useThemeColors();
```

### Navigation / Back
Never write inline `router.canGoBack()` / `router.back()`. Use the utility:
```ts
import { goBack } from "@/utils/navigation";
// onSwipeBack={goBack} or onPress={goBack}
```

### Scroll Views
All scrollable screens use `ScrollViewWithIndicator` — never a raw `ScrollView` with the native indicator:
```tsx
<ScrollViewWithIndicator textColor={textColor}>
  {children}
</ScrollViewWithIndicator>
```
Add `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` when the screen has text inputs.

### Entry Form
`EntryForm` is shared between the log screen and entry edit mode. Don't duplicate meal field JSX. Props include all field values + change handlers + `enabledSignals`, `selectedTags`, `signalRatings`, `textColor`.

### Context Picker
The context picker returns selected tags via `contextPickerStore`. Navigate to it with initial tags as URL params:
```ts
router.push({
  pathname: "/context-picker",
  params: { initialTags: Array.from(selectedTags).join(",") },
});
```
Consume the result in `useFocusEffect`:
```ts
useFocusEffect(useCallback(() => {
  const result = consumeResult();
  if (result !== null) setSelectedTags(new Set(result) as Set<TagId>);
}, []));
```

### Dates
Always use `todayDateString()` from `utils/formatDate.ts` — never `new Date().toISOString().slice(0, 10)` which returns UTC and causes wrong-date bugs in negative UTC offsets.

### OpenFoodFacts API
Never inline the base URL or fetch logic. Use `utils/offApi.ts`:
```ts
import { searchUrl, foodDetailUrl, offFetch } from "@/utils/offApi";
const url = searchUrl(query);
const url = foodDetailUrl(id);
const res = await offFetch(url); // handles retry on 503
```

### Preventing Layout Jumps from Conditional Rendering
Use `opacity` + `pointerEvents` instead of conditional rendering when an element affects layout:
```tsx
<View
  pointerEvents={isSelected ? "auto" : "none"}
  style={{ opacity: isSelected ? 1 : 0 }}
>
```

---

## Security

- No API keys are required — OpenFoodFacts is open and keyless.
- The `.jks` keystore file lives in the project root and is gitignored.

---

## Build & Release

### Dev
```bash
bun run dev
```
Requires phone connected via USB with USB debugging enabled.

### EAS Cloud Build (Mac/Linux — preferred)
Triggered by pushing a `v*` tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```
Requires `EXPO_TOKEN` secret in GitHub repo settings.

**EAS credits are limited** — don't push `v*` tags unless intentionally triggering a build.

### Android Keystore
EAS manages the keystore. Re-download anytime: `eas credentials`
Key alias: `d843bc7ac7443220797a05c38f53ba5c`

---

## Do's and Don'ts

### Do
- Use `n()` for every dimension
- Use `HapticPressable` for all interactive elements
- Use `useThemeColors()` for `bg` and `textColor`
- Use `goBack()` from `utils/navigation` for back navigation
- Use `todayDateString()` for today's date string (local time)
- Use `ScrollViewWithIndicator` for all scrollable screens
- Use `offFetch()` from `utils/offApi` for all OpenFoodFacts requests
- Set `allowFontScaling={false}` on all text and inputs
- Set `cursorColor` and `selectionColor` to `textColor` on all TextInputs

### Don't
- Don't use gray or `dimColor` for any visible text or UI
- Don't add dividers or separator Views
- Don't use `new Date().toISOString().slice(0, 10)` for today's date
- Don't inline `router.canGoBack()` / `router.back()` — use `goBack()`
- Don't inline OpenFoodFacts URLs or fetch calls — use `utils/offApi.ts`
- Don't derive `bg`/`textColor` inline — use `useThemeColors()`
- Don't commit the `android/` directory
- Don't commit `.jks`
- Don't push `v*` git tags unless you want to trigger an EAS cloud build
- Don't use raw pixel values — always `n()`
