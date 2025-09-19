import React, { useState } from "react";
import axios from "axios";

function NewExpenseForm({ groupId, onExpenseCreated }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        paidByUserId: parseInt(paidByUserId, 10),
      };

      const res = await axios.post(
        `http://localhost:8080/api/groups/${groupId}/expenses`,
        payload
      );
      onExpenseCreated(res.data);

      setDescription("");
      setAmount("");
      setPaidByUserId("");
      setDate("");
    } catch (err) {
      console.error("Error creating expense:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Paid by User ID"
        value={paidByUserId}
        onChange={(e) => setPaidByUserId(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default NewExpenseForm;
