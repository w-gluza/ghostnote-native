export const ALL_CATEGORIES = "All";

type Filterable = { name: string; category: string };

export function categoryOptions(rudiments: Filterable[]) {
  return [
    ALL_CATEGORIES,
    ...new Set(rudiments.map((rudiment) => rudiment.category)),
  ];
}

export function filterRudiments<Item extends Filterable>(
  rudiments: Item[],
  category: string,
  query: string,
) {
  const term = query.trim().toLowerCase();
  return rudiments.filter(
    (rudiment) =>
      (category === ALL_CATEGORIES || rudiment.category === category) &&
      (term === "" || rudiment.name.toLowerCase().includes(term)),
  );
}
