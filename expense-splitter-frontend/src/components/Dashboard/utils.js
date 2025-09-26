// src/components/Dashboard/utils.js

export const getCurrentDateTimeString = () => {
    const now = new Date();
    // Adjust for local timezone offset
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now - timezoneOffset);
    return localDate.toISOString().substring(0, 16);
};

export const formatApiDateForInput = (dateString) => {
    if (!dateString) return getCurrentDateTimeString();
    try {
        const date = new Date(dateString);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date - timezoneOffset);
        return localDate.toISOString().substring(0, 16);
    } catch {
        return dateString.substring(0, 16);
    }
};

export const getTodayDateOnlyString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const generateFixedYears = (startYear = 2010) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year.toString());
    }
    return years;
};

export const generateFixedMonths = () => {
    return Array.from({ length: 12 }, (item, i) => {
        const monthIndex = i + 1;
        return {
            value: String(monthIndex).padStart(2, '0'),
            label: new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' }),
        };
    });
};

export const filterTransactionsByPeriod = (transactions, period, selectedDate) => {
    if (period === 'ALL TIME') return transactions;
    if (!selectedDate) return transactions;

    const parts = selectedDate.split('-').map(Number);
    const filterTime = new Date(parts[0], parts[1] - 1, parts[2]);

    if (isNaN(filterTime.getTime())) return transactions;

    let startTime, endTime;

    switch (period) {
        case 'DAILY':
            startTime = new Date(filterTime);
            endTime = new Date(startTime);
            endTime.setDate(startTime.getDate() + 1);
            break;
        case 'WEEKLY':
            const day = filterTime.getDay();
            startTime = new Date(filterTime);
            startTime.setDate(filterTime.getDate() - day);
            endTime = new Date(startTime);
            endTime.setDate(startTime.getDate() + 7);
            break;
        case 'MONTHLY':
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
        const expDateMs = new Date(exp.date).getTime();
        return expDateMs >= startTimeMs && expDateMs < endTimeMs;
    });
};

export const getDisplayTime = (filterPeriod, selectedDate) => {
    if (!selectedDate) return 'Loading...';
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);

    if (isNaN(d.getTime())) return `${filterPeriod} (Invalid Date)`;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    switch (filterPeriod) {
        case 'DAILY':
            return d.toLocaleDateString('en-US', options);
        case 'WEEKLY':
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'MONTHLY':
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        case 'YEARLY':
            return d.toLocaleDateString('en-US', { year: 'numeric' });
        default:
            return 'All Time';
    }
};