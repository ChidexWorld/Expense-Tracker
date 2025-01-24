// Get the canvas element
const ctx = document.getElementById("myChart").getContext("2d");

const categories = JSON.parse(document.getElementById("categoriesData").value);
const categoryExpenseAmount_Data = JSON.parse(
  document.getElementById("categoryExpenseAmountData").value
);

const allocatedBudgetsData = JSON.parse(
  document.getElementById("allocatedBudgetsData").value
);

console.log(categories, categoryExpenseAmountData);

// Create the chart
new Chart(ctx, {
  type: "bar", // Vertical bar chart
  data: {
    labels: categories,
    datasets: [
      {
        label: "Allocated Budget For Each Category",
        data: allocatedBudgetsData,
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
      },
      {
        label: "Expenses Of Category",
        data: categoryExpenseAmount_Data,
        backgroundColor: "rgba(255, 159, 64, 0.6)", // Bar color
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true, // Display the legend for both datasets
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  },
});
