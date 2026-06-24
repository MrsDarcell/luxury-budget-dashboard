let transactions =
  JSON.parse(
    localStorage.getItem(
      "transactions"
    )
  ) || [];
let goals =
  JSON.parse(
    localStorage.getItem(
      "goals"
    )
  ) || [];
let deletedTransactions = [];

let budgets =
  JSON.parse(
    localStorage.getItem(
      "budgets"
    )
  ) || [];

let expenseChart;
let trendChart;
let categoryChart;

/* ADD INCOME */

function addIncome() {
  addTransaction(true);
}

/* ADD EXPENSE */

function addExpense() {
  addTransaction(false);
}

/* ADD TRANSACTION */

function addTransaction(isIncome) {

  const desc =
    document.getElementById(
      "description"
    ).value;

  const amount =
    Number(
      document.getElementById(
        "amount"
      ).value
    );
  if (!desc || !amount) {

    alert(
      "Please add a description and amount 👑"
    );

    return;
  }

  const category =
    document.getElementById(
      "category"
    ).value;

  const transaction = {

    id: Date.now(),

    description: desc,

    amount:
      isIncome
        ? amount
        : -amount,

    category:
      isIncome
        ? "Income"
        : category,

    date:
      new Date()
        .toLocaleDateString(),

    month:
      new Date()
        .toLocaleDateString(
          "en-US",
          {
            month: "short",
            year: "numeric"
          }
        )
  };

  transactions.push(transaction);
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  document.getElementById(
    "description"
  ).value = "";

  document.getElementById(
    "amount"
  ).value = "";

  updateUI();
}

/* UPDATE UI */

function updateUI() {

  renderTransactions();

  renderTransactionsPage();

  renderSavingsPage();

  renderAnalyticsPage();

  calculateHealthScore();

  renderMonthlyReport();

  renderAchievements();

  updateTotals();

  renderCharts();

  renderBudgets();

  renderBudgetsPage();

  renderInsights();

  renderNotifications();
}

/* TOTALS */

function updateTotals() {

  const balance =
    transactions.reduce(
      (total, t) =>
        total + t.amount,
      0
    );

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce(
        (a, b) =>
          a + b.amount,
        0
      );

  const expenses =
    Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce(
          (a, b) =>
            a + b.amount,
          0
        )
    );

  const savings =
    income - expenses;

  document.getElementById(
    "balance"
  ).innerText = balance;

  document.getElementById(
    "total-income"
  ).innerText =
    `$${income}`;

  document.getElementById(
    "summary-income"
  ).innerText =
    `$${income}`;

  document.getElementById(
    "total-expenses"
  ).innerText =
    `$${expenses}`;

  document.getElementById(
    "summary-expenses"
  ).innerText =
    `$${expenses}`;

  document.getElementById(
    "total-savings"
  ).innerText =
    `$${savings}`;

  const rate =
    income > 0
      ? Math.round(
        (savings / income) * 100
      )
      : 0;

  document.getElementById(
    "savings-rate"
  ).innerText =
    `${rate}%`;

  const highestExpense =
    Math.max(
      ...transactions
        .filter(t => t.amount < 0)
        .map(t =>
          Math.abs(t.amount)
        ),
      0
    );

  document.getElementById(
    "highest-expense"
  ).innerText =
    `$${highestExpense}`;
}

/* TRANSACTIONS */

