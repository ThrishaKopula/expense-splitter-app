// src/components/Dashboard/index.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getExpenses, createExpense, deleteExpense, updateExpense } from "../../api/api"; // <-- Adjust path if needed

// Import new components
import WelcomeCard from "./WelcomeCard";
import SummaryCard from "./SummaryCard";
import AddTransactionForm from "./AddTransactionForm";
import FilterControls from "./FilterControls";
import ChartCard from "./ChartCard";
import TransactionList from "./TransactionList";
import EditModal from "./EditModal";

// Import constants and utils
import { EXPENSE_CATEGORIES, ITEMS_PER_PAGE } from './constants';
import { getTodayDateOnlyString, filterTransactionsByPeriod } from './utils';
import "./Dashboard.css"; // Correct path to CSS file

function Dashboard({ user, setCurrentUser }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State management
    const [showAddForm, setShowAddForm] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [filterPeriod, setFilterPeriod] = useState('MONTHLY');
    const [selectedDate, setSelectedDate] = useState(getTodayDateOnlyString());

    // Data Fetching
    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ["expenses", user?.id],
        queryFn: () => getExpenses(user.id),
        enabled: !!user,
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: (newExpense) => createExpense(user.id, newExpense),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses", user.id] });
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

    // Event Handlers
    const onLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
        navigate("/login");
    };

    const handleToggleAddForm = (filter = 'ALL') => {
        if (!showAddForm) {
            setCategoryFilter(filter);
        } else {
            setCategoryFilter('ALL');
        }
        setShowAddForm(!showAddForm);
    };
    
    const handleAddExpense = (expenseData) => {
        addMutation.mutate(expenseData);
    };

    const handleStartEdit = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleUpdateExpense = (updateData) => {
        updateMutation.mutate(updateData);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleFilterPeriodChange = (period) => {
        setFilterPeriod(period);
        setSelectedDate(getTodayDateOnlyString());
        setStartIndex(0);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setStartIndex(0);
    };

    const handleTimeBlockChange = (direction) => {
        const parts = selectedDate.split('-').map(Number);
        const currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const amount = direction === 'PREV' ? -1 : 1;

        switch (filterPeriod) {
            case 'DAILY': currentDate.setDate(currentDate.getDate() + amount); break;
            case 'WEEKLY': currentDate.setDate(currentDate.getDate() + (amount * 7)); break;
            case 'MONTHLY': currentDate.setMonth(currentDate.getMonth() + amount); break;
            case 'YEARLY': currentDate.setFullYear(currentDate.getFullYear() + amount); break;
            default: return;
        }

        const newYear = currentDate.getFullYear();
        const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const newDay = String(currentDate.getDate()).padStart(2, '0');
        setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
        setStartIndex(0);
    };
    
    const handleDropdownDateChange = (type, value) => {
        const parts = selectedDate.split('-').map(Number);
        let d = new Date(parts[0], parts[1] - 1, parts[2]);
        
        if (type === 'MONTH') {
            const newMonthIndex = parseInt(value, 10) - 1;
            d.setDate(1); 
            d.setMonth(newMonthIndex);
        } else if (type === 'YEAR') {
            const newYear = parseInt(value, 10);
            d = new Date(d.getFullYear(), d.getMonth(), 1); 
            d.setFullYear(newYear);
        }
    
        const newYearStr = d.getFullYear();
        const newMonthStr = String(d.getMonth() + 1).padStart(2, '0');
        const newDayStr = '01'; 
        setSelectedDate(`${newYearStr}-${newMonthStr}-${newDayStr}`);
        setStartIndex(0);
    };

    // Derived Data and Calculations
    const getFilteredCategories = () => {
        if (categoryFilter === 'INCOME') return EXPENSE_CATEGORIES.filter(cat => cat === 'Income');
        if (categoryFilter === 'EXPENSE') return EXPENSE_CATEGORIES.filter(cat => cat !== 'Income');
        return EXPENSE_CATEGORIES;
    };
    
    const filteredTransactions = filterTransactionsByPeriod(expenses, filterPeriod, selectedDate);
    
    const totalIncome = filteredTransactions.reduce((sum, exp) => exp.category === "Income" ? sum + Math.abs(exp.amount) : sum, 0);
    const totalExpense = filteredTransactions.reduce((sum, exp) => exp.category !== "Income" ? sum + Math.abs(exp.amount) : sum, 0);
    const totalBalance = totalIncome - totalExpense;

    const expenseByCategory = filteredTransactions.reduce((acc, exp) => {
        if (exp.category !== "Income") {
            const cat = exp.category || "Other";
            acc[cat] = (acc[cat] || 0) + Math.abs(exp.amount);
        }
        return acc;
    }, {});

    const pieChartData = Object.keys(expenseByCategory).map(key => ({
        name: `${key}: $${expenseByCategory[key].toFixed(2)}`,
        categoryName: key,
        value: expenseByCategory[key],
    }));

    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render Logic
    if (!user) return <p>Loading user...</p>;
    if (isLoading) return <p>Loading expenses...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <WelcomeCard user={user} onLogout={onLogout} />

            <SummaryCard
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                onToggleAddForm={handleToggleAddForm}
            />

            {showAddForm && (
                <AddTransactionForm
                    onAddExpense={handleAddExpense}
                    onToggleAddForm={handleToggleAddForm}
                    getFilteredCategories={getFilteredCategories}
                    addMutation={addMutation}
                />
            )}

            <FilterControls
                filterPeriod={filterPeriod}
                selectedDate={selectedDate}
                onFilterPeriodChange={handleFilterPeriodChange}
                onDateChange={handleDateChange}
                onTimeBlockChange={handleTimeBlockChange}
                onDropdownDateChange={handleDropdownDateChange}
            />

            <ChartCard
                pieChartData={pieChartData}
                totalExpense={totalExpense}
                filterPeriod={filterPeriod}
                selectedDate={selectedDate}
            />

            <TransactionList
                transactions={sortedTransactions}
                filterPeriod={filterPeriod}
                selectedDate={selectedDate}
                onStartEdit={handleStartEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onPrev={() => setStartIndex(Math.max(0, startIndex - ITEMS_PER_PAGE))}
                onNext={() => setStartIndex(startIndex + ITEMS_PER_PAGE)}
                startIndex={startIndex}
                deleteMutation={deleteMutation}
                updateMutation={updateMutation}
            />

            <EditModal
                isOpen={isModalOpen}
                editingExpense={editingExpense}
                onUpdate={handleUpdateExpense}
                onClose={handleCloseModal}
                updateMutation={updateMutation}
            />
        </div>
    );
}

export default Dashboard;