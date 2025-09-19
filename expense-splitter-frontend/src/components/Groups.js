import React, { useEffect, useState } from "react";
import { getGroups, getGroupExpenses, getGroupBalances, getGroupSettle } from "../api/api";
import Expenses from "./Expenses";
import Balances from "./Balances";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    getGroups()
      .then(res => setGroups(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);

    // Fetch expenses
    getGroupExpenses(group.id)
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));

    // Fetch balances
    getGroupBalances(group.id)
      .then(res => setBalances(res.data))
      .catch(err => console.error(err));
  };

  const handleSettle = () => {
    if (!selectedGroup) return;
    getGroupSettle(selectedGroup.id)
      .then(res => {
        setBalances(res.data);
        alert("Settled!");
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Groups</h2>
      <ul>
        {groups.map(g => (
          <li key={g.id} onClick={() => handleSelectGroup(g)} style={{ cursor: "pointer" }}>
            {g.name}
          </li>
        ))}
      </ul>

      {selectedGroup && (
        <div>
          <h3>{selectedGroup.name}</h3>
          <Expenses expenses={expenses} />
          <Balances balances={balances} />
          <button onClick={handleSettle}>Settle</button>
        </div>
      )}
    </div>
  );
}

export default Groups;
