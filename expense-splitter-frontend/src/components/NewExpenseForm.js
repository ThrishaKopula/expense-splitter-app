import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function NewExpenseForm({ onExpenseCreated }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/groups`).then(res => setGroups(res.data));
    axios.get(`${API_BASE_URL}/users`).then(res => setUsers(res.data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/expenses`, {
      description,
      amount: parseFloat(amount),
      groupId,
      paidByUserId
    })
      .then(res => {
        alert("Expense created!");
        onExpenseCreated(res.data);
        setDescription(""); setAmount(""); setGroupId(""); setPaidByUserId("");
      })
      .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Expense</h3>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
      />
      <select value={groupId} onChange={e => setGroupId(e.target.value)} required>
        <option value="">Select Group</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <select value={paidByUserId} onChange={e => setPaidByUserId(e.target.value)} required>
        <option value="">Paid by</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default NewExpenseForm;
