// src/components/Dashboard/EditModal.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { EXPENSE_CATEGORIES } from './constants';
import { formatApiDateForInput } from './utils';

function EditModal({ isOpen, editingExpense, onUpdate, onClose, updateMutation }) {
    // Hooks are now at the top level
    const [formData, setFormData] = useState(null);

    // This effect syncs the form state with the prop when the modal opens
    useEffect(() => {
        if (editingExpense) {
            setFormData({
                ...editingExpense,
                date: formatApiDateForInput(editingExpense.date)
            });
        }
    }, [editingExpense]);

    // Early return if modal is not open or data is not ready
    if (!isOpen || !formData) {
        return null;
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount) return;
        onUpdate({
            id: formData.id,
            updatedExpense: {
                description: formData.description || null,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date,
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="dashboard-card modal-content">
                <h3 style={{ marginBottom: '1.5rem' }}>Edit Transaction</h3>
                <button onClick={onClose} className="modal-close-button">
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <form onSubmit={handleSubmit} style={{ gap: '1rem' }}>
                    <input
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        required
                    />
                    <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} required >
                        {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={formData.description || ""}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        required
                    />
                    <button type="submit" disabled={updateMutation.isPending} style={{ backgroundColor: '#0cb0a9', marginTop: '1rem' }}>
                        <FontAwesomeIcon icon={faSave} /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    {/* <button type="button" onClick={onClose} style={{ backgroundColor: '#ef476f' }}>
                        Cancel
                    </button> */}
                </form>
            </div>
        </div>
    );
}

export default EditModal;