function renderTransactions() {

  const list =
    document.getElementById(
      "list"
    );

  list.innerHTML = "";

  transactions
    .slice()
    .reverse()
    .forEach(transaction => {

      const item =
        document.createElement(
          "div"
        );

      item.classList.add(
        "item"
      );

      const isIncome =
        transaction.amount > 0;

      item.innerHTML = `

      <div class="transaction-main">

        <div class="transaction-icon ${isIncome ? "green-text" : "red-text"}">

          <i class="fa-solid ${isIncome ? "fa-arrow-up" : "fa-arrow-down"}"></i>

        </div>

        <div>

          <h4>${transaction.description}</h4>

          <p>${transaction.category}</p>

        </div>

      </div>

      <div class="transaction-category">

        ${getCategoryIcon(
        transaction.category
      )}

        ${transaction.category}

      </div>

      <div class="transaction-date">
        ${transaction.date}
      </div>

      <div class="transaction-amount ${isIncome ? "green-text" : "red-text"}">

        ${isIncome ? "+" : "-"}

        $${Math.abs(transaction.amount)}

      </div>

      <button
        class="delete-btn"
        onclick="deleteTransaction(${transaction.id})">

        <i class="fa-solid fa-xmark"></i>

      </button>
      `;

      list.appendChild(item);
    });
}

/* DELETE */

function deleteTransaction(id) {

  if (
    !confirm(
      "Delete this transaction?"
    )
  ) return;

  const deleted =
    transactions.find(
      t => t.id === id
    );

  if (
    deleted &&
    deleted.goalId
  ) {

    goals = goals.map(goal => {

      if (
        goal.id === deleted.goalId
      ) {

        goal.saved -=
          Math.abs(deleted.amount);
      }

      return goal;
    });

    localStorage.setItem(
      "goals",
      JSON.stringify(goals)
    );

    renderGoals();
  }

  deletedTransactions.push(deleted);

  transactions =
    transactions.filter(
      t => t.id !== id
    );

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  updateUI();

  showUndoButton();
}

/* CHARTS */

function renderCharts() {

  renderExpenseChart();

  renderTrendChart();

  renderCategoryChart();
}

/* DONUT */

function renderExpenseChart() {

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce((a, b) =>
        a + b.amount,
        0
      );

  const expenses =
    Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((a, b) =>
          a + b.amount,
          0
        )
    );

  const ctx =
    document
      .getElementById(
        "expenseChart"
      );

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart =
    new Chart(ctx, {

      type: "doughnut",

      data: {

        labels: [
          "Income",
          "Expenses"
        ],

        datasets: [{

          data: [
            income,
            expenses
          ],

          backgroundColor: [
            "#FFD700",
            "#C0C0C0"
          ],

          borderWidth: 0
        }]
      },

      options: {

        cutout: "82%",

        plugins: {

          legend: {
            display: false
          }
        }
      }
    });
}

/* TREND */

function renderTrendChart() {

  const monthlyData = {};

  transactions.forEach(t => {

    if (!monthlyData[t.month]) {
      monthlyData[t.month] = 0;
    }

    monthlyData[t.month] += t.amount;
  });

  const ctx =
    document
      .getElementById(
        "trendChart"
      );

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart =
    new Chart(ctx, {

      type: "line",

      data: {

        labels:
          Object.keys(monthlyData),

        datasets: [{

          data:
            Object.values(monthlyData),

          borderColor:
            "#FFD700",

          backgroundColor:
            "rgba(255,215,0,0.12)",

          fill: true,

          tension: 0.4
        }]
      },

      options: {

        plugins: {

          legend: {
            display: false
          }
        }
      }
    });
}

/* CATEGORY */

function renderCategoryChart() {

  const categories = {};

  transactions.forEach(t => {

    if (t.amount < 0) {

      categories[t.category] =
        (categories[t.category] || 0)
        + Math.abs(t.amount);
    }
  });

  const ctx =
    document
      .getElementById(
        "categoryChart"
      );

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart =
    new Chart(ctx, {

      type: "bar",

      data: {

        labels:
          Object.keys(categories),

        datasets: [{

          data:
            Object.values(categories),

          backgroundColor:
            "#FFD700",

          borderRadius: 12
        }]
      },

      options: {

        plugins: {

          legend: {
            display: false
          }
        }
      }
    });
}

/* ADD GOAL */

