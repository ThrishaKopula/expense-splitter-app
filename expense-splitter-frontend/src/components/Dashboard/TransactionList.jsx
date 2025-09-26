// src/components/Dashboard/TransactionList.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CATEGORY_COLOR_MAP, ITEMS_PER_PAGE } from './constants';
import { getDisplayTime } from './utils';

function TransactionList({
    transactions, filterPeriod, selectedDate, onStartEdit,
    onDelete, onPrev, onNext, startIndex,
    deleteMutation, updateMutation
}) {
    const displayTime = getDisplayTime(filterPeriod, selectedDate);
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const transactionsToShow = transactions.slice(startIndex, endIndex);

    const isPrevDisabled = startIndex === 0;
    const isNextDisabled = endIndex >= transactions.length;

    return (
        <div className="dashboard-card">
            <h3>Transaction History ({filterPeriod !== 'ALL TIME' ? displayTime : 'All Time'})</h3>
            {transactions.length === 0 ? (
                <p>No transactions found for the selected period.</p>
            ) : (
                <>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {transactionsToShow.map((exp) => (
                            <li key={exp.id} className="transaction-item">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: '12px', height: '12px',
                                        backgroundColor: CATEGORY_COLOR_MAP[exp.category || "Other"],
                                        borderRadius: '3px', flexShrink: 0
                                    }}></div>
                                    <div style={{ lineHeight: '1.2' }}>
                                        <span style={{ fontWeight: 600 }}>{exp.category}</span><br />
                                        <span style={{ fontSize: '0.85rem', color: exp.description ? '#666' : '#999' }}>
                                            {exp.description || exp.category}
                                        </span><br />
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                            {exp.date ? new Date(exp.date).toLocaleString() : 'N/A Date'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <span style={{ fontWeight: 600, color: exp.category === "Income" ? 'green' : 'red' }}>
                                        {exp.category === "Income" ? '+' : '-'} ${Math.abs(exp.amount).toFixed(2)}
                                    </span>
                                    <button onClick={() => onStartEdit(exp)} className="action-button edit"
                                        disabled={deleteMutation.isPending || updateMutation.isPending}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button onClick={() => onDelete(exp.id)} className="action-button delete"
                                        disabled={deleteMutation.isPending || updateMutation.isPending}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {transactions.length > ITEMS_PER_PAGE && (
                        <div className="pagination-controls">
                            <button onClick={onPrev} disabled={isPrevDisabled} style={{ opacity: isPrevDisabled ? 0.5 : 1 }}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <span>
                                Showing {startIndex + 1} - {Math.min(endIndex, transactions.length)} of {transactions.length}
                            </span>
                            <button onClick={onNext} disabled={isNextDisabled} style={{ opacity: isNextDisabled ? 0.5 : 1 }}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TransactionList;