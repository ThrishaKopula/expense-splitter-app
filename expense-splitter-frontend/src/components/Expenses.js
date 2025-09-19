import React from "react";

function Expenses({ expenses }) {
  return (
    <div>
      <h4>Expenses:</h4>
      <ul>
        {expenses.map(e => (
          <li key={e.id}>
            {e.description}: ${e.amount} paid by {e.paidBy.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
