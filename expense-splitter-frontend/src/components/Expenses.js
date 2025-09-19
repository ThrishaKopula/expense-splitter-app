// src/components/Expenses.js
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "../api/api";

function Expenses({ group }) {
  const queryClient = useQueryClient();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch expenses for the given group
  const { data: expenses = [], error, isLoading } = useQuery({
    queryKey: ["expenses", group.id], // unique per group
    queryFn: () => getExpenses(group.id),
    enabled: !!group?.id, // only run if group is selected
  });

  // Create expense
  const createMutation = useMutation({
    mutationFn: (newExpense) => createExpense(group.id, newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", group.id] });
      setDesc("");
      setAmount("");
    },
  });

  // Delete expense
  const deleteMutation = useMutation({
    mutationFn: (expenseId) => deleteExpense(group.id, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", group.id] });
    },
  });

  if (!group) return <p>Select a group to view expenses.</p>;
  if (isLoading) return <p>Loading expenses...</p>;
  if (error) return <p>Error fetching expenses: {error.message}</p>;

  return (
    <div>
      <h2>Expenses for {group.name}</h2>

      {/* Add new expense */}
      <input
        type="text"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={() =>
          createMutation.mutate({ description: desc, amount: parseFloat(amount) })
        }
      >
        Add Expense
      </button>

      {/* List expenses */}
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.description} — ${exp.amount} (Paid by{" "}
            {exp.paidBy?.name || "Unknown"})
            <button onClick={() => deleteMutation.mutate(exp.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
