import {
    endOfMonth,
    format,
    isAfter,
    isValid,
    isSameDay,
    isSameWeek,
    isWithinInterval,
    parseISO,
    startOfMonth,
} from 'date-fns';
import { BUDGET_LIMITS } from './constants';
import type {
    BudgetStat,
    DaySummary,
    FinanceRecord,
    FinanceStats,
    FundRecord,
    GoalRecord,
    VaultTransferEntry,
} from './types';

export const currency = (value: number) => `$${Math.round(value).toLocaleString()}`;

export const toAmount = (value: number | string | null | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const sanitizeAmountInput = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, '');
    const [whole = '', ...decimalParts] = normalized.split('.');
    const decimals = decimalParts.join('').slice(0, 2);

    if (normalized.startsWith('.')) {
        return decimals ? `0.${decimals}` : '0.';
    }

    if (decimalParts.length === 0) {
        return whole;
    }

    return `${whole}.${decimals}`;
};

export const sanitizeDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 4) {
        return digits;
    }

    if (digits.length <= 6) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }

    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

export const isValidFinanceDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const parsed = parseISO(value);
    return isValid(parsed) && format(parsed, 'yyyy-MM-dd') === value && !isAfter(parsed, new Date());
};

export const normalizeFundRecord = (record: any): FundRecord => ({
    ...record,
    color: record.color ?? record.hex_color ?? null,
});

export const normalizeGoalRecord = (record: any): GoalRecord => ({
    ...record,
    is_emergency_fund: record.is_emergency_fund ?? record.type === 'emergency',
});

export const buildStats = (records: FinanceRecord[]): FinanceStats => {
    const today = new Date();

    return records.reduce<FinanceStats>((acc, record) => {
        const amount = toAmount(record.amount);
        const recordDate = parseISO(record.date);

        acc.totalBalance += record.type === 'income' ? amount : -amount;

        if (isSameDay(recordDate, today)) {
            if (record.type === 'income') {
                acc.incomeToday += amount;
            } else {
                acc.expenseToday += amount;
            }
        }

        if (record.type === 'expense' && isSameWeek(recordDate, today, { weekStartsOn: 1 })) {
            acc.expenseWeek += amount;
        }

        return acc;
    }, {
        totalBalance: 0,
        incomeToday: 0,
        expenseToday: 0,
        expenseWeek: 0,
    });
};

export const buildBudgetStats = (records: FinanceRecord[]): BudgetStat[] => {
    const now = new Date();
    const spending = Object.fromEntries(
        Object.keys(BUDGET_LIMITS).map((category) => [category, 0]),
    ) as Record<string, number>;

    records.forEach((record) => {
        if (record.type !== 'expense') {
            return;
        }

        const inCurrentMonth = isWithinInterval(parseISO(record.date), {
            start: startOfMonth(now),
            end: endOfMonth(now),
        });

        if (inCurrentMonth && record.category in spending) {
            spending[record.category] += toAmount(record.amount);
        }
    });

    return Object.entries(BUDGET_LIMITS).map(([category, limit]) => {
        const spent = spending[category] ?? 0;
        const percentage = Math.min((spent / limit) * 100, 100);

        let tone: BudgetStat['tone'] = 'success';
        if (percentage >= 80) tone = 'warning';
        if (percentage >= 100) tone = 'danger';

        return { category, spent, limit, percentage, tone };
    });
};

export const buildCategoryData = (records: FinanceRecord[]) => {
    const totals: Record<string, number> = {};

    records.forEach((record) => {
        if (record.type !== 'expense') {
            return;
        }

        totals[record.category] = (totals[record.category] ?? 0) + toAmount(record.amount);
    });

    const entries = Object.entries(totals)
        .map(([name, value]) => ({ name, value }))
        .sort((left, right) => right.value - left.value);

    return {
        entries,
        total: entries.reduce((sum, entry) => sum + entry.value, 0),
    };
};

export const buildDailyTrend = (records: FinanceRecord[]) => {
    const dayMap: Record<string, number> = {};

    for (let index = 6; index >= 0; index -= 1) {
        const day = new Date();
        day.setDate(day.getDate() - index);
        dayMap[format(day, 'MMM d')] = 0;
    }

    records.forEach((record) => {
        if (record.type !== 'expense') {
            return;
        }

        const dayKey = format(parseISO(record.date), 'MMM d');
        if (dayKey in dayMap) {
            dayMap[dayKey] += toAmount(record.amount);
        }
    });

    return Object.entries(dayMap).map(([label, amount]) => ({ label, amount }));
};

export const buildDailyMap = (records: FinanceRecord[]) => {
    return records.reduce<Record<string, DaySummary>>((map, record) => {
        const key = format(parseISO(record.date), 'yyyy-MM-dd');

        if (!map[key]) {
            map[key] = { income: 0, expense: 0, transactions: [] };
        }

        if (record.type === 'income') {
            map[key].income += toAmount(record.amount);
        } else {
            map[key].expense += toAmount(record.amount);
        }

        map[key].transactions.push(record);
        return map;
    }, {});
};

export const getVaultTransferHistory = (records: FinanceRecord[], itemName: string): VaultTransferEntry[] => {
    return records
        .filter((record) => (
            record.category === 'Savings'
            && typeof record.description === 'string'
            && record.description.includes(itemName)
        ))
        .map((record) => ({
            id: record.id,
            direction: (record.type === 'expense' ? 'deposit' : 'withdraw') as VaultTransferEntry['direction'],
            amount: toAmount(record.amount),
            date: record.date,
            description: record.description ?? '',
        }))
        .slice(0, 3);
};
