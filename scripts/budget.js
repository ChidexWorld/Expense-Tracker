const categoryForm = document.getElementById("categoryForm");
const overallForm = document.getElementById("overallForm");
const categoryRadio = document.getElementById("categoryRadio");
const overallRadio = document.getElementById("overallRadio");

// Function to toggle form inputs
function toggleForms() {
  if (categoryRadio.checked) {
    enableForm(categoryForm);
    disableForm(overallForm);
  } else if (overallRadio.checked) {
    enableForm(overallForm);
    disableForm(categoryForm);
  }
}

// Function to disable form inputs
function disableForm(form) {
  Array.from(form.elements).forEach((input) => {
    input.disabled = true;
  });
}

// Function to enable form inputs
function enableForm(form) {
  Array.from(form.elements).forEach((input) => {
    input.disabled = false;
  });
}

// Set the initial state to "Overall Budget"
overallRadio.checked = true; 

// Attach event listeners to radio buttons
categoryRadio.addEventListener("change", toggleForms);
overallRadio.addEventListener("change", toggleForms);

// Initialize the forms based on default radio button selection
toggleForms();
