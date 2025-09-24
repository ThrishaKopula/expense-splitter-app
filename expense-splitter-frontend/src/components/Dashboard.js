import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "../api/api";

function Dashboard({ user, onLogout }) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: () => getExpenses(user.id),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (newExpense) => createExpense(user.id, newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user.id] });
      setDescription("");
      setAmount("");
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses", user.id] }),
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    addMutation.mutate({ description, amount: parseFloat(amount), category: null });
  };

  if (!user) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading expenses...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2>Welcome, {user.name}</h2>
        <button onClick={onLogout} style={{ padding: "0.5rem 1rem"}}>Logout</button>
      </div>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{ marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "green" }}
      >
        {showAddForm ? "Cancel" : "Add Expense"}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddExpense} style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            {addMutation.isPending ? "Adding..." : "Add Expense"}
          </button>
        </form>
      )}

      <h3>Your Expenses</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {expenses.map((exp) => (
            <li key={exp.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #ccc" }}>
              <span>{exp.description} - ${exp.amount.toFixed(2)}</span>
              <button 
              style={{ backgroundColor: "red", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px" }}
              onClick={() => deleteMutation.mutate(exp.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
