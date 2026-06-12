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
      return seedTransactions;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isTransaction)
      ? parsed
      : seedTransactions;
  } catch {
    return seedTransactions;
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function resetTransactions() {
  localStorage.removeItem(STORAGE_KEY);
  return seedTransactions;
}

export function replaceWithDemoData() {
  saveTransactions(seedTransactions);
  return seedTransactions;
}
