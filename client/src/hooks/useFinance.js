import { useEffect, useMemo, useState } from 'react';
import {
    endOfMonth,
    format,
    isSameDay,
    isSameWeek,
    isWithinInterval,
    parseISO,
    startOfMonth
} from 'date-fns';
import { api } from '../api';
import { BUDGET_LIMITS, CATEGORIES } from '../constants/finance';

const getDefaultSpendingMap = () => Object.fromEntries(
    CATEGORIES.EXPENSE.map((category) => [category, 0])
);

const buildStats = (logs) => {
    const today = new Date();

    return logs.reduce((acc, log) => {
        const amount = Number(log.amount);
        const logDate = parseISO(log.date);

        if (log.type === 'income') {
            acc.totalBalance += amount;
        } else {
            acc.totalBalance -= amount;
        }

        if (isSameDay(logDate, today)) {
            if (log.type === 'income') {
                acc.incomeToday += amount;
            } else {
                acc.expenseToday += amount;
            }
        }

        if (log.type === 'expense' && isSameWeek(logDate, today, { weekStartsOn: 1 })) {
            acc.expenseWeek += amount;
        }

        return acc;
    }, {
        totalBalance: 0,
        incomeToday: 0,
        expenseToday: 0,
        expenseWeek: 0
    });
};

const buildBudgetStats = (logs) => {
    const now = new Date();
    const spending = getDefaultSpendingMap();

    logs.forEach((log) => {
        if (log.type !== 'expense') {
            return;
        }

        const isCurrentMonth = isWithinInterval(parseISO(log.date), {
            start: startOfMonth(now),
            end: endOfMonth(now)
        });

        if (isCurrentMonth && spending[log.category] !== undefined) {
            spending[log.category] += Number(log.amount);
        }
    });

    return Object.keys(BUDGET_LIMITS).map((category) => {
        const spent = spending[category] || 0;
        const limit = BUDGET_LIMITS[category];
        const percentage = Math.min((spent / limit) * 100, 100);

        let color = 'bg-emerald-500';
        if (percentage >= 80) color = 'bg-amber-500';
        if (percentage >= 100) color = 'bg-rose-500';

        return { category, spent, limit, percentage, color };
    });
};

const buildChartData = (logs) => {
    const categoryMap = {};
    const dailyMap = {};

    for (let index = 6; index >= 0; index -= 1) {
        const day = new Date();
        day.setDate(day.getDate() - index);
        dailyMap[format(day, 'MMM d')] = 0;
    }

    logs.forEach((log) => {
        if (log.type !== 'expense') {
            return;
        }

        categoryMap[log.category] = (categoryMap[log.category] || 0) + Number(log.amount);

        const dayKey = format(parseISO(log.date), 'MMM d');
        if (dailyMap[dayKey] !== undefined) {
            dailyMap[dayKey] += Number(log.amount);
        }
    });

    return {
        pieData: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
        barData: Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }))
    };
};

const buildCustomCategories = (logs) => {
    const defaults = new Set([...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE]);

    return Array.from(new Set(
        logs
            .map((log) => log.category)
            .filter((category) => !defaults.has(category))
    ));
};

export const useFinance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const data = await api.fetchFinanceRecords();
                if (isMounted && data) {
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to load finance records', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const addTransaction = async (payload) => {
        const { data, error } = await api.addFinanceRecord(payload);

        if (!error && data?.[0]) {
            setLogs((currentLogs) => [data[0], ...currentLogs]);
            return true;
        }

        return false;
    };

    const deleteTransaction = async (id) => {
        const { error } = await api.deleteFinanceRecord(id);

        if (!error) {
            setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
        }
    };

    const stats = useMemo(() => buildStats(logs), [logs]);
    const budgetStats = useMemo(() => buildBudgetStats(logs), [logs]);
    const chartData = useMemo(() => buildChartData(logs), [logs]);
    const customCategories = useMemo(() => buildCustomCategories(logs), [logs]);

    return {
        logs,
        loading,
        stats,
        addTransaction,
        deleteTransaction,
        budgetStats,
        chartData,
        customCategories
    };
};
