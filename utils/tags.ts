export const POSITIVE_TAGS = [
  { id: "stayed-hydrated", label: "stayed hydrated" },
  { id: "ate-on-time", label: "ate on time" },
  { id: "slept-well", label: "slept well" },
  { id: "exercised", label: "exercised" },
  { id: "peaceful", label: "peaceful" },
  { id: "low-stress", label: "low stress" },
  { id: "well-rested", label: "well rested" },
  { id: "good-energy", label: "good energy" },
] as const;

export const CONTEXT_TAGS = [
  { id: "tired", label: "tired" },
  { id: "sick", label: "sick" },
  { id: "sore", label: "sore" },
  { id: "restless", label: "restless" },
  { id: "stressed", label: "stressed" },
  { id: "anxious", label: "anxious" },
  { id: "low-mood", label: "low mood" },
  { id: "overwhelmed", label: "overwhelmed" },
  { id: "social-eating", label: "social eating" },
  { id: "traveling", label: "traveling" },
  { id: "busy-day", label: "busy day" },
  { id: "worked-late", label: "worked late" },
  { id: "ate-out", label: "ate out" },
  { id: "skipped-meal", label: "skipped a meal" },
  { id: "ate-fast", label: "ate fast" },
  { id: "late-night-eating", label: "late night eating" },
] as const;

export const ALL_TAGS = [...POSITIVE_TAGS, ...CONTEXT_TAGS] as const;

export type TagId = (typeof ALL_TAGS)[number]["id"];

export function getTagLabel(id: string): string {
  return ALL_TAGS.find((t) => t.id === id)?.label ?? id;
}
