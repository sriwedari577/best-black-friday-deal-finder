// HTML for the list and detail pages, built from the deal data. Every value
// that comes from data is escaped before it goes into the page. Prices are
// formatted once, here, so the list and the detail page can never disagree.

import { percentOff, saving } from "./filters.js";

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const VERDICT_LABEL = {
  "new-low": "New low",
  strong: "Strong price",
  routine: "Routine sale",
  inflated: "Inflated sale",
};

export function checkedLine(deal) {
  const when = new Date(deal.checked).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `Checked ${when} UTC · Read in: ${escape(deal.source)}`;
}

function verdictBadge(deal) {
  return `<span class="badge badge-${deal.verdict}">${VERDICT_LABEL[deal.verdict]}</span>`;
}

export function dealCard(deal) {
  return `<article class="card">
  <p class="eyebrow">${escape(deal.category)} · ${escape(deal.store)}</p>
  <h2><a href="#/deal/${encodeURIComponent(deal.id)}">${escape(deal.title)}</a></h2>
  <p class="price-row"><span class="price">${usd(deal.price)}</span> <s class="was">${usd(deal.was)}</s> <span class="off">${percentOff(deal)}% off</span></p>
  <p class="save-line">You save ${usd(saving(deal))}</p>
  <p class="verdict-row">${verdictBadge(deal)}</p>
  <p class="evidence">${escape(deal.evidence)}</p>
  <p class="checked">${checkedLine(deal)}</p>
  <p class="card-actions"><a class="button" href="${escape(deal.url)}" target="_blank" rel="noopener">View at ${escape(deal.store)} ↗</a> <a class="button ghost" href="#/deal/${encodeURIComponent(deal.id)}">Details</a></p>
</article>`;
}

export function listPage(deals, state, categories, stores) {
  const categoryOptions = ["All", ...categories]
    .map((c) => `<option value="${escape(c)}"${state.category === c ? " selected" : ""}>${escape(c)}</option>`)
    .join("");
  const storeOptions = ["All", ...stores]
    .map((s) => `<option value="${escape(s)}"${state.store === s ? " selected" : ""}>${escape(s)}</option>`)
    .join("");
  const cards = deals.length === 0
    ? `<p class="empty">No deal matches those filters. <button type="button" class="link-button" id="clear-filters">Clear the filters</button> to see all ${state.total} deals.</p>`
    : deals.map(dealCard).join("");
  return `<section class="intro">
  <h1>Black Friday deals, checked today</h1>
  <p class="lede">${state.total} real deals, each read at its store or in a deals source naming the store on 27 November 2026. Every card shows the sale price, the usual price, the discount, when the price was checked, where it was read, and an honest verdict on whether it is really a deal.</p>
  <p class="legend"><span class="badge badge-new-low">New low</span> lowest price tracked · <span class="badge badge-strong">Strong price</span> genuinely good · <span class="badge badge-routine">Routine sale</span> ordinary cut · <span class="badge badge-inflated">Inflated sale</span> not really a bargain (none graded inflated).</p>
</section>
<form class="controls" id="controls">
  <label class="search-label">Search deals <input id="q" type="search" value="${escape(state.query)}" placeholder="Try “headphones”, “TV”, “LEGO”…"></label>
  <label>Category <select id="category">${categoryOptions}</select></label>
  <label>Store <select id="store">${storeOptions}</select></label>
  <label>Discount <select id="minoff">
    <option value="0"${state.minOff === 0 ? " selected" : ""}>Any discount</option>
    <option value="25"${state.minOff === 25 ? " selected" : ""}>25% off or more</option>
    <option value="40"${state.minOff === 40 ? " selected" : ""}>40% off or more</option>
    <option value="50"${state.minOff === 50 ? " selected" : ""}>50% off or more</option>
  </select></label>
  <label>Verdict <select id="verdict">
    <option value="All"${state.verdict === "All" ? " selected" : ""}>Any verdict</option>
    <option value="new-low"${state.verdict === "new-low" ? " selected" : ""}>New low only</option>
    <option value="strong"${state.verdict === "strong" ? " selected" : ""}>Strong price only</option>
    <option value="routine"${state.verdict === "routine" ? " selected" : ""}>Routine sale only</option>
  </select></label>
  <label>Sort <select id="sort">
    <option value="verdict"${state.sort === "verdict" ? " selected" : ""}>Best verdict first</option>
    <option value="discount"${state.sort === "discount" ? " selected" : ""}>Biggest discount</option>
    <option value="price"${state.sort === "price" ? " selected" : ""}>Lowest price</option>
    <option value="saving"${state.sort === "saving" ? " selected" : ""}>Biggest saving ($)</option>
  </select></label>
</form>
<p class="count" id="count" aria-live="polite">Showing ${deals.length} of ${state.total} deals</p>
<div class="grid">${cards}</div>`;
}

export function dealPage(deal, related) {
  const relatedCards = related.length === 0 ? "" : `<h2>More ${escape(deal.category)} deals</h2><div class="grid">${related.map(dealCard).join("")}</div>`;
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <p class="eyebrow">${escape(deal.category)} · ${escape(deal.store)}</p>
  <h1>${escape(deal.title)}</h1>
  <p class="price-row big"><span class="price">${usd(deal.price)}</span> <s class="was">${usd(deal.was)}</s> <span class="off">${percentOff(deal)}% off</span></p>
  <p class="save-line">You save ${usd(saving(deal))} against the usual price of ${usd(deal.was)}.</p>
  <p class="verdict-row">${verdictBadge(deal)}</p>
  <h2>Is it really a deal?</h2>
  <p>${escape(deal.evidence)}</p>
  ${deal.note ? `<p class="condition">Good to know: ${escape(deal.note)}</p>` : ""}
  <h2>Price check</h2>
  <dl class="facts">
    <dt>Store</dt><dd>${escape(deal.store)}</dd>
    <dt>Checked</dt><dd>${checkedLine(deal)}</dd>
    <dt>Source page</dt><dd><a href="${escape(deal.sourceUrl)}" target="_blank" rel="noopener">${escape(deal.source)}</a></dd>
  </dl>
  <p><a class="button big-button" href="${escape(deal.url)}" target="_blank" rel="noopener">View it at ${escape(deal.store)} ↗</a></p>
  <p class="fineprint">Prices move fast on Black Friday. Confirm the price at the store before you buy — the check time above is when this price was read.</p>
</article>
${relatedCards}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
