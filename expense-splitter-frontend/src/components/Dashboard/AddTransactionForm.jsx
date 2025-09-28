// src/components/Dashboard/AddTransactionForm.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { getCurrentDateTimeString } from './utils';

function AddTransactionForm({ initialCategory, onAddExpense, onToggleAddForm, getFilteredCategories, addMutation }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(initialCategory);
    const [transactionDateTime, setTransactionDateTime] = useState(getCurrentDateTimeString());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;
        onAddExpense({
            description: description || null,
            amount: parseFloat(amount),
            category: category,
            date: transactionDateTime
        });
        // Clear form after submission is handled by parent
    };

    return (
        <div className="dashboard-card">
            <form onSubmit={handleSubmit}>
                <input
                    type="datetime-local"
                    value={transactionDateTime}
                    onChange={(e) => setTransactionDateTime(e.target.value)}
                    required
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    {getFilteredCategories().map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
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
                <button type="button" onClick={() => onToggleAddForm('ALL')} style={{ backgroundColor: '#4eacff' }}>
                    <FontAwesomeIcon icon={faBan} /> Cancel
                </button>
            </form>
        </div>
    );
}

export default AddTransactionForm;