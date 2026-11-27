// HTML for the list and detail pages, built from the deal data. Every value
// that comes from data is escaped before it goes into the page. Prices are
// formatted once, here, so the list and the detail page can never disagree.

import { percentOff, saving } from "./filters.js";
import { COMPARE, DEALS } from "./data.js";

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
  <p class="compare-link"><a href="#/compare">Compare prices: the same product at different stores →</a></p>
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
  const compared = COMPARE.find((c) => c.dealId === deal.id);
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
  ${compared ? `<p class="compare-link"><a href="#/compare">See this product's price at other stores →</a></p>` : ""}
</article>
${relatedCards}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}

export function comparePage() {
  const sections = COMPARE.map((item) => {
    const best = Math.min(...item.rows.map((r) => r.price));
    const rows = item.rows
      .map((row) => {
        const when = new Date(row.checked).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });
        const isBest = row.price === best;
        return `<tr${isBest ? ` class="best-row"` : ""}>
  <td>${escape(row.store)}${isBest ? ` <span class="badge badge-best">Best price</span>` : ""}</td>
  <td class="num">${usd(row.price)}</td>
  <td class="num">${usd(row.was)}</td>
  <td class="num">${usd(row.was - row.price)}</td>
  <td><a href="${escape(row.sourceUrl)}" target="_blank" rel="noopener">${escape(row.source)}</a>, ${when}</td>
  <td><a class="button" href="${escape(row.url)}" target="_blank" rel="noopener">View at ${escape(row.store)} ↗</a></td>
</tr>`;
      })
      .join("");
    return `<section class="compare-block">
  <p class="eyebrow">${escape(item.category)}</p>
  <h2>${escape(item.product)}</h2>
  <table class="compare-table">
    <thead><tr><th>Store</th><th>Sale price</th><th>Usual price</th><th>You save</th><th>Checked · source</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p><a href="#/deal/${encodeURIComponent(item.dealId)}">See the full deal page →</a></p>
</section>`;
  }).join("");
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<section class="intro">
  <h1>Compare the same product across stores</h1>
  <p class="lede">Four products, each checked at more than one store on 27 November 2026. The cheapest price for each product is marked Best price. Prices move fast — confirm at the store before you buy.</p>
</section>
${sections}`;
}

// Deal of the Day: one product with its price side by side at two stores,
// plus a strip of totals computed from the deal data itself, so the numbers
// can never drift from what the finder holds. The hero product is the one
// compared product whose stores genuinely disagree on price (MacBook Air:
// $999 at Amazon, $1,049 at Best Buy); the other compared products are ties
// at every store, so a side-by-side of one of those would show no difference.
export function heroSection() {
  const item = COMPARE.find((c) => c.dealId === "macbook-air-m5-13") ?? COMPARE[0];
  const deal = DEALS.find((d) => d.id === item.dealId);
  const best = Math.min(...item.rows.map((r) => r.price));
  const dearest = item.rows.reduce((a, r) => (r.price > a.price ? r : a), item.rows[0]);
  const cheapest = item.rows.find((r) => r.price === best);
  const spread = Math.round((dearest.price - best) * 100) / 100;
  const totalSaving = DEALS.reduce((sum, d) => sum + saving(d), 0);
  const avgDiscount = DEALS.reduce((sum, d) => sum + percentOff(d), 0) / DEALS.length;
  const newLows = DEALS.filter((d) => d.verdict === "new-low").length;
  const panels = item.rows
    .map((row) => {
      const when = new Date(row.checked).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
      const isBest = row.price === best;
      return `<article class="hero-panel${isBest ? " hero-best" : ""}">
  <p class="hero-store">${escape(row.store)}${isBest ? ` <span class="badge badge-best">Best price</span>` : ""}</p>
  <p class="price-row big"><span class="price">${usd(row.price)}</span> <s class="was">${usd(row.was)}</s> <span class="off">${percentOff(row)}% off</span></p>
  <p class="save-line">You save ${usd(saving(row))}</p>
  <p class="checked">Checked ${when} UTC · Source: <a href="${escape(row.sourceUrl)}" target="_blank" rel="noopener">${escape(row.source)}</a></p>
  <p class="card-actions"><a class="button" href="${escape(row.url)}" target="_blank" rel="noopener">View at ${escape(row.store)} ↗</a></p>
</article>`;
    })
    .join("");
  return `<section class="hero">
  <p class="eyebrow">Deal of the Day · The same product at two stores</p>
  <h1>${escape(item.product)}</h1>
  <p class="hero-sub">Checked at ${item.rows.length} stores on 27 November 2026. ${escape(cheapest.store)} is ${usd(spread)} cheaper than ${escape(dearest.store)}.</p>
  <div class="hero-panels">${panels}</div>
  <p class="hero-evidence">${verdictBadge(deal)} — ${escape(deal.evidence)}</p>
  <dl class="hero-stats">
    <div class="stat"><dt>Deals checked</dt><dd>${DEALS.length}</dd></div>
    <div class="stat"><dt>Combined savings vs usual prices</dt><dd>${usd(Math.round(totalSaving))}</dd></div>
    <div class="stat"><dt>Average discount</dt><dd>${avgDiscount.toFixed(1)}%</dd></div>
    <div class="stat"><dt>New-low prices</dt><dd>${newLows}</dd></div>
  </dl>
  <p class="compare-link"><a href="#/compare">See all ${COMPARE.length} products compared across stores →</a> · <a href="#/deal/${encodeURIComponent(item.dealId)}">See the full deal page →</a></p>
</section>`;
}

export function heroPage(deals, state, categories, stores) {
  return heroSection() + listPage(deals, state, categories, stores);
}
