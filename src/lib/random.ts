/** Returns a new array in random order (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Returns `count` distinct random items. */
export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

/** Returns a random item, avoiding `previous` when there is any other choice. */
export function pickRandom<T>(items: readonly T[], previous?: T): T {
  const pool = items.length > 1 ? items.filter((item) => item !== previous) : items;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
