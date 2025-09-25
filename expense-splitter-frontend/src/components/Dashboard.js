import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faPlus, faBan, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'; // Import arrow icons
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

// Define a permanent list of colors 
const COLORS_LIST = [
  '#0cb0a9', // Housing
  '#f78c6b', // Food
  '#06d6a0', // Transportation
  '#ffd166', // Utilities
  '#118ab2', // Personal Care
  '#ef476f', // Debt
  '#0c637f', // Entertainment
  '#83d483', // Income
  '#073b4c', // Other
];

// Create the Category-to-Color Map
const CATEGORY_COLOR_MAP = EXPENSE_CATEGORIES.reduce((map, category, index) => {
  map[category] = COLORS_LIST[index % COLORS_LIST.length];
  return map;
}, {});

// Helper function to format today's date and current time in the required YYYY-MM-DDTHH:MM format
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

const ITEMS_PER_PAGE = 5; // Define the max number of items to show

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[8]); 
  const [amount, setAmount] = useState("");
  const [transactionDateTime, setTransactionDateTime] = useState(getCurrentDateTimeString()); 
  
  // NEW STATE: Tracks the starting index for the paginated view
  const [startIndex, setStartIndex] = useState(0); 

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
      setTransactionDateTime(getCurrentDateTimeString());
      setShowAddForm(false);
      // Reset index to 0 so the new expense appears at the top
      setStartIndex(0); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses", user.id] }),
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount) return; 

    addMutation.mutate({ 
        description: description || null, 
        amount: parseFloat(amount), 
        category: category,
        date: transactionDateTime 
    });
  };

  const onLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    navigate("/login");  
  }

  // --- Financial Calculations (Same) ---
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

  // Prepare data for the Pie Chart 
  const expenseByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    if (cat !== "Income") {
      const currentAmount = acc[cat] ? acc[cat] : 0;
      acc[cat] = currentAmount + Math.abs(exp.amount);
    }
    return acc;
  }, {});

  const pieChartData = Object.keys(expenseByCategory).map(key => ({
    name: `${key}: $${expenseByCategory[key].toFixed(2)}`, 
    categoryName: key,
    value: expenseByCategory[key],
  }));
  // --- End Financial Calculations ---

  const sortedTransactions = [...expenses].sort((a, b) => 
    new Date(b.date) - new Date(a.date) 
  );

  const handleToggleAddForm = () => {
    // If we are currently hiding the form, we want to show it and set the current time.
    if (!showAddForm) {
      setTransactionDateTime(getCurrentDateTimeString());
    }
    setShowAddForm(!showAddForm);
  };
  
  // --- PAGINATION LOGIC ---
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const transactionsToShow = sortedTransactions.slice(startIndex, endIndex);

  const isPrevDisabled = startIndex === 0;
  const isNextDisabled = endIndex >= sortedTransactions.length;

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - ITEMS_PER_PAGE));
  };

  const handleNext = () => {
    const newStartIndex = startIndex + ITEMS_PER_PAGE;
    
    const maxValidStartIndex = sortedTransactions.length - (sortedTransactions.length % ITEMS_PER_PAGE);
    
    if (newStartIndex < sortedTransactions.length) {
      setStartIndex(newStartIndex);
    } else {
      
      setStartIndex(Math.max(0, maxValidStartIndex));
    }
  };
  // --- END PAGINATION LOGIC ---

  
  if (!user) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading expenses...</p>;


  return (
    <div style={{ padding: "2rem" }}>
      {/* Welcome + Logout (Same) */}
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
          onClick={handleToggleAddForm}
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
          {showAddForm ? " Cancel" : " Add Transaction"}
        </button>
      </div>

      {/* Add Expense Form (Same) */}
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
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit">
              {addMutation.isPending ? "Adding..." : "Add Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Pie Chart Card (Same) */}
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

      {/* UPDATED TRANSACTION HISTORY WITH SLIDER */}
      <div className="dashboard-card">
        <h3>Transaction History</h3>
        {sortedTransactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {/* RENDER ONLY THE SLICED TRANSACTIONS */}
              {transactionsToShow.map((exp) => (
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
                    
                    {/* Category Name & Optional Description */}
                    <div style={{ lineHeight: '1.2' }}>
                      <span style={{ fontWeight: 600 }}>
                        {exp.category}
                      </span>
                      <br />
                      <span style={{ fontSize: '0.85rem', color: exp.description ? '#666' : '#999' }}>
                        {exp.description || `(No Description)`}
                      </span>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>
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

            {/* Pagination Controls (Slider) */}
            {sortedTransactions.length > ITEMS_PER_PAGE && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '1rem',
                alignItems: 'center'
              }}>
                <button
                  onClick={handlePrev}
                  disabled={isPrevDisabled}
                  style={{ opacity: isPrevDisabled ? 0.5 : 1, width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <span style={{fontSize: '0.9rem', color: '#555'}}>
                  Showing {startIndex + 1} - {Math.min(endIndex, sortedTransactions.length)} of {sortedTransactions.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  style={{ opacity: isNextDisabled ? 0.5 : 1, width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* END UPDATED TRANSACTION HISTORY */}

    </div>
  );
}

export default Dashboard;