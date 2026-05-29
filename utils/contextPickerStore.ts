let pendingResult: string[] | null = null;

export function commitResult(tags: string[]): void {
  pendingResult = tags;
}

export function consumeResult(): string[] | null {
  const result = pendingResult;
  pendingResult = null;
  return result;
}
