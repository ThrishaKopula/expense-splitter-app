import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faPlus, faBan } from '@fortawesome/free-solid-svg-icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'; 
import "./Dashboard.css";

const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Personal Care",
  "Debt",
  "Entertainment",
  "Income", 
  "Other",
];

// Define a permanent list of colors (you can adjust these)
const COLORS_LIST = [
  '#0cb0a9', // Housing ttt
  '#f78c6b', // Food ttt
  '#06d6a0', // Transportation ttt
  '#ffd166', // Utilities ttt
  '#118ab2', // Personal Care ttt
  '#ef476f', // Debt ttt
  '#0c637f', // Entertainment ttt
  '#83d483', // Income ttt
  '#073b4c', // Other ttt
];

// 🎨 NEW: Create the Color Map
const CATEGORY_COLOR_MAP = EXPENSE_CATEGORIES.reduce((map, category, index) => {
  map[category] = COLORS_LIST[index % COLORS_LIST.length];
  return map;
}, {});

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[8]);
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
      setCategory(EXPENSE_CATEGORIES[8]); 
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
    addMutation.mutate({ description, amount: parseFloat(amount), category: category });
  };

  const onLogout = () => {
    setCurrentUser(null);        // clear state
    localStorage.removeItem("currentUser"); // clear persisted user
    navigate("/login");  
  }

  // --- Financial Calculations ---
  const totalIncome = expenses.reduce((sum, expense) => {
    if (expense.category === "Income") {
      return sum + Math.abs(expense.amount);
    }
    return sum;
  }, 0);

  const totalExpense = expenses.reduce((sum, expense) => {
    if (expense.category !== "Income") {
      return sum + Math.abs(expense.amount);
    }
    return sum;
  }, 0);

  const totalBalance = totalIncome - totalExpense;

  // 2. Prepare data for the Pie Chart
  const expenseByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    // Only include non-income transactions in the expense chart
    if (cat !== "Income") {
      const currentAmount = acc[cat] ? acc[cat] : 0;
      acc[cat] = currentAmount + Math.abs(exp.amount);
    }
    return acc;
  }, {});

  const pieChartData = Object.keys(expenseByCategory).map(key => ({
    name: `${key}: $${expenseByCategory[key].toFixed(2)}`, 
    categoryName: key, // 2. Add categoryName key for color lookup
    value: expenseByCategory[key],
  }));
  // --- End Financial Calculations ---

  const groupedExpenses = expenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    if (!acc[cat]) acc = { ...acc, [cat]: [] }; // Use spread operator for better immutability
    acc[cat].push(exp);
    return acc;
  }, {});

  if (!user) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading expenses...</p>;


  return (
    <div style={{ padding: "2rem" }}>
      {/* Welcome + Logout */}
      <div className="dashboard-card" style={{ position: "relative" }}>
        <h2>Welcome, {user.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: totalBalance < 0 ? 'darkred' : 'darkgreen', margin: 0 }}>
              Balance: ${totalBalance.toFixed(2)}
          </h3>
          <h3 style={{ color: 'green', margin: 0 }}>
              Income: ${totalIncome.toFixed(2)}
          </h3>
          <h3 style={{ color: 'red', margin: 0 }}>
              Expense: ${totalExpense.toFixed(2)}
          </h3>
          
        </div>
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required 
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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

      {/* --- NEW PIE CHART CARD --- */}
      {/* Pie Chart Card (Updated) */}
      <div className="dashboard-card">
        <h3>Expense Breakdown</h3>
        {totalExpense === 0 ? (
          <p>Add expenses to see the breakdown chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="35%" 
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                fill="#8884d8"
              >
                {/* 3. Use the CATEGORY_COLOR_MAP to set the fill color */}
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLOR_MAP[entry.categoryName]} 
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical" 
                wrapperStyle={{ 
                  paddingLeft: '20px', 
                  fontSize: '14px', 
                  lineHeight: '20px' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* --- END NEW PIE CHART CARD --- */}

      {/* Expenses List */}
      <div className="dashboard-card">
        <h3>Your Expenses</h3>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          Object.entries(groupedExpenses).map(([cat, exps]) => (
            <div key={cat.toUpperCase} style={{ marginBottom: "1rem" }}>
              <h4 style={{ borderBottom: "1px solid #ccc" }}>{cat}</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {exps.map((exp) => (
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
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;
