function handleEnter(event, transactionId, field, element) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default Enter key behavior (creating a new line)
    element.blur(); // Remove focus from the editable element

    // Get the updated description
    const updatedValue = element.innerText.trim();

    // Validation for description
    if (field === "description" && updatedValue === "") {
      alert("Description cannot be empty!");
      return;
    }

    // Validation for amount
    if (field === "amount") {
      const amountValue = parseFloat(updatedValue);
      if (isNaN(amountValue) || amountValue <= 0) {
        alert("Amount must be a valid positive number!");
        return;
      }
    }

    // Validation for expense_date
    if (field === "expense_date") {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for date format YYYY-MM-DD
      if (!updatedValue.match(datePattern)) {
        alert("Please enter a valid date in the format YYYY-MM-DD.");
        return;
      }
    }

    // Only send the update if the value has changed
    const data = {
      id: transactionId,
      field: field,
      value: updatedValue,
    };

    // Send the updated data to the backend via AJAX
    console.log(data);
    updateTransaction(data);
  }
}

function updateTransaction(data) {
  // Send the updated data to the server using fetch
  fetch("/editExpense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Transaction updated:", data);
      // Optionally update the UI based on the response

      alert("Transaction updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating transaction:", error);
      alert(`Error: ${error.message}`);
    });
}

// Function to delete an expense
function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        fetch("/deleteExpense", {
            method: "DELETE", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                document.querySelector(`.expense-item[data-id='${id}']`).remove(); // Remove the expense item from the DOM
            } else {
                alert(data.message); // Show error message
            }
        })
        .catch(error => {
            console.error("Error deleting expense:", error);
            alert("Error deleting expense!");
        });
    }
}
