/** "HH:MM" 24h → "h:mm AM/PM" */
export function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = Number.parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}

/** TimePicker digits + ampm → "HH:MM" 24h for storage */
export function digitsToTime(digits: string, ampm: "AM" | "PM"): string {
  let h: number;
  let m: string;
  if (digits.length === 3) {
    h = Number.parseInt(digits[0], 10);
    m = digits.slice(1);
  } else {
    h = Number.parseInt(digits.slice(0, 2), 10);
    m = digits.slice(2, 4);
  }
  if (ampm === "PM" && h !== 12) {
    h += 12;
  }
  if (ampm === "AM" && h === 12) {
    h = 0;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
}

/** "HH:MM" 24h → TimePicker { digits, ampm } */
export function timeToDisplayParts(time24: string): {
  digits: string;
  ampm: "AM" | "PM";
} {
  const [hStr, mStr] = time24.split(":");
  let h = Number.parseInt(hStr, 10);
  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  if (h > 12) {
    h -= 12;
  }
  if (h === 0) {
    h = 12;
  }
  return { digits: `${String(h).padStart(2, "0")}${mStr}`, ampm };
}