function addSavingsGoal() {

  const name =
    document.getElementById(
      "goal-name"
    ).value;

  const target =
    Number(
      document.getElementById(
        "goal-target"
      ).value
    );

  if (!name || !target) return;

  if (!name.trim()) {

    alert(
      "Please enter a goal name."
    );

    return;
  }

  if (!target || target <= 0) {

    alert(
      "Please enter a valid target amount."
    );

    return;
  }

  const goal = {

    id: Date.now(),

    name,

    target,

    saved: 0
  };

  goals.push(goal);
  localStorage.setItem(
    "goals",
    JSON.stringify(goals)
  );
  document.getElementById(
    "goal-name"
  ).value = "";

  document.getElementById(
    "goal-target"
  ).value = "";

  renderGoals();
}

/* RENDER GOALS */

function renderGoals() {

  const goalsList =
    document.getElementById(
      "goals-list"
    );

  goalsList.innerHTML = "";


  if (goals.length === 0) {

    goalsList.innerHTML = `

      <div class="empty-state">

        No savings goals yet.

        <br><br>

        Create your first goal to start saving.

      </div>

    `;

    return;
  }
  goals.forEach(goal => {

    const percent =
      Math.min(
        (goal.saved / goal.target) * 100,
        100
      );

    const item =
      document.createElement(
        "div"
      );

    item.classList.add(
      "budget-item"
    );

    item.innerHTML = `

      <h4>${goal.name}</h4>

      <p>
        $${goal.saved}
        /
        $${goal.target}
      </p>

      <p class="goal-remaining">

        Remaining:
        $${goal.target - goal.saved}

      </p>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width:${percent}%">
        </div>

      </div>

      <div class="goal-btns">

        <button
          onclick="addToGoal(${goal.id})"
          class="income-btn">

          + Add Money

        </button>

        <button
          onclick="deleteGoal(${goal.id})"
          class="expense-btn">

          Delete

        </button>

      </div>
    `;

    goalsList.appendChild(item);
  });
}

/* ADD MONEY */

function addToGoal(id) {

  const amount =
    prompt(
      "How much would you like to add?"
    );

  if (!amount) return;

  goals = goals.map(goal => {

    if (goal.id === id) {

      const value = Number(amount);

    if (isNaN(value) || value <= 0) {

      alert(
        "Please enter a valid amount."
      );

      return;
    }

      goal.saved += value;

      transactions.push({

        id: Date.now(),

        goalId: id,

        description:
          `Goal Contribution: ${goal.name}`,

        amount: -value,

        category: "Savings",

        date:
          new Date()
            .toLocaleDateString(),

        month:
          new Date()
            .toLocaleDateString(
              "en-US",
              {
                month: "short",
                year: "numeric"
              }
            )
      });

      localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
      );

      localStorage.setItem(
        "goals",
        JSON.stringify(goals)
      );

      updateUI();
    }

    return goal;
  });

  renderGoals();
}

/* DELETE GOAL */

function deleteGoal(id) {

  if (
    !confirm(
      "Delete this goal?"
    )
  ) return;

  goals =
    goals.filter(
      goal => goal.id !== id
    );
  localStorage.setItem(
    "goals",
    JSON.stringify(goals)
  );
  renderGoals();
}

updateUI();
renderGoals();
loadNetWorth();

function getCategoryIcon(category) {

  switch (category) {

    case "Food":
      return "🍔";

    case "Bills":
      return "💡";

    case "Shopping":
      return "🛍️";

    case "Transport":
      return "🚗";

    case "Savings":
      return "💰";

    case "Entertainment":
      return "🎬";

    case "Income":
      return "💵";

    default:
      return "📌";
  }
}

/* UNDO DELETE */

function undoDelete() {

  if (
    deletedTransactions.length === 0
  ) return;

  const restored =
    deletedTransactions.pop();

  transactions.push(restored);

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  updateUI();

  if (
    deletedTransactions.length === 0
  ) {

    document.getElementById(
      "undo-btn"
    ).style.display = "none";
  }
}

/* SHOW BUTTON */

function showUndoButton() {

  const undo =
    document.getElementById(
      "undo-btn"
    );

  undo.style.display = "flex";
}

/* ADD BUDGET */

