import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense, updateExpense } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faPlus, faBan, faChevronLeft, faChevronRight, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'; 
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

const FILTER_PERIODS = ['ALL TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

// Create the Category-to-Color Map (Same)
const CATEGORY_COLOR_MAP = EXPENSE_CATEGORIES.reduce((map, category, index) => {
  map[category] = COLORS_LIST[index % COLORS_LIST.length];
  return map;
}, {});

// Helper function to format date/time for input[datetime-local] (Same)
const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to format API date string to YYYY-MM-DDTHH:MM for input[datetime-local] (Same)
const formatApiDateForInput = (dateString) => {
    if (!dateString) return getCurrentDateTimeString();
    try {
        return new Date(dateString).toISOString().substring(0, 16);
    } catch {
        return dateString.substring(0, 16);
    }
};

// Helper to format date to YYYY-MM-DD string (Same)
const getTodayDateOnlyString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 🌟 NEW/UPDATED: Generate fixed periods 🌟
const generateFixedYears = (startYear = 2010) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year.toString());
    }
    return years;
};

const generateFixedMonths = () => {
    return Array.from({ length: 12 }, (item, i) => {
        const monthIndex = i+1;
        return {
            value: String(monthIndex).padStart(2, '0'), // 01, 02, ..., 12
            label: new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' }), // January, February, ...
        };
    });
};

const FIXED_YEARS = generateFixedYears();
const FIXED_MONTHS = generateFixedMonths();
// 🌟 END NEW/UPDATED 🌟


// In Dashboard.jsx

const filterTransactionsByPeriod = (transactions, period, selectedDate) => {
  if (period === 'ALL TIME') return transactions;

  // Manual parsing to avoid timezone shift (Parses as LOCAL midnight, not UTC)
  const parts = selectedDate.split('-').map(Number);
  const filterTime = new Date(parts[0], parts[1] - 1, parts[2]); // Year, Month (0-indexed), Day
  
  if (isNaN(filterTime.getTime())) return transactions;
  
  let startTime;
  let endTime;

  switch (period) {
    case 'DAILY':
        startTime = new Date(filterTime);
        startTime.setHours(0, 0, 0, 0); // Already local midnight due to manual parsing
        endTime = new Date(startTime);
        endTime.setDate(startTime.getDate() + 1);
        break;
    case 'WEEKLY':
        // Calculate start of the week relative to the parsed local date
        const day = filterTime.getDay(); // 0 is Sunday
        startTime = new Date(filterTime);
        startTime.setDate(filterTime.getDate() - day);
        startTime.setHours(0, 0, 0, 0);
        endTime = new Date(startTime);
        endTime.setDate(startTime.getDate() + 7);
        break;
    case 'MONTHLY':
        // Anchoring to the 1st day avoids month rollover issues
        startTime = new Date(filterTime.getFullYear(), filterTime.getMonth(), 1);
        endTime = new Date(filterTime.getFullYear(), filterTime.getMonth() + 1, 1);
        break;
    case 'YEARLY':
        startTime = new Date(filterTime.getFullYear(), 0, 1);
        endTime = new Date(filterTime.getFullYear() + 1, 0, 1);
        break;
    default:
      return transactions;
  }
  
  const startTimeMs = startTime.getTime();
  const endTimeMs = endTime.getTime();

  return transactions.filter(exp => {
    // Note: This relies on the transaction date string having timezone info or being correctly stored.
    const expDateMs = new Date(exp.date).getTime();
    return expDateMs >= startTimeMs && expDateMs < endTimeMs;
  });
};

const ITEMS_PER_PAGE = 5; 

// -------------------------------------------------------------
// Component Start
// -------------------------------------------------------------

