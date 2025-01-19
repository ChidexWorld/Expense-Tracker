function handleEnter(event, transactionId, element) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default Enter key behavior (creating a new line)
    element.blur(); // Remove focus from the editable element

    // Get the updated description
    const updatedDescription = element.innerText;

    // Send the updated data to the server using fetch
    fetch("/update-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: transactionId,
        description: updatedDescription,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Transaction updated:", data);
        // Optionally update the UI based on the response
      })
      .catch((error) => {
        console.error("Error updating transaction:", error);
      });
  }
}
