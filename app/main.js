// Friday Finder: hash routing and live filtering. Routes: #/ is the deal list,
// #/deal/<id> is one deal, #/filter/<Category> is the list with that category
// pre-selected, #/compare compares the same product across stores, and
// #/deal-of-the-day is the list with the Deal of the Day hero on top. Filter controls re-render the list in place, so search, the
// category/store/discount/verdict filters and sorting all work without a reload.
// window.__shotReady is true once the current page is on screen.

import { CATEGORIES, DEALS, STORES } from "./data.js";
import { defaultState, filterAndSort } from "./filters.js";
import { dealPage, listPage, missingPage, comparePage, heroPage } from "./views.js";

const app = document.getElementById("app");
const state = defaultState();

function renderHero() {
  const shown = filterAndSort(DEALS, state);
  document.title = "Deal of the Day — MacBook Air compared across stores | Friday Finder";
  app.innerHTML = heroPage(shown, { ...state, total: DEALS.length }, CATEGORIES, STORES);
  wireListControls();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function renderList() {
  const shown = filterAndSort(DEALS, state);
  document.title = "Friday Finder — Black Friday deals checked today";
  app.innerHTML = listPage(shown, { ...state, total: DEALS.length }, CATEGORIES, STORES);
  wireListControls();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wireListControls() {
  const form = app.querySelector("#controls");
  const queryInput = app.querySelector("#q");
  const rerender = () => {
    state.query = queryInput.value;
    state.category = form.querySelector("#category").value;
    state.store = form.querySelector("#store").value;
    state.minOff = Number(form.querySelector("#minoff").value);
    state.verdict = form.querySelector("#verdict").value;
    state.sort = form.querySelector("#sort").value;
    const next = filterAndSort(DEALS, state);
    const grid = app.querySelector(".grid");
    const count = app.querySelector("#count");
    // Rebuild only the results, keeping the controls (and focus) in place.
    const fresh = listPage(next, { ...state, total: DEALS.length }, CATEGORIES, STORES);
    const temp = document.createElement("div");
    temp.innerHTML = fresh;
    grid.outerHTML = temp.querySelector(".grid").outerHTML;
    count.textContent = `Showing ${next.length} of ${DEALS.length} deals`;
    // The empty-results button lives inside the rebuilt grid, so wire it
    // here too, not only in the full render below.
    const clearFilters = app.querySelector("#clear-filters");
    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        Object.assign(state, defaultState());
        renderList();
      });
    }
  };
  form.addEventListener("submit", (event) => event.preventDefault());
  queryInput.addEventListener("input", rerender);
  form.querySelectorAll("select").forEach((select) => select.addEventListener("change", rerender));
  const clearFilters = app.querySelector("#clear-filters");
  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      Object.assign(state, defaultState());
      renderList();
    });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function renderDetail(id) {
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) {
    document.title = "Deal not found | Friday Finder";
    app.innerHTML = missingPage();
  } else {
    document.title = `${deal.title} | Friday Finder`;
    const related = DEALS.filter((d) => d.category === deal.category && d.id !== deal.id).slice(0, 3);
    app.innerHTML = dealPage(deal, related);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || "#/";
  if (hash === "#/deal-of-the-day") {
    Object.assign(state, defaultState());
    renderHero();
    return;
  }
  if (hash.startsWith("#/compare")) {
    document.title = "Compare prices across stores | Friday Finder";
    app.innerHTML = comparePage();
    window.scrollTo(0, 0);
    window.__shotReady = true;
    return;
  }
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    renderDetail(decodeURIComponent(dealMatch[1]));
    return;
  }
  const filterMatch = hash.match(/^#\/filter\/(.+)/);
  if (filterMatch) {
    const wanted = decodeURIComponent(filterMatch[1]);
    Object.assign(state, defaultState());
    state.category = CATEGORIES.includes(wanted) ? wanted : "All";
  } else {
    // Plain "#/" is the full list: reset every filter, so "All deals" links
    // (including the empty-results link) really show all deals again.
    Object.assign(state, defaultState());
  }
  renderList();
}

window.addEventListener("hashchange", render);

// A "#/" link (brand, "All deals") does nothing on its own when the hash is
// already "#/", so reset the filters and re-render the full list in that case;
// when the hash actually changes, the hashchange handler above does the reset.
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#/"]');
  if (!link) return;
  if ((location.hash || "#/") === "#/") {
    event.preventDefault();
    Object.assign(state, defaultState());
    renderList();
  }
});
render();