function addBudget() {

  const category =
    document.getElementById(
      "budget-category"
    ).value;

  const amount =
    Number(
      document.getElementById(
        "budget-amount"
      ).value
    );

  if (!category || !amount)
    return;

  const budget = {

    id: Date.now(),

    category,

    amount,

    saved: 0
  };

  if (!category.trim()) {

    alert(
      "Please enter a category."
    );

    return;
  }

  if (!amount || amount <= 0) {

    alert(
      "Please enter a valid budget amount."
    );

    return;
  }

  budgets.push(budget);

  localStorage.setItem(
    "budgets",
    JSON.stringify(budgets)
  );

  renderBudgets();

  document.getElementById(
    "budget-category"
  ).value = "";

  document.getElementById(
    "budget-amount"
  ).value = "";
}

/* RENDER BUDGETS */

function renderBudgets() {

  const budgetList =
    document.getElementById(
      "budget-list"
    );

  budgetList.innerHTML = "";

  if (budgets.length === 0) {

    budgetList.innerHTML = `

      <div class="empty-state">

        No budgets yet.

        <br><br>

        Create your first budget.

      </div>

    `;

    return;
  }

  budgets.forEach(budget => {

    const spent =
      transactions
        .filter(
          t =>
            t.category ===
            budget.category
        )
        .reduce(
          (total, t) =>
            total +
            Math.abs(t.amount),
          0
        );

    const remaining =
      budget.amount - budget.saved;

    const percent =
      Math.min(
        (budget.saved / budget.amount)
        * 100,
        100
      );

    const item =
      document.createElement(
        "div"
      );

    item.classList.add(
      "budget-item"
    );

    item.innerHTML = `

      <h4>
        ${budget.category}
      </h4>

      <p>
        $${budget.saved}
        /
        $${budget.amount}
      </p>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="
            width:${percent}%">
        </div>

      </div>

      <p>

        Remaining:
        $${remaining}

      </p>

      <div class="goal-btns">

        <button
          class="income-btn"
          onclick="increaseBudget(${budget.id})">

          + Add Budget

        </button>

        <button
          class="expense-btn"
          onclick="deleteBudget(${budget.id})">

          Delete

        </button>

      </div>
    `;

    budgetList.appendChild(item);
  });
}

/* INCREASE BUDGET */

function increaseBudget(id) {

  const amount =
    prompt(
      "How much would you like to add?"
    );

  if (!amount) return;

  budgets = budgets.map(budget => {

    if (budget.id === id) {

      const value =
        Number(amount);

      budget.saved += value;

      transactions.push({

        id: Date.now(),

        description:
          `Budget Added: ${budget.category}`,

        amount: -value,

        category: budget.category,

        date:
          new Date()
            .toLocaleDateString(),

        month:
          new Date()
            .toLocaleDateString(
              "en-US",
              {
                month: "short",
                year: "numeric"
              }
            )
      });
    }

    return budget;
  });

  localStorage.setItem(
    "budgets",
    JSON.stringify(budgets)
  );

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  updateUI();
}

/* DELETE BUDGET */

function deleteBudget(id) {

  if (
    !confirm(
      "Delete this budget?"
    )
  ) return;

  budgets =
    budgets.filter(
      budget =>
        budget.id !== id
    );

  localStorage.setItem(
    "budgets",
    JSON.stringify(budgets)
  );

  renderBudgets();
}

/* NET WORTH */

function calculateNetWorth() {

  const cash =
    Number(
      document.getElementById(
        "cash-input"
      ).value
    ) || 0;

  const savings =
    Number(
      document.getElementById(
        "savings-input"
      ).value
    ) || 0;

  const investments =
    Number(
      document.getElementById(
        "investments-input"
      ).value
    ) || 0;

  const debt =
    Number(
      document.getElementById(
        "debt-input"
      ).value
    ) || 0;

  const total =

    cash +
    savings +
    investments -
    debt;

  document.getElementById(
    "net-worth-total"
  ).innerText =
    `$${total}`;

  localStorage.setItem(
    "netWorth",
    JSON.stringify({
      cash,
      savings,
      investments,
      debt,
      total
    })
  );
}