function Dashboard({ user, setCurrentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[8]); 
  const [amount, setAmount] = useState("");
  const [transactionDateTime, setTransactionDateTime] = useState(getCurrentDateTimeString()); 
  const [startIndex, setStartIndex] = useState(0); 

  const [editingExpense, setEditingExpense] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [categoryFilter, setCategoryFilter] = useState('ALL'); 
  
  const [filterPeriod, setFilterPeriod] = useState('MONTHLY'); 
  // Initial selectedDate state should be a valid YYYY-MM-DD string
  const [selectedDate, setSelectedDate] = useState(getTodayDateOnlyString()); 

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: () => getExpenses(user.id),
    enabled: !!user,
  });

  // --- MUTATIONS (Same) ---
  const addMutation = useMutation({
    mutationFn: (newExpense) => createExpense(user.id, newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user.id] });
      setDescription("");
      setAmount("");
      setCategory(EXPENSE_CATEGORIES[8]); 
      setTransactionDateTime(getCurrentDateTimeString());
      setShowAddForm(false);
      setStartIndex(0); 
      setCategoryFilter('ALL'); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user.id] });
      setStartIndex(0); 
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, updatedExpense }) => updateExpense(id, updatedExpense),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses", user.id] });
        setIsModalOpen(false);
        setEditingExpense(null);
    },
  });
  // --- END MUTATIONS ---

  const getFilteredCategories = () => {
    if (categoryFilter === 'INCOME') {
      return EXPENSE_CATEGORIES.filter(cat => cat === 'Income');
    }
    if (categoryFilter === 'EXPENSE') {
      return EXPENSE_CATEGORIES.filter(cat => cat !== 'Income');
    }
    return EXPENSE_CATEGORIES;
  };

  const handleToggleAddForm = (filter = 'ALL') => {
    if (!showAddForm) {
      setTransactionDateTime(getCurrentDateTimeString());
      setCategoryFilter(filter);
      
      if (filter === 'INCOME') {
        setCategory('Income');
      } else if (filter === 'EXPENSE') {
        const defaultExpenseCat = EXPENSE_CATEGORIES.find(cat => cat !== 'Income') || 'Other';
        setCategory(defaultExpenseCat);
      } else {
        setCategory(EXPENSE_CATEGORIES[8]);
      }
    } else {
        setCategoryFilter('ALL');
    }

    setShowAddForm(!showAddForm);
    setEditingExpense(null);
    setIsModalOpen(false);
  };

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

  const startEdit = (expense) => {
    setEditingExpense({
      id: expense.id,
      description: expense.description || "",
      amount: expense.amount,
      category: expense.category,
      date: formatApiDateForInput(expense.date), 
    });
    setShowAddForm(false);
    setIsModalOpen(true);
  };

  const updateEditingField = (field, value) => {
    setEditingExpense(prev => ({
        ...prev,
        [field]: value
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingExpense.amount) return;

    updateMutation.mutate({
      id: editingExpense.id,
      updatedExpense: {
        description: editingExpense.description || null,
        amount: parseFloat(editingExpense.amount),
        category: editingExpense.category,
        date: editingExpense.date,
      }
    });
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const onLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    navigate("/login");  
  }

  // In Dashboard.jsx

// Determine the relevant date/time for display purposes
const getDisplayTime = () => {
    // 🌟 FIX: Parse the selectedDate string as a local date (YYYY-MM-DD).
    const parts = selectedDate.split('-').map(Number);
    // Create a new date anchored locally (prevents UTC conversion errors)
    const d = new Date(parts[0], parts[1] - 1, parts[2]); 
    
    if (isNaN(d.getTime())) return `${filterPeriod} (Invalid Date)`;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    switch (filterPeriod) {
        case 'DAILY':
            // Simply format the date, which is now correctly anchored
            return d.toLocaleDateString('en-US', options);
        case 'WEEKLY':
            // Calculation remains correct, but is anchored to the correct local date (d)
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'MONTHLY':
            // Only need month and year
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        case 'YEARLY':
            // Only need year
            return d.toLocaleDateString('en-US', { year: 'numeric' });
        default:
            return 'All Time';
    }
};


  // In Dashboard.jsx

// In Dashboard.jsx

// --- DYNAMIC NAVIGATION HANDLERS ---
const handleTimeBlockChange = (direction) => {
    // 1. Parse the current date *correctly* to avoid UTC shift
    const parts = selectedDate.split('-').map(Number);
    const currentDate = new Date(parts[0], parts[1] - 1, parts[2]); // Anchored locally to midnight

    // Use +/- 1 for direction
    const amount = direction === 'PREV' ? -1 : 1; 
    
    switch (filterPeriod) {
        case 'DAILY':
            // FIX: Change the date by exactly 1 day
            currentDate.setDate(currentDate.getDate() + amount);
            break;
        case 'WEEKLY':
            // FIX: Change the date by exactly 7 days
            currentDate.setDate(currentDate.getDate() + (amount * 7));
            break;
        case 'MONTHLY':
            // Changes the month
            currentDate.setMonth(currentDate.getMonth() + amount);
            break;
        case 'YEARLY':
            // Changes the year
            currentDate.setFullYear(currentDate.getFullYear() + amount);
            break;
        default:
            return;
    }
    
    // 2. Format the new date back to YYYY-MM-DD string
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newDay = String(currentDate.getDate()).padStart(2, '0');
    
    setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
    setStartIndex(0); // Reset pagination
};
// --- END DYNAMIC NAVIGATION HANDLERS ---
  

// In Dashboard.jsx

// HANDLER: Update selected date based on Month/Year dropdown change
const handleDropdownDateChange = (type, value) => {
    // 1. Create a NEW Date object based on the current selected date string
    const parts = selectedDate.split('-').map(Number);
    let d = new Date(parts[0], parts[1] - 1, parts[2]); 
    
    let newDate;
    if (type === 'MONTH') {
        // When setting the month, we explicitly keep the current year
        const newMonthIndex = parseInt(value, 10) - 1;
        
        // 🌟 FIX 1: Set the month, and then re-anchor the day to 1 to prevent rollover (e.g., from March 31st to February 1st)
        d.setDate(1); 
        d.setMonth(newMonthIndex);
        newDate = d;

    } else if (type === 'YEAR') {
        // 🌟 FIX 2: When setting the year, explicitly keep the current month and day.
        const newYear = parseInt(value, 10);
        
        // Create a new date object anchored to the 1st day of the current month
        d = new Date(d.getFullYear(), d.getMonth(), 1); 
        d.setFullYear(newYear);
        newDate = d;

    } else {
        return;
    }

    // 2. Format the new date back to YYYY-MM-DD string
    const finalDate = new Date(newDate);
    const newYearStr = finalDate.getFullYear();
    const newMonthStr = String(finalDate.getMonth() + 1).padStart(2, '0');
    // Ensure the day is always '01' for Month/Year filters to keep the anchor consistent
    const newDayStr = '01'; 

    setSelectedDate(`${newYearStr}-${newMonthStr}-${newDayStr}`);
    setStartIndex(0);
};
  // --- END DYNAMIC NAVIGATION HANDLERS ---


  // --- FILTERED TRANSACTIONS ---
  const filterDate = selectedDate || getTodayDateOnlyString();
  const filteredTransactions = filterTransactionsByPeriod(expenses, filterPeriod, filterDate);

  // 2. Financial Calculations now use filteredTransactions
  const totalIncome = filteredTransactions.reduce((sum, expense) => {
    if (expense.category === "Income") {
      return sum + Math.abs(expense.amount);
    }
    return sum;
  }, 0);

  const totalExpense = filteredTransactions.reduce((sum, expense) => {
    if (expense.category !== "Income") {
      return sum + Math.abs(expense.amount);
    }
    return sum;
  }, 0);

  const totalBalance = totalIncome - totalExpense;

  const expenseByCategory = filteredTransactions.reduce((acc, exp) => {
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

  // 3. Sorting uses filteredTransactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date) 
  );
  
  // --- PAGINATION LOGIC (Same) ---
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const transactionsToShow = sortedTransactions.slice(startIndex, endIndex);

  const isPrevDisabled = startIndex === 0;
  const isNextDisabled = endIndex >= sortedTransactions.length;

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - ITEMS_PER_PAGE));
  };

  const handleNext = () => {
    setStartIndex(startIndex + ITEMS_PER_PAGE);
  };
  // --- END PAGINATION LOGIC ---

  
  if (!user) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading expenses...</p>;


  return (
    <div style={{ padding: "2rem" }}>
      {/* 1. Welcome + Logout Card (Same) */}
      <div className="dashboard-card" style={{ position: "relative" }}>
        <h2>Welcome, {user.name}</h2>
        
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
      </div>

      {/* 2. COMBINED FINANCIAL SUMMARY & ACTIONS CARD (Same) */}
      <div 
        className="dashboard-card" 
        style={{ 
          backgroundImage: 'linear-gradient(135deg, #355070 0%, #6d597a 100%)', 
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* TOP ROW: Balance and Detailed Figures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          
          {/* Balance Column */}
          <div style={{ textAlign: 'start' }}>
            <p style={{ fontSize: '1rem', color: 'white', margin: '0 0 5px 0', fontWeight: 500 }}>
              Current Balance
            </p>
            <span 
              style={{ 
                fontSize: '2.5rem', 
                fontWeight: 700, 
                color: totalBalance < 0 ? '#ffcccc' : 'white'
              }}
            >
              ${totalBalance.toFixed(2)}
            </span>
          </div>
          
          {/* Income/Expense Mini-Columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1rem' }}>
            <div style={{ textAlign: 'end' }}>
              <span style={{ color: 'white', fontWeight: 500}}>Income:</span>
              <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '1.3rem' }}>${totalIncome.toFixed(2)}</span>
            </div>
            <div style={{ textAlign: 'end' }}>
              <span style={{ color: 'white', fontWeight: 500 }}>Expense:</span>
              <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '1.3rem' }}>${totalExpense.toFixed(2)}</span>
            </div>
          </div>

        </div>
        {/* END TOP ROW */}
        
        {/* BOTTOM ROW: Action Buttons - Call handleToggleAddForm with filter */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: '10px', 
          paddingTop: '1rem',
        }}>
          <button 
            onClick={() => handleToggleAddForm('INCOME')}
            style={{ 
              flex: 1, 
              backgroundColor: '#06d6a0', 
              color: 'white', 
              fontSize: '1rem',
              padding: '1rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Income
          </button>
          
          <button 
            onClick={() => handleToggleAddForm('EXPENSE')}
            style={{ 
              flex: 1, 
              backgroundColor: '#ef476f', 
              color: 'white', 
              fontSize: '1rem',
              padding: '1rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Expense
          </button>
        </div>
        {/* END BOTTOM ROW */}
      </div>
      {/* END COMBINED FINANCIAL SUMMARY & ACTIONS CARD */}

      {/* 3. Add Expense Form (Same) */}
      {showAddForm && (
        <div className="dashboard-card">
          <form onSubmit={handleAddExpense}>
            <input
                type="datetime-local"
                value={transactionDateTime}
                onChange={(e) => setTransactionDateTime(e.target.value)}
                required
            />
            
            {/* Filtered Category Select */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required 
            >
              {getFilteredCategories().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            
            
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add Transaction"}
            </button>
            <button type="button" onClick={() => handleToggleAddForm('ALL')} style={{backgroundColor: '#4eacff'}}>
                <FontAwesomeIcon icon={faBan} /> Cancel
            </button>
          </form>
        </div>
      )}
      {/* END Add Expense Form */}

      {/* 4. Period Filter Card (Main filter) */}
      <div className="dashboard-card">
        {/* <h3 style={{marginBottom: '1rem'}}>Filter Period</h3> */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center'}}>
          {FILTER_PERIODS.map(period => (
            <button
              key={period}
              onClick={() => { setFilterPeriod(period); setStartIndex(0); setSelectedDate(getTodayDateOnlyString()); }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: filterPeriod === period ? '#4eacff' : '#f0f0f0',
                color: filterPeriod === period ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                flexGrow: 1,
                minWidth: '100px',
                transition: 'background-color 0.2s'
              }}
            >
              {period}
            </button>
          ))}
        </div>
        
        {/* 🌟 DYNAMIC PERIOD SELECTION VIEW 🌟 */}
        {filterPeriod !== 'ALL TIME' && (
            <div style={{marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    
                    {/* Selectors for Monthly/Yearly */}
                    {filterPeriod === 'MONTHLY' || filterPeriod === 'YEARLY' ? (
                        // Multi-Dropdown View
                        <div style={{display: 'flex', gap: '10px', flexGrow: 1, justifyContent: 'center'}}>
                            {/* Month Dropdown (Only for Monthly filter) */}
                            {filterPeriod === 'MONTHLY' && (
                                <select
                                    value={selectedDate.substring(5, 7)} // MM part of YYYY-MM-DD
                                    onChange={(e) => handleDropdownDateChange('MONTH', e.target.value)}
                                    style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc'}}
                                >
                                    {FIXED_MONTHS.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Year Dropdown (For Monthly and Yearly filters) */}
                            <select
                                value={selectedDate.substring(0, 4)} // YYYY part of YYYY-MM-DD
                                onChange={(e) => handleDropdownDateChange('YEAR', e.target.value)}
                                style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc'}}
                            >
                                {FIXED_YEARS.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        // Daily/Weekly Navigation
                        <>
                            {/* Previous Button (for Daily/Weekly) */}
                            <button 
                                onClick={() => handleTimeBlockChange('PREV')}
                                className="arrow-button"
                                // Inline style adjustments (optional, but keep for size/flexibility)
                                style={{ minWidth: '40px', height: '40px' }} 
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>

                            {/* Date Picker Input */}
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setStartIndex(0); }}
                                style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '150px'}}
                            />
                            
                            {/* Next Button (for Daily/Weekly) */}
                            <button 
                                onClick={() => handleTimeBlockChange('NEXT')}
                                className="arrow-button"
                                // Inline style adjustments (optional, but keep for size/flexibility)
                                style={{ minWidth: '40px', height: '40px' }} 
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </>
                    )}
                </div>
                
                {/* Information text for context */}
                <p style={{fontSize: '0.9rem', color: '#666', marginTop: '10px'}}>
                    Current View: <span style={{fontWeight: 600}}>{getDisplayTime()}</span>
                </p>
            </div>
        )}
        {/* 🌟 END DYNAMIC PERIOD SELECTION VIEW 🌟 */}
      </div>
      {/* END Period Filter Card */}

      {/* 5. PIE CHART CARD (Full Width Row) */}
      <div 
        className="dashboard-card"
        style={{ 
          margin: '1.5rem auto'
        }}
      >
        <h3>Expense Breakdown ({filterPeriod !== 'ALL TIME' ? getDisplayTime() : 'All Time'})</h3>
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
      {/* END PIE CHART CARD */}

      {/* TRANSACTION HISTORY (Same) */}
      <div className="dashboard-card">
        <h3>Transaction History ({filterPeriod !== 'ALL TIME' ? getDisplayTime() : 'All Time'})</h3>
        {sortedTransactions.length === 0 ? (
          <p>No transactions found for the selected period.</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
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
                          width: '12px', height: '12px', 
                          backgroundColor: CATEGORY_COLOR_MAP[exp.category || "Other"],
                          borderRadius: '3px', flexShrink: 0
                        }}
                      ></div>
                      
                      {/* Category Name & Description */}
                      <div style={{ lineHeight: '1.2' }}>
                        <span style={{ fontWeight: 600 }}>{exp.category}</span>
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
                        
                        {/* Edit Button */}
                        <button
                            onClick={() => startEdit(exp)}
                            style={{
                                backgroundColor: '#118ab2',
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                cursor: 'pointer',
                                height: '40px'
                            }}
                            disabled={deleteMutation.isPending || updateMutation.isPending}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>

                        {/* Delete Button */}
                        <button
                            style={{
                                backgroundColor: "#ef476f",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                cursor: 'pointer',
                                height: '40px'
                            }}
                            onClick={() => deleteMutation.mutate(exp.id)}
                            disabled={deleteMutation.isPending || updateMutation.isPending}
                        >
                            <FontAwesomeIcon icon={faTimes} /> 
                        </button>
                    </div>
                  </li>
              ))}
            </ul>

            {/* Pagination Controls (Same) */}
            {sortedTransactions.length > ITEMS_PER_PAGE && (
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center'
              }}>
                <button
                  onClick={handlePrev} disabled={isPrevDisabled}
                  style={{ opacity: isPrevDisabled ? 0.5 : 1, width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <span style={{fontSize: '0.9rem', color: '#555'}}>
                  Showing {startIndex + 1} - {Math.min(endIndex, sortedTransactions.length)} of {sortedTransactions.length}
                </span>

                <button
                  onClick={handleNext} disabled={isNextDisabled}
                  style={{ opacity: isNextDisabled ? 0.5 : 1, width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT MODAL POP-UP (Same) */}
      {isModalOpen && editingExpense && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            className="dashboard-card"
            style={{ 
              maxWidth: '450px', 
              padding: '2rem', 
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 style={{marginBottom: '1.5rem'}}>Edit Transaction</h3>
            
            <button 
                onClick={cancelEdit} 
                style={{ 
                    position: 'absolute', top: '10px', right: '10px', 
                    background: 'none', border: 'none', color: '#666', 
                    cursor: 'pointer', padding: '0.5rem', 
                    backgroundColor: 'transparent'
                }}
            >
                <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            
            <form onSubmit={handleUpdate} style={{ gap: '1rem' }}>
                <input
                    type="datetime-local"
                    value={editingExpense.date}
                    onChange={(e) => updateEditingField('date', e.target.value)}
                    required
                />
                <select
                    value={editingExpense.category}
                    onChange={(e) => updateEditingField('category', e.target.value)}
                    required
                >
                    {/* The edit modal needs ALL categories available */}
                    {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Description (Optional)"
                    value={editingExpense.description || ""}
                    onChange={(e) => updateEditingField('description', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={editingExpense.amount}
                    onChange={(e) => updateEditingField('amount', e.target.value)}
                    required
                />
                
                <button type="submit" disabled={updateMutation.isPending} style={{ backgroundColor: '#0cb0a9', marginTop: '1rem' }}>
                    <FontAwesomeIcon icon={faSave} /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#ef476f' }}>
                    Cancel
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;