// src/components/Dashboard/FilterControls.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FILTER_PERIODS } from './constants';
import { generateFixedMonths, generateFixedYears, getDisplayTime } from './utils';

const FIXED_YEARS = generateFixedYears();
const FIXED_MONTHS = generateFixedMonths();

function FilterControls({ filterPeriod, selectedDate, onFilterPeriodChange, onDateChange, onTimeBlockChange, onDropdownDateChange }) {
    return (
        <div className="dashboard-card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {FILTER_PERIODS.map(period => (
                    <button
                        key={period}
                        onClick={() => onFilterPeriodChange(period)}
                        className={`filter-button ${filterPeriod === period ? 'active' : ''}`}
                    >
                        {period}
                    </button>
                ))}
            </div>

            {filterPeriod !== 'ALL TIME' && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {filterPeriod === 'MONTHLY' || filterPeriod === 'YEARLY' ? (
                            <div style={{ display: 'flex', gap: '10px', flexGrow: 1, justifyContent: 'center' }}>
                                {filterPeriod === 'MONTHLY' && (
                                    <select
                                        value={selectedDate ? selectedDate.substring(5, 7) : ''}
                                        onChange={(e) => onDropdownDateChange('MONTH', e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                    >
                                        {FIXED_MONTHS.map(month => (
                                            <option key={month.value} value={month.value}>{month.label}</option>
                                        ))}
                                    </select>
                                )}
                                <select
                                    value={selectedDate ? selectedDate.substring(0, 4) : ''}
                                    onChange={(e) => onDropdownDateChange('YEAR', e.target.value)}
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                >
                                    {FIXED_YEARS.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => onTimeBlockChange('PREV')} className="arrow-button">
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => onDateChange(e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '150px' }}
                                />
                                <button onClick={() => onTimeBlockChange('NEXT')} className="arrow-button">
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </>
                        )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                        Current View: <span style={{ fontWeight: 600 }}>{getDisplayTime(filterPeriod, selectedDate)}</span>
                    </p>
                </div>
            )}
        </div>
    );
}

export default FilterControls;