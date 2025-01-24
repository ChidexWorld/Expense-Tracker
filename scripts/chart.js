// Parse the expenses data from the hidden input
const expenses = JSON.parse(document.getElementById("expensesData").value);

// Extract labels (dates) and data (expenses) for the line chart
const labels = expenses.map((item) => item.date);
const data = expenses.map((item) => item.expense);

// Extract categories and their corresponding amounts for the pie chart
const categoryData = {};
expenses.forEach((item) => {
  if (categoryData[item.category]) {
    categoryData[item.category] += item.expense; // Accumulate expenses
  } else {
    categoryData[item.category] = item.expense; // Initialize expense
  }
});

// Prepare the data for the pie chart
const categoryLabels = Object.keys(categoryData);
const categoryAmounts = Object.values(categoryData);

// Line chart setup (daily expenses)
const lineChartConfig = {
  type: "line",
  data: {
    labels: labels, // Dates on the X-axis
    datasets: [
      {
        label: "Daily Expenses",
        data: data, // Expense amounts on the Y-axis
        borderColor: "blue",
        borderWidth: 2,
        fill: false, // No fill below the line
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Expense Amount" } },
    },
  },
};
//for doughnut chart

// Get the values from hidden input fields
const categoriesData = JSON.parse(
  document.getElementById("categoriesData").value
);
const categoryExpenseAmountData = JSON.parse(
  document.getElementById("categoryExpenseAmountData").value
);

// Log the data to confirm
console.log("Categories:", categoriesData);
console.log("Expenses:", categoryExpenseAmountData);

// doughnut chart setup (category distribution)
const pieChartConfig = {
  type: "doughnut",
  data: {
    labels: categoriesData, // Categories
    datasets: [
      {
        label: "Expense Categories",
        data: categoryExpenseAmountData, // Amounts for each category
        backgroundColor: [
          "#FF6384", // Red
          "#36A2EB", // Blue
          "#FFCE56", // Yellow
          "#4BC0C0", // Teal
          "#9966FF", // Purple
          "#FF9F40", // Orange
          "#FF577F", // Pink
          "#4B9F84", // Green
          "#FFD700", // Gold
        ],
        // Colors for each category
        hoverOffset: 10,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const category = categoriesData[tooltipItem.dataIndex];
            const value = categoryExpenseAmountData[tooltipItem.dataIndex];
            return `${category}: ₦${value.toFixed(2)}`; // Format the amount
          },
        },
      },
    },
  },
};



// Render the line chart
const lineCtx = document.getElementById("lineChart").getContext("2d");
new Chart(lineCtx, lineChartConfig);

// Render the pie chart
const pieCtx = document
  .getElementById("categoryExpensesChart")
  .getContext("2d");
new Chart(pieCtx, pieChartConfig);