/* LOAD NET WORTH */

function loadNetWorth() {

  const data =
    JSON.parse(
      localStorage.getItem(
        "netWorth"
      )
    );

  if (!data) return;

  document.getElementById(
    "cash-input"
  ).value =
    data.cash;

  document.getElementById(
    "savings-input"
  ).value =
    data.savings;

  document.getElementById(
    "investments-input"
  ).value =
    data.investments;

  document.getElementById(
    "debt-input"
  ).value =
    data.debt;

  document.getElementById(
    "net-worth-total"
  ).innerText =
    `$${data.total}`;
}

/* FINANCIAL INSIGHTS */

function generateInsights() {

  const insights =
    [];

  const expenses =
    transactions.filter(
      t => t.amount < 0
    );

  const income =
    transactions.filter(
      t => t.amount > 0
    );

  const totalExpenses =
    expenses.reduce(
      (sum, t) =>
        sum + Math.abs(t.amount),
      0
    );

  const totalIncome =
    income.reduce(
      (sum, t) =>
        sum + t.amount,
      0
    );

  /* SAVINGS RATE */

  if (totalIncome > 0) {

    const savingsRate =
      Math.round(
        (
          (totalIncome -
            totalExpenses)
          / totalIncome
        ) * 100
      );

    insights.push(

      `💰 Your savings rate is ${savingsRate}%`
    );
  }

  /* HIGH SPENDING WARNING */

  if (
    totalExpenses >
    totalIncome * 0.8
  ) {

    insights.push(

      "⚠️ Expenses are very high compared to income."
    );
  }

  /* CATEGORY ANALYSIS */

  const categoryTotals = {};

  expenses.forEach(t => {

    if (
      !categoryTotals[t.category]
    ) {

      categoryTotals[t.category] = 0;
    }

    categoryTotals[t.category] +=
      Math.abs(t.amount);
  });

  let highestCategory =
    "";

  let highestAmount = 0;

  for (
    const category
    in categoryTotals
  ) {

    if (
      categoryTotals[category]
      > highestAmount
    ) {

      highestAmount =
        categoryTotals[category];

      highestCategory =
        category;
    }
  }

  if (highestCategory) {

    insights.push(

      `🔥 Highest spending category: ${highestCategory}`
    );
  }

  /* GOAL PROGRESS */

  goals.forEach(goal => {

    const percent =
      Math.round(
        (
          goal.saved /
          goal.target
        ) * 100
      );

    if (percent >= 75) {

      insights.push(

        `🎯 You're ${percent}% toward your ${goal.name} goal`
      );
    }
  });

  renderInsights();
}

/* RENDER INSIGHTS */

function renderInsights() {

  const container =
    document.getElementById(
      "insights-page"
    );

  if (!container) return;

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) =>
        sum + t.amount, 0);

  const expenses =
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) =>
        sum + Math.abs(t.amount), 0);

  const savingsRate =
    income > 0
      ? Math.round(
        ((income - expenses) /
          income) * 100
      )
      : 0;

  let highestCategory =
    "None";

  let categoryTotals = {};

  transactions
    .filter(t => t.amount < 0)
    .forEach(t => {

      const cat =
        t.category || "Other";

      categoryTotals[cat] =
        (categoryTotals[cat] || 0)
        + Math.abs(t.amount);
    });

  let highestAmount = 0;

  for (let cat in categoryTotals) {

    if (
      categoryTotals[cat]
      > highestAmount
    ) {

      highestAmount =
        categoryTotals[cat];

      highestCategory =
        cat;
    }
  }

  let advice = [];

  if (savingsRate >= 50) {

    advice.push(
      "🔥 Excellent savings rate."
    );

  } else if (savingsRate >= 20) {

    advice.push(
      "✅ Healthy savings rate."
    );

  } else {

    advice.push(
      "⚠️ Consider increasing savings."
    );
  }

  if (highestCategory !== "None") {

    advice.push(
      `💡 Most spending is in ${highestCategory}.`
    );
  }

  if (income > expenses) {

    advice.push(
      "✅ Income exceeds expenses."
    );

  } else {

    advice.push(
      "🚨 Expenses exceed income."
    );
  }

  container.innerHTML = `

    <div class="insight-card">

      💰 Savings Rate:
      ${savingsRate}%

    </div>

    <div class="insight-card">

      📊 Highest Spending Category:
      ${highestCategory}

    </div>

    <div class="insight-card">

      💸 Total Expenses:
      $${expenses}

    </div>

    <div class="insight-card">

      💵 Total Income:
      $${income}

    </div>

    <div class="insight-card">

      🧾 Transactions Logged:
      ${transactions.length}

    </div>

    <div class="insight-card">

      <h3>Smart Insights</h3>

      ${advice
      .map(item =>
        `<p>${item}</p>`
      )
      .join("")}

    </div>
    

  `;
}

