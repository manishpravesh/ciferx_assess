import { createTransaction } from "./domain/finance.js";
import {
  loadTransactions,
  replaceWithDemoData,
  resetTransactions,
  saveTransactions
} from "./data/storage.js";
import { renderAll, renderCategoryOptions } from "./ui/render.js";

const state = {
  transactions: loadTransactions(),
  filters: {
    category: "",
    from: "",
    to: ""
  }
};

const elements = {
  form: document.querySelector("#transaction-form"),
  type: document.querySelector("#type"),
  category: document.querySelector("#category"),
  date: document.querySelector("#date"),
  formError: document.querySelector("[data-form-error]"),
  filterCategory: document.querySelector("#filter-category"),
  filterFrom: document.querySelector("#filter-from"),
  filterTo: document.querySelector("#filter-to"),
  summary: {
    income: document.querySelector('[data-summary="income"]'),
    expense: document.querySelector('[data-summary="expense"]'),
    balance: document.querySelector('[data-summary="balance"]'),
    topCategory: document.querySelector('[data-summary="top-category"]')
  },
  chart: document.querySelector("[data-chart]"),
  chartTotal: document.querySelector("[data-chart-total]"),
  insightTitle: document.querySelector("[data-insight-title]"),
  insightCopy: document.querySelector("[data-insight-copy]"),
  ledgerBody: document.querySelector("[data-ledger-body]"),
  emptyState: document.querySelector("[data-empty-state]")
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function persistAndRender() {
  saveTransactions(state.transactions);
  renderAll(state.transactions, state.filters, elements);
}

function setError(message = "") {
  if (elements.formError) {
    elements.formError.textContent = message;
  }
}

function setup() {
  elements.date.value = today();
  renderCategoryOptions(elements.type, elements.category, elements.filterCategory);
  renderAll(state.transactions, state.filters, elements);
}

elements.type.addEventListener("change", () => {
  renderCategoryOptions(elements.type, elements.category, elements.filterCategory);
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  setError();

  const formData = new FormData(elements.form);
  try {
    const transaction = createTransaction(Object.fromEntries(formData));
    state.transactions = [transaction, ...state.transactions];
    elements.form.reset();
    elements.date.value = today();
    renderCategoryOptions(elements.type, elements.category, elements.filterCategory);
    persistAndRender();
  } catch (error) {
    setError(error.message);
  }
});

elements.filterCategory.addEventListener("change", (event) => {
  state.filters.category = event.target.value;
  renderAll(state.transactions, state.filters, elements);
});

elements.filterFrom.addEventListener("change", (event) => {
  state.filters.from = event.target.value;
  renderAll(state.transactions, state.filters, elements);
});

elements.filterTo.addEventListener("change", (event) => {
  state.filters.to = event.target.value;
  renderAll(state.transactions, state.filters, elements);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === "delete") {
    state.transactions = state.transactions.filter(
      (transaction) => transaction.id !== id
    );
    persistAndRender();
  }

  if (action === "clear-filters") {
    state.filters = { category: "", from: "", to: "" };
    elements.filterCategory.value = "";
    elements.filterFrom.value = "";
    elements.filterTo.value = "";
    renderAll(state.transactions, state.filters, elements);
  }

  if (action === "load-demo") {
    state.transactions = replaceWithDemoData();
    persistAndRender();
  }

  if (action === "reset-data") {
    state.transactions = resetTransactions();
    state.filters = { category: "", from: "", to: "" };
    elements.filterCategory.value = "";
    elements.filterFrom.value = "";
    elements.filterTo.value = "";
    persistAndRender();
  }
});

setup();
