import React from "react";

function Balances({ balances }) {
  if (!Array.isArray(balances)) return null; // prevent errors

  return (
    <div>
      <h4>Balances:</h4>
      <ul>
        {balances.map((b, idx) => (
          <li key={idx}>
            {b.from} pays {b.to}: ${b.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}


export default Balances;