/* EXPORT CSV */

function exportCSV() {

  if (transactions.length === 0) {

    alert(
      "No transactions to export."
    );

    return;
  }

  let csv =

    "Description,Amount,Category,Date\n";

  transactions.forEach(t => {

    csv +=

      `${t.description},` +

      `${t.amount},` +

      `${t.category},` +

      `${t.date}\n`;
  });

  const blob =
    new Blob(
      [csv],
      { type: "text/csv" }
    );

  const url =
    window.URL.createObjectURL(
      blob
    );

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "luxury-budget-report.csv";

  a.click();

  window.URL.revokeObjectURL(url);
}

/* SWITCH VIEWS */

function switchView(viewId) {

  const views =
    document.querySelectorAll(
      ".view"
    );

  views.forEach(view => {

    view.classList.remove(
      "active-view"
    );
  });

  document
    .getElementById(viewId)
    .classList.add(
      "active-view"
    );
}

/* FULL TRANSACTIONS PAGE */

function renderTransactionsPage() {

  const container =
    document.getElementById(
      "transactions-page-list"
    );

  if (!container) return;

  container.innerHTML = "";

  if (transactions.length === 0) {

    list.innerHTML = `

      <div class="empty-state">

        No transactions yet.

        <br><br>

        Add income or expenses to get started.

      </div>

    `;

    return;
  }

  const search =
    document
      .getElementById(
        "transaction-search"
      )
      ?.value
      .toLowerCase() || "";

  const filter =
    document
      .getElementById(
        "transaction-filter"
      )
      ?.value || "all";

  transactions

    .filter(t => {

      const matchesSearch =

        t.description
          .toLowerCase()
          .includes(search);

      const matchesFilter =

        filter === "all"

        ||

        (filter === "income"
          && t.amount > 0)

        ||

        (filter === "expense"
          && t.amount < 0);

      return (
        matchesSearch &&
        matchesFilter
      );
    })

    .forEach(t => {

      const div =
        document.createElement(
          "div"
        );

      div.classList.add(
        "transaction"
      );

      div.innerHTML = `

      <div>

        <h4>
          ${t.description}
        </h4>

        <p>
          ${t.category}
        </p>

      </div>

      <h3>
        $${Math.abs(t.amount)}
      </h3>
    `;

      container.appendChild(div);
    });
}

function renderSavingsPage() {

  const container =
    document.getElementById(
      "savings-page"
    );

  if (!container) return;

  container.innerHTML = "";

  goals.forEach(goal => {

    const percent =
      Math.min(
        (goal.saved / goal.target) * 100,
        100
      );

    const card =
      document.createElement("div");

    card.classList.add(
      "savings-page-card"
    );

    card.innerHTML = `

      <h3>${goal.name}</h3>

      <p>
        $${goal.saved}
        /
        $${goal.target}
      </p>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width:${percent}%">
        </div>

      </div>
    `;

    container.appendChild(card);
  });
}

