import React, { useEffect, useState } from "react";
import axios from "axios";
import NewGroupForm from "./components/NewGroupForm";
import NewExpenseForm from "./components/NewExpenseForm";
import NewUserForm from "./components/newUserForm";

const API_BASE_URL = "http://localhost:8080/api";

function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);

  // -------------------- FETCH FUNCTIONS --------------------
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err.response?.data || err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  const fetchExpenses = async (groupId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err.message);
    }
  };

  // -------------------- DELETE FUNCTIONS --------------------
  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`${API_BASE_URL}/groups/${groupId}`);
      fetchGroups();
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (err) {
      console.error("Error deleting group:", err.response?.data || err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`);
      fetchExpenses(selectedGroup.id);
    } catch (err) {
      console.error("Error deleting expense:", err.response?.data || err.message);
    }
  };

  // -------------------- EFFECTS --------------------
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchExpenses(selectedGroup.id);
  }, [selectedGroup]);

  // -------------------- RENDER --------------------
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Expense Splitter</h1>

      {/* CREATE NEW USER */}
      <NewUserForm onUserCreated={fetchUsers} />
      {/* USERS LIST */}
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDeleteUser(user.id)} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* CREATE NEW GROUP */}
      <NewGroupForm users={users} onGroupCreated={fetchGroups} />

      

      {/* GROUPS LIST */}
      <h2>Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <button onClick={() => setSelectedGroup(group)}>{group.name}</button>
            <button onClick={() => handleDeleteGroup(group.id)} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* SELECTED GROUP EXPENSES */}
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
                {exp.description} — ${exp.amount} (Paid by {exp.paidBy?.name || "Unknown"})
                <button
                  onClick={() => handleDeleteExpense(exp.id)}
                  style={{ marginLeft: "1rem" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
