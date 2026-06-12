import {
  CATEGORIES,
  EXPENSE_CATEGORIES,
  buildInsight,
  filterTransactions,
  formatCurrency,
  formatDate,
  getSpendingChartData,
  summarizeTransactions
} from "../domain/finance.js";

const chartColors = [
  "#d8ff4f",
  "#ff715b",
  "#4dd4ac",
  "#f7c548",
  "#a8a2ff",
  "#61c7ff",
  "#ef7cff",
  "#ff9f1c",
  "#70e000",
  "#f72585"
];

function option(value, label = value) {
  return `<option value="${value}">${label}</option>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderCategoryOptions(typeSelect, categorySelect, filterSelect) {
  if (!typeSelect || !categorySelect || !filterSelect) return;

  const activeFilter = filterSelect.value;
  const categoryPool =
    typeSelect.value === "income"
      ? ["Salary", "Freelance", "Investments", "Other"]
      : EXPENSE_CATEGORIES;

  categorySelect.innerHTML = categoryPool.map((category) => option(category)).join("");
  filterSelect.innerHTML = option("", "All categories") +
    CATEGORIES.map((category) => option(category)).join("");
  filterSelect.value = activeFilter;
}

export function renderSummary(summary, elements) {
  if (!elements) return;

  if (elements.income) elements.income.textContent = formatCurrency(summary.income);
  if (elements.expense) elements.expense.textContent = formatCurrency(summary.expense);
  if (elements.balance) elements.balance.textContent = formatCurrency(summary.balance);
  if (elements.topCategory) elements.topCategory.textContent = summary.topCategory;
}

export function renderChart(transactions, chartElement, totalElement) {
  if (!chartElement || !totalElement) return;

  const data = getSpendingChartData(transactions);
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  totalElement.textContent = formatCurrency(total);

  if (!data.length) {
    chartElement.innerHTML = `
      <div class="chart-empty">
        <strong>No expenses yet</strong>
        <span>Expense categories will appear here after you add them.</span>
      </div>
    `;
    return;
  }

  const max = Math.max(...data.map((item) => item.amount));
  chartElement.innerHTML = `
    <div class="bar-stack" role="img" aria-label="Spending by category bar chart">
      ${data
        .map((item, index) => {
          const width = Math.max(8, Math.round((item.amount / max) * 100));
          const share = Math.round((item.amount / total) * 100);
          const color = chartColors[index % chartColors.length];
          return `
            <div class="bar-row">
              <div class="bar-label">
                <span>${escapeHtml(item.category)}</span>
                <strong>${formatCurrency(item.amount)}</strong>
              </div>
              <div class="bar-track" aria-hidden="true">
                <span style="width: ${width}%; background: ${color}"></span>
              </div>
              <span class="bar-share">${share}%</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

export function renderInsight(summary, transactions, titleElement, copyElement) {
  if (!titleElement || !copyElement) return;

  const insight = buildInsight(summary, transactions);
  titleElement.textContent = insight.title;
  copyElement.textContent = insight.copy;
}

export function renderLedger(transactions, filters, bodyElement, emptyElement) {
  if (!bodyElement || !emptyElement) return;

  const rows = filterTransactions(transactions, filters);
  emptyElement.hidden = rows.length > 0;

  bodyElement.innerHTML = rows
    .map((transaction) => {
      const sign = transaction.type === "income" ? "+" : "-";
      const note = transaction.note || "No note";
      return `
        <tr>
          <td>${formatDate(transaction.date)}</td>
          <td><span class="category-pill">${escapeHtml(transaction.category)}</span></td>
          <td>${escapeHtml(note)}</td>
          <td><span class="type-pill ${transaction.type}">${transaction.type}</span></td>
          <td class="amount-column ${transaction.type}">
            ${sign}${formatCurrency(transaction.amount, true)}
          </td>
          <td class="action-column">
            <button class="icon-button" data-action="delete" data-id="${transaction.id}" type="button" aria-label="Delete transaction">
              &times;
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function renderAll(transactions, filters, elements) {
  const summary = summarizeTransactions(transactions);
  renderSummary(summary, elements.summary);
  renderChart(transactions, elements.chart, elements.chartTotal);
  renderInsight(summary, transactions, elements.insightTitle, elements.insightCopy);
  renderLedger(transactions, filters, elements.ledgerBody, elements.emptyState);
}