function renderAnalyticsPage() {

  const container =
    document.getElementById(
      "analytics-page"
    );

  if (!container) return;

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce(
        (sum, t) =>
          sum + t.amount,
        0
      );

  const expenses =
    transactions
      .filter(t => t.amount < 0)
      .reduce(
        (sum, t) =>
          sum + Math.abs(t.amount),
        0
      );

  const savingsRate =
    income > 0
      ? Math.round(
        ((income - expenses) /
          income) *
        100
      )
      : 0;

  container.innerHTML = `

    <div class="analytics-grid">

      <div class="analytics-card">

        <h3>Total Income</h3>

        <h1>$${income}</h1>

      </div>

      <div class="analytics-card">

        <h3>Total Expenses</h3>

        <h1>$${expenses}</h1>

      </div>

      <div class="analytics-card">

        <h3>Savings Rate</h3>

        <h1>${savingsRate}%</h1>

      </div>

      <div class="analytics-card">

        <h3>Transactions</h3>

        <h1>${transactions.length}</h1>

      </div>

    </div>

  `;
}

function renderMonthlyReport() {

  const container =
    document.getElementById(
      "monthly-report"
    );

  if (!container) return;

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce(
        (sum, t) =>
          sum + t.amount,
        0
      );

  const expenses =
    transactions
      .filter(t => t.amount < 0)
      .reduce(
        (sum, t) =>
          sum + Math.abs(t.amount),
        0
      );

  const savings =
    income - expenses;

  container.innerHTML = `

    <div class="analytics-grid">

      <div class="analytics-card">

        <h3>Monthly Income</h3>

        <h1>$${income}</h1>

      </div>

      <div class="analytics-card">

        <h3>Monthly Expenses</h3>

        <h1>$${expenses}</h1>

      </div>

      <div class="analytics-card">

        <h3>Monthly Savings</h3>

        <h1>$${savings}</h1>

      </div>

    </div>
  `;
}

function exportData() {

  const data = {

    transactions,

    goals,

    budgets

  };

  const blob = new Blob(

    [
      JSON.stringify(
        data,
        null,
        2
      )
    ],

    {
      type:
        "application/json"
    }

  );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    "luxury-budget-backup.json";

  a.click();

  URL.revokeObjectURL(
    url
  );
}

function importData() {

  const input =
    document.createElement(
      "input"
    );

  input.type = "file";

  input.accept =
    ".json";

  input.onchange =
    e => {

      const file =
        e.target.files[0];

      const reader =
        new FileReader();

      reader.onload =
        event => {

          try {

            const data =
              JSON.parse(
                event.target.result
              );

             // existing code here

          }
          catch(error) {

            alert(
              "Invalid backup file. Please choose a Luxury Budget backup (.json)."
            );

          }

          transactions =
            data.transactions || [];

          goals =
            data.goals || [];

          budgets =
            data.budgets || [];

          localStorage.setItem(
            "transactions",
            JSON.stringify(
              transactions
            )
          );

          localStorage.setItem(
            "goals",
            JSON.stringify(
              goals
            )
          );

          localStorage.setItem(
            "budgets",
            JSON.stringify(
              budgets
            )
          );

          updateUI();

          alert(
            "Backup restored!"
          );
        };

      reader.readAsText(
        file
      );
    };

  input.click();
}

function exportCSV() {

  let csv =

    "Description,Category,Date,Amount\n";

  transactions.forEach(t => {

    csv +=

      `"${t.description}",` +

      `"${t.category}",` +

      `"${t.date}",` +

      `"${t.amount}"\n`;

  });

  const blob =

    new Blob(

      [csv],

      {
        type:
          "text/csv"
      }

    );

  const url =

    URL.createObjectURL(
      blob
    );

  const a =

    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    "transactions.csv";

  a.click();

  URL.revokeObjectURL(
    url
  );
}

