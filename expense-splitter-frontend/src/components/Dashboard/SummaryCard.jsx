// src/components/Dashboard/SummaryCard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function SummaryCard({ totalBalance, totalIncome, totalExpense, onToggleAddForm }) {
    return (
        <div className="dashboard-card" style={{
            backgroundImage: 'linear-gradient(135deg, #355070 0%, #6d597a 100%)', color: 'white',
            padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            {/* TOP ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'start' }}>
                    <p style={{ fontSize: '1rem', margin: '0 0 5px 0', fontWeight: 500 }}>Current Balance</p>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, color: totalBalance < 0 ? '#ffcccc' : 'white' }}>
                        ${totalBalance.toFixed(2)}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1rem' }}>
                    <div style={{ textAlign: 'end' }}>
                        <span>Income:</span>
                        <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '1.3rem' }}>${totalIncome.toFixed(2)}</span>
                    </div>
                    <div style={{ textAlign: 'end' }}>
                        <span>Expense:</span>
                        <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '1.3rem' }}>${totalExpense.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            {/* BOTTOM ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', paddingTop: '1rem' }}>
                <button 
                    onClick={() => onToggleAddForm('INCOME')}
                    className="summary-button income" // Styles are now applied via these classes
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Income
                </button>
                
                <button 
                    onClick={() => onToggleAddForm('EXPENSE')}
                    className="summary-button expense" // Styles are now applied via these classes
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Expense
                </button>
            </div>
        </div>
    );
}

export default SummaryCard;