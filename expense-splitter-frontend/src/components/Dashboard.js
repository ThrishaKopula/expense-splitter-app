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

const getCurrentDateTimeString = () => {
    const now = new Date();
    // Get date part (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    // Get time part (HH:MM)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[8]);
  const [amount, setAmount] = useState("");
  const [transactionDateTime, setTransactionDateTime] = useState(getCurrentDateTimeString()); 

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
      setTransactionDateTime(getCurrentDateTimeString()); // Reset date to current day
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses", user.id] }),
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!category || !amount) return;
    addMutation.mutate({ 
        description: description || null, 
        amount: parseFloat(amount), 
        category: category,
        date: transactionDateTime // Send the date string (YYYY-MM-DD)
    });
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

  const sortedTransactions = [...expenses].sort((a, b) => 
    new Date(b.date) - new Date(a.date) 
  );

  // const groupedExpenses = expenses.reduce((acc, exp) => {
  //   const cat = exp.category || "Other";
  //   if (!acc[cat]) acc = { ...acc, [cat]: [] }; // Use spread operator for better immutability
  //   acc[cat].push(exp);
  //   return acc;
  // }, {});

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
            <input
                type="datetime-local"
                value={transactionDateTime}
                onChange={(e) => setTransactionDateTime(e.target.value)}
                required
            />
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

      {/* UPDATED TRANSACTION HISTORY */}
      <div className="dashboard-card">
        <h3>Transaction History</h3>
        {sortedTransactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sortedTransactions.map((exp) => (
              <li
                key={exp.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Color Square */}
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: CATEGORY_COLOR_MAP[exp.category || "Other"],
                      borderRadius: '3px',
                      flexShrink: 0
                    }}
                  ></div>
                  
                  {/* Category Name (Primary display) & Optional Description */}
                  <div style={{ lineHeight: '1.2' }}>
                    <span style={{ fontWeight: 600 }}>
                      {/* 2. Display Category Name as the main title */}
                      {exp.category}
                    </span>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: exp.description ? '#666' : '#999' }}>
                      {/* 3. Display Description below, or a fallback if empty */}
                      {exp.description || `(No Description)`}
                    </span>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                      {/* Displays the date/time */}
                      {exp.date ? new Date(exp.date).toLocaleString() : 'N/A Date'}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {/* Amount */}
                    <span style={{ 
                        fontWeight: 600,
                        color: exp.category === "Income" ? 'green' : 'red' 
                    }}>
                        {exp.category === "Income" ? '+' : '-'} ${Math.abs(exp.amount).toFixed(2)}
                    </span>
                    
                    {/* Delete Button */}
                    <button
                        style={{
                            backgroundColor: "#ef476f",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: 'pointer'
                        }}
                        onClick={() => deleteMutation.mutate(exp.id)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* END TRANSACTION HISTORY */}

    </div>
  );
}

export default Dashboard;
