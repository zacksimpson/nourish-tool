let pending: number | null = null;

export function storeServingCount(count: number): void {
  pending = count;
}

export function consumeServingCount(): number | null {
  const result = pending;
  pending = null;
  return result;
}
