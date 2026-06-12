import { seedTransactions } from "./seed.js";

const STORAGE_KEY = "ledgerline.transactions.v1";

function isTransaction(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.amount === "number" &&
    typeof value.category === "string" &&
    (value.type === "income" || value.type === "expense") &&
    typeof value.date === "string"
  );
}

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTransactions(seedTransactions);
      return seedTransactions;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isTransaction)) {
      return parsed;
    }

    saveTransactions(seedTransactions);
    return seedTransactions;
  } catch {
    saveTransactions(seedTransactions);
    return seedTransactions;
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // The dashboard can still work in memory if browser storage is unavailable.
  }
}

export function resetTransactions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore unavailable storage; the caller will still receive demo data.
  }

  return seedTransactions;
}

export function replaceWithDemoData() {
  saveTransactions(seedTransactions);
  return seedTransactions;
}
