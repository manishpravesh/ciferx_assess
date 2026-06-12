export const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Housing",
  "Food",
  "Transport",
  "Bills",
  "Health",
  "Shopping",
  "Travel",
  "Learning",
  "Entertainment",
  "Other"
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (category) => !["Salary", "Freelance", "Investments"].includes(category)
);

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function formatCurrency(value, precise = false) {
  const formatter = precise ? preciseCurrencyFormatter : currencyFormatter;
  return formatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateValue : dateFormatter.format(date);
}

export function createTransaction(input) {
  const amount = Number(input.amount);
  const category = String(input.category || "").trim();
  const type = input.type === "income" ? "income" : "expense";
  const date = String(input.date || "").trim();
  const note = String(input.note || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }

  if (!CATEGORIES.includes(category)) {
    throw new Error("Choose a valid category.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Choose a valid transaction date.");
  }

  return {
    id: crypto.randomUUID(),
    amount: Math.round(amount * 100) / 100,
    category,
    type,
    date,
    note,
    createdAt: new Date().toISOString()
  };
}

export function sortTransactions(transactions) {
  return [...transactions].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    return byDate || b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterTransactions(transactions, filters) {
  return sortTransactions(transactions).filter((transaction) => {
    const matchesCategory =
      !filters.category || transaction.category === filters.category;
    const matchesFrom = !filters.from || transaction.date >= filters.from;
    const matchesTo = !filters.to || transaction.date <= filters.to;
    return matchesCategory && matchesFrom && matchesTo;
  });
}

export function summarizeTransactions(transactions) {
  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
        summary.spendingByCategory[transaction.category] =
          (summary.spendingByCategory[transaction.category] || 0) +
          transaction.amount;
      }

      return summary;
    },
    { income: 0, expense: 0, spendingByCategory: {} }
  );

  const topSpending = Object.entries(totals.spendingByCategory).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
    topCategory: topSpending?.[0] ?? "No expenses yet",
    topCategoryAmount: topSpending?.[1] ?? 0,
    spendingByCategory: totals.spendingByCategory
  };
}

export function getSpendingChartData(transactions) {
  const { spendingByCategory } = summarizeTransactions(transactions);
  return Object.entries(spendingByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildInsight(summary, transactions) {
  const expenseCount = transactions.filter(
    (transaction) => transaction.type === "expense"
  ).length;

  if (!transactions.length) {
    return {
      title: "Ready for your first entry",
      copy: "Start with one income item and two recent expenses to unlock a useful spending signal."
    };
  }

  if (summary.income > 0 && summary.expense / summary.income > 0.75) {
    return {
      title: "Spending is running hot",
      copy: `Expenses are ${Math.round(
        (summary.expense / summary.income) * 100
      )}% of income. Consider reviewing variable categories before the month closes.`
    };
  }

  if (summary.topCategoryAmount > 0 && summary.expense > 0) {
    const share = Math.round((summary.topCategoryAmount / summary.expense) * 100);
    if (share >= 40) {
      return {
        title: `${summary.topCategory} is the pressure point`,
        copy: `${summary.topCategory} accounts for ${share}% of spending. A small cap there would have the biggest impact.`
      };
    }
  }

  if (summary.balance > 0 && expenseCount >= 3) {
    return {
      title: "Positive cash flow detected",
      copy: `You are ahead by ${formatCurrency(
        summary.balance
      )}. This is a good moment to route surplus toward savings or debt payoff.`
    };
  }

  return {
    title: "Pattern still forming",
    copy: "Add a few more categorized transactions and the dashboard will highlight the clearest lever."
  };
}
