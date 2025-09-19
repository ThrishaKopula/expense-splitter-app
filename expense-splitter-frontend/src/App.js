import React, { useEffect, useState } from "react";
import axios from "axios";
import NewGroupForm from "./components/NewGroupForm";
import NewExpenseForm from "./components/NewExpenseForm";

const API_BASE_URL = "http://localhost:8080/api";

function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err.response?.data || err.message);
    }
  };

  // Fetch expenses for a group
  const fetchExpenses = async (groupId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err.message);
    }
  };

  // On mount load groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // When group changes, fetch its expenses
  useEffect(() => {
    if (selectedGroup) {
      fetchExpenses(selectedGroup.id);
    }
  }, [selectedGroup]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Expense Splitter</h1>

      {/* CREATE NEW GROUP */}
      <NewGroupForm onGroupCreated={() => fetchGroups()} />

      {/* LIST GROUPS */}
      <h2>Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <button onClick={() => setSelectedGroup(group)}>
              {group.name}
            </button>
          </li>
        ))}
      </ul>

      {/* SHOW EXPENSES + ADD NEW EXPENSE */}
      {selectedGroup && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Group: {selectedGroup.name}</h2>

          <NewExpenseForm
            groupId={selectedGroup.id}
            onExpenseCreated={() => fetchExpenses(selectedGroup.id)}
          />

          <h3>Expenses</h3>
          <ul>
            {expenses.map((exp) => (
              <li key={exp.id}>
                {exp.description} — ${exp.amount} (Paid by{" "}
                {exp.paidBy?.name || "Unknown"})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
