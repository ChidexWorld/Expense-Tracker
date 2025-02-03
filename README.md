# Expense Tracker App

## Overview

The Expense Tracker App is a web-based application designed to help users manage and categorize their expenses. The app provides a user-friendly interface for logging expenses, setting budgets, and viewing visual expense reports.

## Features

### User Authentication

- User registration with email and password
- Login and password recovery functionality

### Expense Management

- Log expenses with date, category, description, and amount
- Categorize expenses into predefined categories (e.g., food, transportation, entertainment)
- Edit and delete logged expenses

### Budgeting

- Set budgets for specific categories or overall expenses
- Track expenses against set budgets

### Reporting

- View visual reports using bar charts, pie charts, and line graphs
- Get an expense summary, including total amount spent and percentage of budget used

### Additional Features

- Search for expenses by date, category, or description
- Sort expenses by date, category, or amount

## Tech Stack

### Frontend

- EJS (Embedded JavaScript) for templating
- CSS for styling
- JavaScript for client-side interactions

### Backend

- Node.js for server-side runtime
- Express.js as the web framework
- MySQL as the database (hosted on Aiven Console)

## Hosting

- The app is hosted on [Render.com](https://render.com/)
- The database is hosted on Aiven Console

## Installation

### Prerequisites

- Node.js and npm installed
- MySQL database setup

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/ChidexWorld/expense-tracker.git
   ```
2. Navigate to the project directory:
   ```sh
   cd expense-tracker
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Create a `.env` file and configure database credentials:
   ```sh
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_PORT=your_port_no
   ```
5. Start the server:
   ```sh
   npm start
   ```

## Usage

- Open `http://localhost:3000` in your browser to access the app.
- Register or log in to start tracking expenses.

## Roadmap

-

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, reach out to [ChidexWorld](https://github.com/ChidexWorld).
