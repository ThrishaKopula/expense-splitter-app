import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faPlus, faBan } from '@fortawesome/free-solid-svg-icons';

import "./Dashboard.css";

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();
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

  const onLogout = () => {
    setCurrentUser(null);        // clear state
    localStorage.removeItem("currentUser"); // clear persisted user
    navigate("/login");  
  }

  const totalBalance = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!user) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading expenses...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      {/* Welcome + Logout */}
      <div className="dashboard-card" style={{ position: "relative" }}>
        <h2>Welcome, {user.name}</h2>
        <h3 style={{ color: totalBalance < 0 ? 'red' : 'green' }}>
            Balance: ${totalBalance.toFixed(2)}
        </h3>
        <button
          onClick={onLogout}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "white",
            backgroundColor: "#4eacff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout <FontAwesomeIcon icon={faRightFromBracket} />
          
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: showAddForm ? "darkred" : "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          <FontAwesomeIcon icon={showAddForm ? faBan : faPlus} />
          {showAddForm ? " Cancel" : " Add Expense"}
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="dashboard-card">
          <form onSubmit={handleAddExpense}>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit">
              {addMutation.isPending ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="dashboard-card">
        <h3>Your Expenses</h3>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((exp) => (
              <li
                key={exp.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>
                  {exp.description} - ${exp.amount.toFixed(2)}
                </span>
                <button
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                  }}
                  onClick={() => deleteMutation.mutate(exp.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
