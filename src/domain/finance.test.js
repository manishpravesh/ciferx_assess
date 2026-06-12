import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInsight,
  filterTransactions,
  summarizeTransactions
} from "./finance.js";

const transactions = [
  {
    id: "1",
    amount: 5000,
    category: "Salary",
    type: "income",
    date: "2026-06-01",
    note: "",
    createdAt: "2026-06-01T09:00:00.000Z"
  },
  {
    id: "2",
    amount: 1200,
    category: "Housing",
    type: "expense",
    date: "2026-06-03",
    note: "",
    createdAt: "2026-06-03T09:00:00.000Z"
  },
  {
    id: "3",
    amount: 300,
    category: "Food",
    type: "expense",
    date: "2026-06-06",
    note: "",
    createdAt: "2026-06-06T09:00:00.000Z"
  }
];

test("summarizes income, expense, balance, and top category", () => {
  const summary = summarizeTransactions(transactions);

  assert.equal(summary.income, 5000);
  assert.equal(summary.expense, 1500);
  assert.equal(summary.balance, 3500);
  assert.equal(summary.topCategory, "Housing");
});

test("filters transactions by category and date range", () => {
  const filtered = filterTransactions(transactions, {
    category: "Food",
    from: "2026-06-01",
    to: "2026-06-30"
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "3");
});

test("builds a concentrated-spend insight", () => {
  const summary = summarizeTransactions(transactions);
  const insight = buildInsight(summary, transactions);

  assert.match(insight.title, /Housing/);
});
