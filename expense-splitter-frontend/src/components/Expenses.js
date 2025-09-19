import React from "react";
import NewExpenseForm from "./NewExpenseForm";

function Expenses({ group, expenses, onExpenseCreated, onDeleteExpense }) {
  if (!group) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Group: {group.name}</h2>

      <NewExpenseForm groupId={group.id} onExpenseCreated={onExpenseCreated} />

      <h3>Expenses</h3>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.description} — ${exp.amount} (Paid by {exp.paidBy?.name || "Unknown"})
            <button
              onClick={() => onDeleteExpense(exp.id)}
              style={{ marginLeft: "1rem" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
