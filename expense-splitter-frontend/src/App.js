import React, { useEffect, useState } from "react";
import {
  getGroups,
  getUsers,
  getExpenses,
  deleteGroup,
  deleteUser,
  deleteExpense,
} from "./api/api";
import Users from "./components/Users";
import Groups from "./components/Groups";
import Expenses from "./components/Expenses";

function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);

  // -------------------- FETCH --------------------
  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err.response?.data || err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  const fetchExpenses = async (groupId) => {
    try {
      const res = await getExpenses(groupId);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err.message);
    }
  };

  // -------------------- DELETE --------------------
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      fetchGroups();
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
    } catch (err) {
      console.error("Error deleting group:", err.response?.data || err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
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

      <Users users={users} onDeleteUser={handleDeleteUser} onUserCreated={fetchUsers} />

      <Groups
        groups={groups}
        users={users}
        onSelectGroup={setSelectedGroup}
        onDeleteGroup={handleDeleteGroup}
        onGroupCreated={fetchGroups}
      />

      <Expenses
        group={selectedGroup}
        expenses={expenses}
        onExpenseCreated={() => fetchExpenses(selectedGroup.id)}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
}

export default App;
