// src/components/Dashboard/ChartCard.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLOR_MAP } from './constants';
import { getDisplayTime } from './utils';

function ChartCard({ pieChartData, totalExpense, filterPeriod, selectedDate }) {
    const displayTime = getDisplayTime(filterPeriod, selectedDate);
    return (
        <div className="dashboard-card" style={{ margin: '1.5rem auto' }}>
            <h3>Expense Breakdown ({filterPeriod !== 'ALL TIME' ? displayTime : 'All Time'})</h3>
            {totalExpense === 0 ? (
                <p>Add expenses to see the breakdown chart.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieChartData} dataKey="value" nameKey="name"
                            cx="35%" cy="50%" innerRadius={50} outerRadius={80}
                            paddingAngle={5} fill="#8884d8"
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_COLOR_MAP[entry.categoryName]} />
                            ))}
                        </Pie>
                        <Legend verticalAlign="middle" align="right" layout="vertical"
                            wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default ChartCard;