function renderAchievements() {

  const container =
    document.getElementById(
      "achievements-list"
    );

  if (!container) return;

  const achievements = [];

  if (transactions.length >= 1) {

    achievements.push(
      "🏆 First Transaction Added"
    );
  }

  if (transactions.length >= 10) {

    achievements.push(
      "🔥 10 Transactions Logged"
    );
  }

  if (goals.length >= 1) {

    achievements.push(
      "🎯 First Savings Goal Created"
    );
  }

  const totalSaved =
    goals.reduce(
      (sum, goal) =>
        sum + goal.saved,
      0
    );

  if (totalSaved >= 1000) {

    achievements.push(
      "💰 Saved $1,000"
    );
  }

  container.innerHTML =
    achievements
      .map(
        a =>
          `<div class="achievement-card">${a}</div>`
      )
      .join("");
}

function calculateHealthScore() {

  let score = 50;

  let reasons = [];

  const income =
    transactions
      .filter(t => t.amount > 0)
      .reduce(
        (sum, t) =>
          sum + t.amount,
        0
      );

  const expenses =
    transactions
      .filter(t => t.amount < 0)
      .reduce(
        (sum, t) =>
          sum + Math.abs(t.amount),
        0
      );

  if (income > expenses) {

    score += 15;

    reasons.push(
      "✅ Income exceeds expenses"
    );
  }

  if (income > 0) {

    const savingsRate =
      ((income - expenses)
        / income) * 100;

    if (savingsRate > 20) {

      score += 15;

      reasons.push(
        "✅ Strong savings rate"
      );
    }
  }

  if (goals.length > 0) {

    score += 10;

    reasons.push(
      "✅ Savings goals active"
    );
  }

  if (budgets.length > 0) {

    score += 10;

    reasons.push(
      "✅ Budget tracking enabled"
    );
  }

  score =
    Math.min(
      100,
      Math.max(
        0,
        score
      )
    );

  const element =
    document.getElementById(
      "health-score"
    );

  if (element) {

    element.textContent =
      score;
  }
  const status =
    document.getElementById(
      "health-status"
    );

  if (status) {

    if (score < 40) {

      status.textContent =
        "🔴 Needs Attention";
    }

    else if (score < 70) {

      status.textContent =
        "🟡 Improving";
    }

    else if (score < 90) {

      status.textContent =
        "🟢 Healthy";
    }

    else {

      status.textContent =
        "👑 Excellent";
    }
  }

  const reasonsBox =
    document.getElementById(
      "health-reasons"
    );

  if (reasonsBox) {

    reasonsBox.innerHTML =
      reasons.join("<br>");
  }
}

function renderNotifications() {

  const container =
    document.getElementById(
      "notifications-list"
    );

  if (!container) return;

  const notifications = [];

  goals.forEach(goal => {

    const percent =
      Math.round(
        (goal.saved / goal.target)
        * 100
      );

    if (percent >= 75) {

      notifications.push(
        `🎯 ${goal.name} is ${percent}% complete`
      );
    }
  });

  budgets.forEach(budget => {

    const percent =
      Math.round(
        (budget.spent /
          budget.limit) * 100
      );

    if (percent >= 90) {

      notifications.push(
        `⚠️ ${budget.category} budget is almost full`
      );
    }
  });

  container.innerHTML =
    notifications.length
      ? notifications
        .map(
          n =>
            `<div class="notification-card">${n}</div>`
        )
        .join("")
      : `
          <div class="notification-card">
            No notifications
          </div>
        `;
}

function renderBudgetsPage() {

  const container =
    document.getElementById(
      "budgets-page"
    );

  if (!container) return;

  container.innerHTML = "";

  budgets.forEach(budget => {

    const percent =
      Math.round(
        (budget.saved /
          budget.amount) * 100
      );

    container.innerHTML += `

      <div class="budget-item">

        <h3>
          ${budget.category}
        </h3>

        <p>

          $${budget.saved}
          /
          $${budget.amount}

        </p>

        <div class="progress-bar">

          <div
            class="progress-fill"
            style="
              width:
              ${percent}%">
          </div>

        </div>

      </div>

    `;
  });
}

function sendFeedback() {

  window.location.href =
    "mailto:guestservices.darcell@gmail.com?subject=Luxury Budget Feedback";

}