# PocketUp – Personal Budgeting App
Expense Splitter App is a full-stack personal finance and budgeting application designed to provide users with a clear, visual overview of their spending habits, income, and overall balance.

<img width="1600" height="900" alt="Screenshot 2025-10-08 at 5 43 14 PM" src="https://github.com/user-attachments/assets/a52efdfe-0433-476f-adc9-92e1eda13a27" />
<img width="1600" height="900" alt="Screenshot 2025-10-08 at 5 44 22 PM" src="https://github.com/user-attachments/assets/aeb32287-1c2f-45d2-934f-733981d8a764" />

## Features

### Unified Financial Dashboard

- Centralized view of finances

### Filtering & Visualization

- Period Selection: Easily switch between Daily, Weekly, Monthly, Yearly, and All Time views
- Dynamic Date Control: The filter adjusts based on the period selected
- Visual Breakdown: A dynamic Pie Chart immediately visualizes the expenditure breakdown by category for the selected time frame

### Quick Transaction Entry

- Dedicated "Add Income" and "Add Expense" buttons automatically filter the category dropdown, preventing errors (e.g., you cannot accidentally tag Housing as Income)
- Time Accuracy: Transactions default to the current date and time but allow instant adjustment

### Full Transaction Management (CRUD)

- Maintain accurate records with full CRUD (Create, Read, Update, Delete) functionality
- Use the Edit button (EDIT) to open a focused modal for updating the Category, Amount, Description, and Date/Time of any transaction

## Tech Stack

**Frontend:**  
- React, React Router, Axios

**Backend:**  
- Java 21, Spring Boot, Maven

**Database:**  
- PostgreSQL

**Authentication:**  
- Spring Security 6, OAuth2 (via Google)
  

## Local Development Setup

To run the application locally, ensure you have **Docker** and **Docker Compose** installed.


### 1. Run Services

From the project root directory (`expense-splitter-app/`), run:

```bash
docker compose up --build -d
```

### 2. Access the Application

Once the containers are running, open your browser and navigate to::

```bash
http://localhost:3000/
```


### 3. Clean Up

Once the containers are running, open your browser and navigate to::

```bash
docker compose down
```

