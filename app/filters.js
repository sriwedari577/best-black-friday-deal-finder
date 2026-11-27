// Filtering and sorting for the deal list. Every function here is pure: it takes
// the deal array and a filter state and returns a new array, so the list, the
// count line and the detail page's related deals all agree.

export const VERDICT_RANK = { "new-low": 0, strong: 1, routine: 2, inflated: 3 };

export function percentOff(deal) {
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function saving(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

export function applyFilters(deals, state) {
  const q = state.query.trim().toLowerCase();
  return deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (state.minOff > 0 && percentOff(d) < state.minOff) return false;
    if (state.verdict !== "All" && d.verdict !== state.verdict) return false;
    return true;
  });
}

export function sortDeals(deals, sort) {
  const list = [...deals];
  if (sort === "discount") return list.sort((a, b) => percentOff(b) - percentOff(a) || saving(b) - saving(a));
  if (sort === "price") return list.sort((a, b) => a.price - b.price);
  if (sort === "saving") return list.sort((a, b) => saving(b) - saving(a));
  // "verdict": best verdict first, then biggest discount within a verdict.
  return list.sort(
    (a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || percentOff(b) - percentOff(a),
  );
}

export function filterAndSort(deals, state) {
  return sortDeals(applyFilters(deals, state), state.sort);
}

export function defaultState() {
  return { query: "", category: "All", store: "All", minOff: 0, verdict: "All", sort: "verdict" };
}
