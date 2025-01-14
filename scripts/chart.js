// Parse the expenses data from the hidden input
const expenses = JSON.parse(document.getElementById("expensesData").value);

// Extract labels (dates) and data (expenses)
const labels = expenses.map((item) => item.date);
const data = expenses.map((item) => item.expense);

// Chart.js setup
const config = {
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

// Render the chart
const ctx = document.getElementById('lineChart').getContext('2d');
new Chart(ctx, config);