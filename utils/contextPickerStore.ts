/**
 * Module-level store for passing tag selection between the log screen
 * and the context picker. The log screen writes before pushing; the
 * picker reads initial state and commits changes; the log screen
 * consumes the result when it regains focus.
 */

let initialTags: string[] = [];
let pendingResult: string[] | null = null;

export function openPicker(currentTags: string[]): void {
  initialTags = [...currentTags];
  pendingResult = null;
}

export function getInitialTags(): string[] {
  return initialTags;
}

export function commitResult(tags: string[]): void {
  pendingResult = tags;
}

export function consumeResult(): string[] | null {
  const result = pendingResult;
  pendingResult = null;
  return result;
}
