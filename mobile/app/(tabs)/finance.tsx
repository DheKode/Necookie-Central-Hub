import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isSameWeek,
    isWithinInterval,
    parseISO,
    startOfMonth,
} from 'date-fns';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { Button, Card, EmptyState, FormField, Modal, PillFilter, SectionHeader } from '../../components/ui';
import { dataService } from '../../src/services/dataService';

type FinanceRecord = {
    id: number;
    type: 'income' | 'expense';
    amount: number | string;
    category: string;
    description?: string | null;
    date: string;
};

type FundRecord = {
    id: number;
    name: string;
    target_amount: number | string;
    current_amount?: number | string | null;
    color?: string | null;
};

type GoalRecord = {
    id: number;
    name: string;
    target_amount: number | string;
    current_amount?: number | string | null;
    deadline?: string | null;
    is_emergency_fund?: boolean;
};

type VaultEditingState =
    | { mode: 'create'; itemType: 'fund' | 'goal'; itemId: null }
    | { mode: 'edit'; itemType: 'fund' | 'goal'; itemId: number };

type VaultTransferState = {
    visible: boolean;
    itemType: 'fund' | 'goal';
    action: 'deposit' | 'withdraw' | 'adjust';
    itemId: number | null;
    itemName: string;
    currentAmount: number;
};

type VaultFeedback = {
    tone: 'success' | 'error';
    message: string;
};

type VaultTransferEntry = {
    id: number;
    direction: 'deposit' | 'withdraw';
    amount: number;
    date: string;
    description: string;
};

type FinanceStats = {
    totalBalance: number;
    incomeToday: number;
    expenseToday: number;
    expenseWeek: number;
};

type BudgetStat = {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
    tone: string;
};

type DaySummary = {
    income: number;
    expense: number;
    transactions: FinanceRecord[];
};

const FINANCE_TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'vault', label: 'Vault' },
    { id: 'transactions', label: 'Transactions' },
] as const;

const TRANSACTION_TYPES = [
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
] as const;

const CREATE_TYPES = [
    { id: 'fund', label: 'Fund' },
    { id: 'goal', label: 'Goal' },
] as const;

const CATEGORIES = {
    income: ['Allowance', 'Freelance', 'Gift', 'Salary', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Games', 'Subscriptions', 'Other'],
};

const BUDGET_LIMITS: Record<string, number> = {
    Food: 5000,
    Transport: 2000,
    Shopping: 3000,
    Games: 1000,
    Subscriptions: 1500,
    Other: 2000,
};

const CATEGORY_COLORS = ['#748C7B', '#6E8B9E', '#D39655', '#BD6F6B', '#9D8AC7', '#D88C9A'];

const currency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const toAmount = (value: number | string | null | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeFundRecord = (record: any): FundRecord => ({
    ...record,
    color: record.color ?? record.hex_color ?? null,
});

const normalizeGoalRecord = (record: any): GoalRecord => ({
    ...record,
    is_emergency_fund: record.is_emergency_fund ?? record.type === 'emergency',
});

const getVaultTransferHistory = (records: FinanceRecord[], itemName: string): VaultTransferEntry[] => {
    return records
        .filter((record) => record.category === 'Savings' && typeof record.description === 'string' && record.description.includes(itemName))
        .map((record) => ({
            id: record.id,
            direction: record.type === 'expense' ? 'deposit' : 'withdraw',
            amount: toAmount(record.amount),
            date: record.date,
            description: record.description ?? '',
        }))
        .slice(0, 3);
};

const buildStats = (records: FinanceRecord[]): FinanceStats => {
    const today = new Date();

    return records.reduce<FinanceStats>((acc, record) => {
        const amount = toAmount(record.amount);
        const recordDate = parseISO(record.date);

        if (record.type === 'income') {
            acc.totalBalance += amount;
        } else {
            acc.totalBalance -= amount;
        }

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

const buildBudgetStats = (records: FinanceRecord[]): BudgetStat[] => {
    const now = new Date();
    const spending = Object.fromEntries(Object.keys(BUDGET_LIMITS).map((category) => [category, 0])) as Record<string, number>;

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

        let tone = colors.success;
        if (percentage >= 80) tone = colors.warning;
        if (percentage >= 100) tone = colors.danger;

        return { category, spent, limit, percentage, tone };
    });
};

const buildCategoryData = (records: FinanceRecord[]) => {
    const totals: Record<string, number> = {};

    records.forEach((record) => {
        if (record.type !== 'expense') {
            return;
        }

        totals[record.category] = (totals[record.category] ?? 0) + toAmount(record.amount);
    });

    const entries = Object.entries(totals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const total = entries.reduce((sum, entry) => sum + entry.value, 0);

    return { entries, total };
};

const buildDailyTrend = (records: FinanceRecord[]) => {
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
        if (dayMap[dayKey] !== undefined) {
            dayMap[dayKey] += toAmount(record.amount);
        }
    });

    return Object.entries(dayMap).map(([label, amount]) => ({ label, amount }));
};

const buildDailyMap = (records: FinanceRecord[]) => {
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

export default function FinanceScreen() {
    const [records, setRecords] = useState<FinanceRecord[]>([]);
    const [funds, setFunds] = useState<FundRecord[]>([]);
    const [goals, setGoals] = useState<GoalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingTransaction, setSubmittingTransaction] = useState(false);
    const [submittingVaultItem, setSubmittingVaultItem] = useState(false);
    const [activeTab, setActiveTab] = useState<typeof FINANCE_TABS[number]['id']>('dashboard');
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [vaultModalVisible, setVaultModalVisible] = useState(false);
    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [vaultEditing, setVaultEditing] = useState<VaultEditingState>({
        mode: 'create',
        itemType: 'fund',
        itemId: null,
    });
    const [transferState, setTransferState] = useState<VaultTransferState>({
        visible: false,
        itemType: 'fund',
        action: 'deposit',
        itemId: null,
        itemName: '',
        currentAmount: 0,
    });
    const [transferAmount, setTransferAmount] = useState('');
    const [submittingTransfer, setSubmittingTransfer] = useState(false);
    const [vaultFeedback, setVaultFeedback] = useState<VaultFeedback | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [transactionForm, setTransactionForm] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: CATEGORIES.expense[0],
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
    });
    const [vaultForm, setVaultForm] = useState({
        type: 'fund' as 'fund' | 'goal',
        name: '',
        target: '',
        deadline: '',
        isEmergency: false,
    });

    const loadData = async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
        }

        try {
            const [financeData, fundData, goalData] = await Promise.all([
                dataService.fetchFinanceRecords(),
                dataService.fetchFunds(),
                dataService.fetchGoals(),
            ]);

            setRecords((financeData ?? []) as FinanceRecord[]);
            setFunds(((fundData ?? []) as any[]).map(normalizeFundRecord));
            setGoals(((goalData ?? []) as any[]).map(normalizeGoalRecord));
        } catch (error) {
            console.error('Failed to load finance data:', error);
            Alert.alert('Error', 'Failed to load finance data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    const stats = useMemo(() => buildStats(records), [records]);
    const budgetStats = useMemo(() => buildBudgetStats(records), [records]);
    const categoryData = useMemo(() => buildCategoryData(records), [records]);
    const dailyTrend = useMemo(() => buildDailyTrend(records), [records]);
    const dailyMap = useMemo(() => buildDailyMap(records), [records]);

    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const selectedDay = dailyMap[selectedDateKey];
    const daysInMonth = useMemo(() => eachDayOfInterval({
        start: startOfMonth(calendarMonth),
        end: endOfMonth(calendarMonth),
    }), [calendarMonth]);
    const blankDays = useMemo(() => Array(getDay(startOfMonth(calendarMonth))).fill(null), [calendarMonth]);
    const maxTrendAmount = Math.max(...dailyTrend.map((item) => item.amount), 1);
    const walletBalance = stats.totalBalance;

    const openTransactionModal = (type: 'income' | 'expense') => {
        setTransactionForm({
            type,
            amount: '',
            category: CATEGORIES[type][0],
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        setTransactionModalVisible(true);
    };

    const submitTransaction = async () => {
        if (!transactionForm.amount) {
            Alert.alert('Missing amount', 'Enter an amount before saving.');
            return;
        }

        setSubmittingTransaction(true);

        try {
            const { data, error } = await dataService.addFinanceRecord({
                type: transactionForm.type,
                amount: Number(transactionForm.amount),
                category: transactionForm.category,
                description: transactionForm.description.trim() || null,
                date: transactionForm.date,
                payment_method: null,
                is_recurring: false,
                recurrence_interval: null,
            });

            if (error) {
                throw error;
            }

            const created = data?.[0] as FinanceRecord | undefined;
            if (created) {
                setRecords((current) => [created, ...current]);
            }

            setTransactionModalVisible(false);
        } catch (error) {
            console.error('Failed to create transaction:', error);
            Alert.alert('Error', 'Failed to save transaction.');
        } finally {
            setSubmittingTransaction(false);
        }
    };

    const deleteTransaction = (id: number) => {
        Alert.alert('Delete transaction', 'This will remove the record permanently.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await dataService.deleteFinanceRecord(id);
                        if (error) {
                            throw error;
                        }

                        setRecords((current) => current.filter((record) => record.id !== id));
                    } catch (error) {
                        console.error('Failed to delete transaction:', error);
                        Alert.alert('Error', 'Failed to delete transaction.');
                    }
                },
            },
        ]);
    };

    const closeVaultModal = () => {
        setVaultModalVisible(false);
        setVaultEditing({
            mode: 'create',
            itemType: 'fund',
            itemId: null,
        });
    };

    const closeTransferModal = () => {
        setTransferModalVisible(false);
        setTransferAmount('');
        setTransferState({
            visible: false,
            itemType: 'fund',
            action: 'deposit',
            itemId: null,
            itemName: '',
            currentAmount: 0,
        });
    };

    const submitVaultItem = async () => {
        if (!vaultForm.name.trim() || !vaultForm.target.trim()) {
            Alert.alert('Missing fields', 'Name and target are required.');
            return;
        }

        setSubmittingVaultItem(true);

        try {
            if (vaultForm.type === 'fund') {
                const payload = {
                    name: vaultForm.name.trim(),
                    target_amount: Number(vaultForm.target),
                    current_amount: 0,
                    color: 'sage',
                };
                const result = vaultEditing.mode === 'edit' && vaultEditing.itemType === 'fund'
                    ? await dataService.updateFund(vaultEditing.itemId, {
                        name: payload.name,
                        target_amount: payload.target_amount,
                    })
                    : await dataService.addFund(payload);
                const { data, error } = result;

                if (error) {
                    throw error;
                }

                const saved = data?.[0] ? normalizeFundRecord(data[0]) : undefined;
                if (saved) {
                    setFunds((current) => (
                        vaultEditing.mode === 'edit'
                            ? current.map((fund) => (fund.id === saved.id ? { ...fund, ...saved } : fund))
                            : [...current, saved]
                    ));
                }
            } else {
                const payload = {
                    name: vaultForm.name.trim(),
                    target_amount: Number(vaultForm.target),
                    current_amount: 0,
                    deadline: vaultForm.deadline || null,
                    is_emergency_fund: vaultForm.isEmergency,
                };
                const result = vaultEditing.mode === 'edit' && vaultEditing.itemType === 'goal'
                    ? await dataService.updateGoal(vaultEditing.itemId, payload)
                    : await dataService.addGoal(payload);
                const { data, error } = result;

                if (error) {
                    throw error;
                }

                const saved = data?.[0] ? normalizeGoalRecord(data[0]) : undefined;
                if (saved) {
                    setGoals((current) => (
                        vaultEditing.mode === 'edit'
                            ? current.map((goal) => (goal.id === saved.id ? { ...goal, ...saved } : goal))
                            : [...current, saved]
                    ));
                }
            }

            closeVaultModal();
            setVaultForm({
                type: 'fund',
                name: '',
                target: '',
                deadline: '',
                isEmergency: false,
            });
        } catch (error) {
            console.error('Failed to save vault item:', error);
            Alert.alert('Error', 'Failed to save vault item.');
        } finally {
            setSubmittingVaultItem(false);
        }
    };

    const renderDashboard = () => (
        <View style={styles.sectionStack}>
            <Card style={styles.heroCard}>
                <View style={styles.heroContent}>
                    <View style={styles.heroText}>
                        <Text style={styles.heroLabel}>Net available balance</Text>
                        <Text style={styles.heroAmount}>{currency(stats.totalBalance)}</Text>
                        <Text style={styles.heroSubtext}>Track your flow, savings, and spending rhythm.</Text>
                    </View>
                    <View style={styles.heroActions}>
                        <Button label="Add Income" onPress={() => openTransactionModal('income')} style={styles.heroButton} />
                        <Button label="Add Expense" variant="danger" onPress={() => openTransactionModal('expense')} style={styles.heroButton} />
                    </View>
                </View>
            </Card>

            <View style={styles.statGrid}>
                <Card variant="outline" style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: colors.dangerLight }]}>
                        <Ionicons name="trending-down-outline" size={18} color={colors.danger} />
                    </View>
                    <Text style={styles.statLabel}>Today&apos;s Burn</Text>
                    <Text style={styles.statValue}>{currency(stats.expenseToday)}</Text>
                </Card>
                <Card variant="outline" style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                        <Ionicons name="calendar-outline" size={18} color={colors.warning} />
                    </View>
                    <Text style={styles.statLabel}>Weekly Burn</Text>
                    <Text style={styles.statValue}>{currency(stats.expenseWeek)}</Text>
                </Card>
                <Card variant="outline" style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="trending-up-outline" size={18} color={colors.success} />
                    </View>
                    <Text style={styles.statLabel}>Income Today</Text>
                    <Text style={styles.statValue}>{currency(stats.incomeToday)}</Text>
                </Card>
            </View>

            <Card variant="outline">
                <SectionHeader title="Monthly budget" />
                <View style={styles.budgetList}>
                    {budgetStats.map((item) => (
                        <View key={item.category} style={styles.budgetRow}>
                            <View style={styles.budgetHeader}>
                                <Text style={styles.budgetCategory}>{item.category}</Text>
                                <Text style={styles.budgetAmount}>{currency(item.spent)} / {currency(item.limit)}</Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: item.tone }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </Card>

            <Card variant="outline">
                <SectionHeader title="Spend breakdown" />
                {categoryData.entries.length === 0 ? (
                    <Text style={styles.mutedText}>No expense data yet.</Text>
                ) : (
                    <View style={styles.breakdownList}>
                        {categoryData.entries.map((item, index) => {
                            const percent = categoryData.total ? (item.value / categoryData.total) * 100 : 0;

                            return (
                                <View key={item.name} style={styles.breakdownRow}>
                                    <View style={styles.breakdownHeader}>
                                        <View style={styles.breakdownLabelWrap}>
                                            <View style={[styles.breakdownDot, { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} />
                                            <Text style={styles.breakdownName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.breakdownValue}>{currency(item.value)}</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </Card>

            <Card variant="outline">
                <SectionHeader title="Daily trend" actionLabel="Last 7 days" />
                <View style={styles.trendChart}>
                    {dailyTrend.map((item) => (
                        <View key={item.label} style={styles.trendBarWrap}>
                            <Text style={styles.trendAmount}>{item.amount > 0 ? currency(item.amount) : '$0'}</Text>
                            <View style={styles.trendTrack}>
                                <View style={[styles.trendBar, { height: `${Math.max((item.amount / maxTrendAmount) * 100, item.amount > 0 ? 10 : 4)}%` }]} />
                            </View>
                            <Text style={styles.trendLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </Card>
        </View>
    );

    const renderCalendar = () => (
        <View style={styles.sectionStack}>
            <Card variant="outline">
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>{format(calendarMonth, 'MMMM yyyy')}</Text>
                    <View style={styles.calendarActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setCalendarMonth((current) => addMonths(current, -1))}>
                            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setCalendarMonth((current) => addMonths(current, 1))}>
                            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.calendarWeekdays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <Text key={`${day}-${index}`} style={styles.calendarWeekday}>{day}</Text>
                    ))}
                </View>

                <View style={styles.calendarGrid}>
                    {blankDays.map((_, index) => (
                        <View key={`blank-${index}`} style={styles.calendarBlank} />
                    ))}
                    {daysInMonth.map((day) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const dayData = dailyMap[key];
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const net = (dayData?.income ?? 0) - (dayData?.expense ?? 0);

                        return (
                            <TouchableOpacity
                                key={key}
                                style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                                onPress={() => setSelectedDate(day)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.calendarDayText, isToday && styles.calendarDayToday]}>
                                    {format(day, 'd')}
                                </Text>
                                <View style={styles.calendarDots}>
                                    {dayData?.income ? <View style={[styles.calendarDot, { backgroundColor: colors.success }]} /> : null}
                                    {dayData?.expense ? <View style={[styles.calendarDot, { backgroundColor: colors.danger }]} /> : null}
                                </View>
                                {dayData ? (
                                    <Text style={[styles.calendarNet, { color: net >= 0 ? colors.success : colors.danger }]}>
                                        {net >= 0 ? '+' : '-'}{Math.abs(Math.round(net))}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Card>

            <Card variant="outline">
                <SectionHeader title={`Activity for ${format(selectedDate, 'MMMM d')}`} />
                {!selectedDay?.transactions.length ? (
                    <Text style={styles.mutedText}>No transactions recorded for this date.</Text>
                ) : (
                    <View style={styles.transactionList}>
                        {selectedDay.transactions.map((item) => (
                            <View key={`day-${item.id}`} style={styles.dayTransactionRow}>
                                <View style={styles.dayTransactionInfo}>
                                    <View style={[styles.dayTransactionAccent, { backgroundColor: item.type === 'income' ? colors.success : colors.danger }]} />
                                    <View>
                                        <Text style={styles.recordDesc}>{item.description || item.category}</Text>
                                        <Text style={styles.recordDate}>{item.category}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.textPrimary }]}>
                                    {item.type === 'income' ? '+' : '-'}{currency(toAmount(item.amount))}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );

    const openVaultModal = (type: 'fund' | 'goal') => {
        setVaultEditing({
            mode: 'create',
            itemType: type,
            itemId: null,
        });
        setVaultForm({
            type,
            name: '',
            target: '',
            deadline: '',
            isEmergency: false,
        });
        setVaultModalVisible(true);
    };

    const openVaultEditModal = (item: FundRecord | GoalRecord, type: 'fund' | 'goal') => {
        const goalItem = type === 'goal' ? item as GoalRecord : null;

        setVaultEditing({
            mode: 'edit',
            itemType: type,
            itemId: item.id,
        });
        setVaultForm({
            type,
            name: item.name,
            target: String(toAmount(item.target_amount)),
            deadline: goalItem?.deadline ?? '',
            isEmergency: Boolean(goalItem?.is_emergency_fund),
        });
        setVaultModalVisible(true);
    };

    const handleDeleteFund = (fundId: number) => {
        Alert.alert('Delete fund', 'This will permanently remove the savings account.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await dataService.deleteFund(fundId);
                        if (error) {
                            throw error;
                        }

                        setFunds((current) => current.filter((fund) => fund.id !== fundId));
                    } catch (error) {
                        console.error('Failed to delete fund:', error);
                        Alert.alert('Error', 'Failed to delete fund.');
                    }
                },
            },
        ]);
    };

    const handleDeleteGoal = (goalId: number) => {
        Alert.alert('Delete goal', 'This will permanently remove the savings goal.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await dataService.deleteGoal(goalId);
                        if (error) {
                            throw error;
                        }

                        setGoals((current) => current.filter((goal) => goal.id !== goalId));
                    } catch (error) {
                        console.error('Failed to delete goal:', error);
                        Alert.alert('Error', 'Failed to delete goal.');
                    }
                },
            },
        ]);
    };

    const openTransferModal = (
        item: FundRecord | GoalRecord,
        itemType: 'fund' | 'goal',
        action: 'deposit' | 'withdraw' | 'adjust',
    ) => {
        setVaultFeedback(null);
        setTransferState({
            visible: true,
            itemType,
            action,
            itemId: item.id,
            itemName: item.name,
            currentAmount: toAmount(item.current_amount),
        });
        setTransferAmount('');
        setTransferModalVisible(true);
    };

    const submitTransfer = async () => {
        const amount = Number(transferAmount);

        if (!transferState.itemId || !Number.isFinite(amount) || amount <= 0) {
            setVaultFeedback({ tone: 'error', message: 'Enter a valid transfer amount.' });
            return;
        }

        if (transferState.action === 'deposit' && amount > walletBalance) {
            setVaultFeedback({ tone: 'error', message: 'Not enough wallet balance for this transfer.' });
            return;
        }

        if (transferState.action === 'withdraw' && amount > transferState.currentAmount) {
            setVaultFeedback({ tone: 'error', message: 'You cannot withdraw more than the reserved amount.' });
            return;
        }

        setSubmittingTransfer(true);
        setVaultFeedback(null);

        const nextAmount = transferState.action === 'deposit'
            ? transferState.currentAmount + amount
            : transferState.action === 'withdraw'
                ? transferState.currentAmount - amount
                : amount;
        const transferDate = format(new Date(), 'yyyy-MM-dd');
        const transactionPayload = transferState.action === 'adjust'
            ? null
            : {
                type: transferState.action === 'deposit' ? 'expense' as const : 'income' as const,
                amount,
                category: 'Savings',
                description: `${transferState.action === 'deposit' ? 'Transfer to' : 'Withdraw from'} ${transferState.itemName}`,
                date: transferDate,
                payment_method: null,
                is_recurring: false,
                recurrence_interval: null,
            };

        try {
            const updatePromise = transferState.itemType === 'fund'
                ? dataService.updateFund(transferState.itemId, { current_amount: nextAmount })
                : dataService.updateGoal(transferState.itemId, { current_amount: nextAmount });
            const [updateResult, financeResult] = await Promise.all([
                updatePromise,
                transactionPayload ? dataService.addFinanceRecord(transactionPayload) : Promise.resolve({ data: null, error: null }),
            ]);

            if (updateResult.error) {
                throw updateResult.error;
            }

            if (financeResult.error) {
                throw financeResult.error;
            }

            const updatedRecord = updateResult.data?.[0];
            const createdTransaction = financeResult.data?.[0] as FinanceRecord | undefined;

            if (transferState.itemType === 'fund' && updatedRecord) {
                const normalized = normalizeFundRecord(updatedRecord);
                setFunds((current) => current.map((fund) => (
                    fund.id === normalized.id ? { ...fund, ...normalized } : fund
                )));
            }

            if (transferState.itemType === 'goal' && updatedRecord) {
                const normalized = normalizeGoalRecord(updatedRecord);
                setGoals((current) => current.map((goal) => (
                    goal.id === normalized.id ? { ...goal, ...normalized } : goal
                )));
            }

            if (createdTransaction) {
                setRecords((current) => [createdTransaction, ...current]);
            }

            setVaultFeedback({
                tone: 'success',
                message: transferState.action === 'adjust'
                    ? `Adjusted ${transferState.itemName} to ${currency(amount)} without changing wallet balance.`
                    : `${transferState.action === 'deposit' ? 'Moved' : 'Returned'} ${currency(amount)} ${transferState.action === 'deposit' ? 'into' : 'from'} ${transferState.itemName}.`,
            });
            closeTransferModal();
        } catch (error) {
            console.error('Failed to complete vault transfer:', error);
            setVaultFeedback({ tone: 'error', message: 'Transfer failed. Data was refreshed to keep balances accurate.' });
            closeTransferModal();
            loadData(true);
        } finally {
            setSubmittingTransfer(false);
        }
    };

    const renderVault = () => (
        <View style={styles.sectionStack}>
            <Card style={styles.vaultHero}>
                <View>
                    <Text style={styles.vaultLabel}>Available in wallet</Text>
                    <Text style={styles.vaultAmount}>{currency(walletBalance)}</Text>
                    <Text style={styles.heroSubtext}>Reserved funds and savings goals can branch off from this.</Text>
                </View>
                <View style={styles.vaultBadge}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.secondary} />
                </View>
            </Card>

            {vaultFeedback ? (
                <Card
                    variant="outline"
                    style={[
                        styles.feedbackCard,
                        vaultFeedback.tone === 'success' ? styles.feedbackCardSuccess : styles.feedbackCardError,
                    ]}
                >
                    <View style={styles.feedbackRow}>
                        <Ionicons
                            name={vaultFeedback.tone === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                            size={18}
                            color={vaultFeedback.tone === 'success' ? colors.success : colors.danger}
                        />
                        <Text style={styles.feedbackText}>{vaultFeedback.message}</Text>
                    </View>
                </Card>
            ) : null}

            <Card variant="outline">
                <SectionHeader title="Savings accounts" actionLabel="Create" onActionPress={() => openVaultModal('fund')} />
                {funds.length === 0 ? (
                    <EmptyState
                        iconName="wallet-outline"
                        title="No savings accounts yet"
                        description="Create your first fund for bills, travel, or anything you want ring-fenced."
                        actionLabel="Create fund"
                        onActionPress={() => openVaultModal('fund')}
                    />
                ) : (
                    <View style={styles.vaultGrid}>
                        {funds.map((fund) => {
                            const currentAmount = toAmount(fund.current_amount);
                            const targetAmount = toAmount(fund.target_amount);
                            const progress = targetAmount ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
                            const transferHistory = getVaultTransferHistory(records, fund.name);

                            return (
                                <Card key={fund.id} style={styles.vaultItemCard} variant="flat">
                                    <View style={styles.vaultItemHeader}>
                                        <View>
                                            <Text style={styles.vaultItemName}>{fund.name}</Text>
                                            <Text style={styles.recordDate}>Target {currency(targetAmount)}</Text>
                                        </View>
                                        <View style={styles.vaultActions}>
                                            <TouchableOpacity style={styles.vaultActionButton} onPress={() => openVaultEditModal(fund, 'fund')}>
                                                <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.vaultActionButton} onPress={() => handleDeleteFund(fund.id)}>
                                                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                                            </TouchableOpacity>
                                            <View style={[styles.smallBadge, { backgroundColor: colors.secondaryLight }]}>
                                                <Ionicons name="card-outline" size={14} color={colors.secondary} />
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.vaultCurrent}>{currency(currentAmount)}</Text>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.secondary }]} />
                                    </View>
                                    <View style={styles.transferActionsRow}>
                                        <Button label="Withdraw" variant="secondary" size="sm" onPress={() => openTransferModal(fund, 'fund', 'withdraw')} style={styles.transferButton} />
                                        <Button label="Deposit" size="sm" onPress={() => openTransferModal(fund, 'fund', 'deposit')} style={styles.transferButton} />
                                        <Button label="Adjust" variant="ghost" size="sm" onPress={() => openTransferModal(fund, 'fund', 'adjust')} style={styles.transferButton} />
                                    </View>
                                    {transferHistory.length ? (
                                        <View style={styles.transferHistoryList}>
                                            {transferHistory.map((entry) => (
                                                <View key={entry.id} style={styles.transferHistoryRow}>
                                                    <View style={styles.transferHistoryInfo}>
                                                        <View style={[styles.transferHistoryDot, { backgroundColor: entry.direction === 'deposit' ? colors.secondary : colors.success }]} />
                                                        <Text style={styles.transferHistoryLabel}>
                                                            {entry.direction === 'deposit' ? 'Deposit' : 'Withdraw'} · {format(parseISO(entry.date), 'MMM d')}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.transferHistoryAmount}>{currency(entry.amount)}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}
                                </Card>
                            );
                        })}
                    </View>
                )}
            </Card>

            <Card variant="outline">
                <SectionHeader title="Savings goals" actionLabel="Create" onActionPress={() => openVaultModal('goal')} />
                {goals.length === 0 ? (
                    <EmptyState
                        iconName="flag-outline"
                        title="No active goals"
                        description="Set a target and start tracking progress toward your next purchase or buffer."
                        actionLabel="Create goal"
                        onActionPress={() => openVaultModal('goal')}
                    />
                ) : (
                    <View style={styles.vaultGrid}>
                        {goals.map((goal) => {
                            const currentAmount = toAmount(goal.current_amount);
                            const targetAmount = toAmount(goal.target_amount);
                            const progress = targetAmount ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
                            const transferHistory = getVaultTransferHistory(records, goal.name);

                            return (
                                <Card key={goal.id} style={styles.vaultItemCard} variant="flat">
                                    <View style={styles.vaultItemHeader}>
                                        <View>
                                            <Text style={styles.vaultItemName}>{goal.name}</Text>
                                            <Text style={styles.recordDate}>
                                                {goal.deadline ? `Due ${format(parseISO(goal.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                                            </Text>
                                        </View>
                                        <View style={styles.vaultActions}>
                                            <TouchableOpacity style={styles.vaultActionButton} onPress={() => openVaultEditModal(goal, 'goal')}>
                                                <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.vaultActionButton} onPress={() => handleDeleteGoal(goal.id)}>
                                                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                                            </TouchableOpacity>
                                            <View style={[styles.smallBadge, { backgroundColor: goal.is_emergency_fund ? colors.dangerLight : colors.primaryLight }]}>
                                                <Ionicons
                                                    name={goal.is_emergency_fund ? 'flash-outline' : 'trophy-outline'}
                                                    size={14}
                                                    color={goal.is_emergency_fund ? colors.danger : colors.success}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.vaultCurrent}>{currency(currentAmount)} / {currency(targetAmount)}</Text>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: goal.is_emergency_fund ? colors.danger : colors.success }]} />
                                    </View>
                                    <View style={styles.transferActionsRow}>
                                        <Button label="Withdraw" variant="secondary" size="sm" onPress={() => openTransferModal(goal, 'goal', 'withdraw')} style={styles.transferButton} />
                                        <Button label="Deposit" size="sm" onPress={() => openTransferModal(goal, 'goal', 'deposit')} style={styles.transferButton} />
                                        <Button label="Adjust" variant="ghost" size="sm" onPress={() => openTransferModal(goal, 'goal', 'adjust')} style={styles.transferButton} />
                                    </View>
                                    {transferHistory.length ? (
                                        <View style={styles.transferHistoryList}>
                                            {transferHistory.map((entry) => (
                                                <View key={entry.id} style={styles.transferHistoryRow}>
                                                    <View style={styles.transferHistoryInfo}>
                                                        <View style={[styles.transferHistoryDot, { backgroundColor: entry.direction === 'deposit' ? colors.danger : colors.success }]} />
                                                        <Text style={styles.transferHistoryLabel}>
                                                            {entry.direction === 'deposit' ? 'Deposit' : 'Withdraw'} · {format(parseISO(entry.date), 'MMM d')}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.transferHistoryAmount}>{currency(entry.amount)}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}
                                </Card>
                            );
                        })}
                    </View>
                )}
            </Card>
        </View>
    );

    const renderTransactions = () => (
        <View style={styles.sectionStack}>
            <Card variant="outline">
                <SectionHeader title="Recent transactions" actionLabel="Add" onActionPress={() => openTransactionModal('expense')} />
                {records.length === 0 ? (
                    <EmptyState
                        iconName="wallet-outline"
                        title="Track your flow"
                        description="Record a transaction to start building your finance history."
                        actionLabel="Add transaction"
                        onActionPress={() => openTransactionModal('expense')}
                    />
                ) : (
                    <View style={styles.transactionList}>
                        {records.map((item) => (
                            <Card key={item.id} style={styles.recordCard}>
                                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? colors.primaryLight : colors.dangerLight }]}>
                                    <Ionicons
                                        name={item.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'}
                                        size={20}
                                        color={item.type === 'income' ? colors.success : colors.danger}
                                    />
                                </View>
                                <View style={styles.recordInfo}>
                                    <Text style={styles.recordDesc}>{item.description || item.category}</Text>
                                    <Text style={styles.recordDate}>{format(new Date(item.date), 'MMM d, yyyy')} · {item.category}</Text>
                                </View>
                                <View style={styles.recordActions}>
                                    <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.textPrimary }]}>
                                        {item.type === 'income' ? '+' : '-'}{currency(toAmount(item.amount))}
                                    </Text>
                                    <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteButton}>
                                        <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'calendar':
                return renderCalendar();
            case 'vault':
                return renderVault();
            case 'transactions':
                return renderTransactions();
            case 'dashboard':
            default:
                return renderDashboard();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading finance hub...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Finance Hub</Text>
                    <Text style={styles.subtitle}>Mobile is now aligned around the same core sections as web.</Text>
                </View>

                <PillFilter
                    options={FINANCE_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
                    selectedId={activeTab}
                    onSelect={(id) => setActiveTab(id as typeof FINANCE_TABS[number]['id'])}
                />

                {renderActiveTab()}
            </ScrollView>

            <Modal visible={transactionModalVisible} onClose={() => setTransactionModalVisible(false)}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalTitle}>Add transaction</Text>
                    <Text style={styles.modalSubtitle}>Capture the same core inputs the web flow uses.</Text>

                    <PillFilter
                        options={TRANSACTION_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                        selectedId={transactionForm.type}
                        onSelect={(id) => setTransactionForm((current) => ({
                            ...current,
                            type: id as 'income' | 'expense',
                            category: CATEGORIES[id as 'income' | 'expense'][0],
                        }))}
                    />

                    <FormField
                        label="Amount"
                        keyboardType="decimal-pad"
                        value={transactionForm.amount}
                        onChangeText={(value) => setTransactionForm((current) => ({ ...current, amount: value }))}
                        placeholder="0.00"
                    />
                    <FormField
                        label="Description"
                        value={transactionForm.description}
                        onChangeText={(value) => setTransactionForm((current) => ({ ...current, description: value }))}
                        placeholder="Optional note"
                    />
                    <FormField
                        label="Date"
                        value={transactionForm.date}
                        onChangeText={(value) => setTransactionForm((current) => ({ ...current, date: value }))}
                        placeholder="YYYY-MM-DD"
                        autoCapitalize="none"
                    />

                    <Text style={styles.modalSectionLabel}>Category</Text>
                    <View style={styles.categoryWrap}>
                        {CATEGORIES[transactionForm.type].map((category) => {
                            const selected = category === transactionForm.category;
                            return (
                                <TouchableOpacity
                                    key={category}
                                    style={[styles.categoryPill, selected && styles.categoryPillSelected]}
                                    onPress={() => setTransactionForm((current) => ({ ...current, category }))}
                                >
                                    <Text style={[styles.categoryPillText, selected && styles.categoryPillTextSelected]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalActions}>
                        <Button label="Cancel" variant="ghost" onPress={() => setTransactionModalVisible(false)} />
                        <Button label="Save" onPress={submitTransaction} loading={submittingTransaction} />
                    </View>
                </ScrollView>
            </Modal>

            <Modal visible={vaultModalVisible} onClose={closeVaultModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalTitle}>
                        {vaultEditing.mode === 'edit' ? 'Edit vault item' : 'Create vault item'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                        {vaultEditing.mode === 'edit'
                            ? 'Update the details for this fund or goal.'
                            : 'Start with funds and goals first; transfer mechanics can layer in after this.'}
                    </Text>

                    <PillFilter
                        options={CREATE_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                        selectedId={vaultForm.type}
                        onSelect={(id) => {
                            if (vaultEditing.mode === 'edit') {
                                return;
                            }

                            setVaultForm((current) => ({ ...current, type: id as 'fund' | 'goal' }));
                        }}
                    />

                    <FormField
                        label="Name"
                        value={vaultForm.name}
                        onChangeText={(value) => setVaultForm((current) => ({ ...current, name: value }))}
                        placeholder={vaultForm.type === 'fund' ? 'Bills reserve' : 'New laptop'}
                    />
                    <FormField
                        label="Target amount"
                        keyboardType="decimal-pad"
                        value={vaultForm.target}
                        onChangeText={(value) => setVaultForm((current) => ({ ...current, target: value }))}
                        placeholder="0.00"
                    />

                    {vaultForm.type === 'goal' ? (
                        <>
                            <FormField
                                label="Deadline"
                                value={vaultForm.deadline}
                                onChangeText={(value) => setVaultForm((current) => ({ ...current, deadline: value }))}
                                placeholder="YYYY-MM-DD"
                                autoCapitalize="none"
                            />
                            <View style={styles.switchRow}>
                                <View style={styles.switchCopy}>
                                    <Text style={styles.switchTitle}>Emergency fund</Text>
                                    <Text style={styles.switchDescription}>Marks the goal as a safety buffer.</Text>
                                </View>
                                <Switch
                                    value={vaultForm.isEmergency}
                                    onValueChange={(value) => setVaultForm((current) => ({ ...current, isEmergency: value }))}
                                    thumbColor={colors.surface}
                                    trackColor={{ false: colors.border, true: colors.danger }}
                                />
                            </View>
                        </>
                    ) : null}

                    <View style={styles.modalActions}>
                        <Button label="Cancel" variant="ghost" onPress={closeVaultModal} />
                        <Button
                            label={vaultEditing.mode === 'edit' ? 'Save' : 'Create'}
                            onPress={submitVaultItem}
                            loading={submittingVaultItem}
                        />
                    </View>
                </ScrollView>
            </Modal>

            <Modal visible={transferModalVisible} onClose={closeTransferModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalTitle}>
                        {transferState.action === 'deposit'
                            ? 'Deposit into'
                            : transferState.action === 'withdraw'
                                ? 'Withdraw from'
                                : 'Adjust'} {transferState.itemName}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                        {transferState.action === 'deposit'
                            ? `Available in wallet: ${currency(walletBalance)}`
                            : `Available in ${transferState.itemName}: ${currency(transferState.currentAmount)}`}
                    </Text>

                    <PillFilter
                        options={[
                            { id: 'deposit', label: 'Deposit' },
                            { id: 'withdraw', label: 'Withdraw' },
                            { id: 'adjust', label: 'Adjust' },
                        ]}
                        selectedId={transferState.action}
                        onSelect={(id) => setTransferState((current) => ({
                            ...current,
                            action: id as 'deposit' | 'withdraw' | 'adjust',
                        }))}
                    />

                    <FormField
                        label="Amount"
                        keyboardType="decimal-pad"
                        value={transferAmount}
                        onChangeText={setTransferAmount}
                        placeholder="0.00"
                    />

                    <View style={styles.transferInfoCard}>
                        <Text style={styles.transferInfoTitle}>Transfer impact</Text>
                        <Text style={styles.transferInfoText}>
                            {transferState.action === 'deposit'
                                ? 'This moves money out of wallet and into the selected vault item.'
                                : transferState.action === 'withdraw'
                                    ? 'This moves money back into wallet from the selected vault item.'
                                    : 'This changes the reserved balance only and does not affect wallet totals.'}
                        </Text>
                    </View>

                    <View style={styles.modalActions}>
                        <Button label="Cancel" variant="ghost" onPress={closeTransferModal} />
                        <Button
                            label={
                                transferState.action === 'deposit'
                                    ? 'Confirm deposit'
                                    : transferState.action === 'withdraw'
                                        ? 'Confirm withdrawal'
                                        : 'Confirm adjustment'
                            }
                            onPress={submitTransfer}
                            loading={submittingTransfer}
                        />
                    </View>
                </ScrollView>
            </Modal>

            <TouchableOpacity style={styles.fab} onPress={() => openTransactionModal('expense')} accessibilityLabel="Add transaction">
                <Ionicons name="add" size={28} color={colors.surface} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl + 32,
        gap: spacing.lg,
    },
    header: {
        gap: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeights.sm,
    },
    sectionStack: {
        gap: spacing.md,
    },
    heroCard: {
        padding: spacing.xl,
        backgroundColor: '#1F2933',
        borderWidth: 1,
        borderColor: '#2D3B47',
    },
    heroContent: {
        gap: spacing.lg,
    },
    heroText: {
        gap: spacing.xs,
    },
    heroLabel: {
        color: '#B7C2CC',
        textTransform: 'uppercase',
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        letterSpacing: 1,
    },
    heroAmount: {
        color: colors.surface,
        fontSize: 40,
        fontWeight: typography.weights.bold,
    },
    heroSubtext: {
        color: '#C9D3DC',
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
    },
    heroActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    heroButton: {
        flex: 1,
    },
    statGrid: {
        gap: spacing.sm,
    },
    statCard: {
        gap: spacing.sm,
    },
    statIcon: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
        letterSpacing: 0.8,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        color: colors.textPrimary,
        fontWeight: typography.weights.bold,
    },
    budgetList: {
        gap: spacing.md,
    },
    budgetRow: {
        gap: spacing.xs,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    budgetCategory: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    budgetAmount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    progressTrack: {
        height: 10,
        backgroundColor: colors.borderLight,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: radius.pill,
    },
    breakdownList: {
        gap: spacing.md,
    },
    breakdownRow: {
        gap: spacing.xs,
    },
    breakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },
    breakdownLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    breakdownDot: {
        width: 10,
        height: 10,
        borderRadius: radius.pill,
    },
    breakdownName: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    breakdownValue: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    trendChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.xs,
        minHeight: 180,
        paddingTop: spacing.sm,
    },
    trendBarWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing.xs,
    },
    trendAmount: {
        fontSize: 10,
        color: colors.textTertiary,
    },
    trendTrack: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    trendBar: {
        width: '70%',
        backgroundColor: colors.primary,
        borderTopLeftRadius: radius.sm,
        borderTopRightRadius: radius.sm,
        minHeight: 4,
    },
    trendLabel: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    calendarTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    calendarActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceLayered,
    },
    calendarWeekdays: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    calendarWeekday: {
        flex: 1,
        textAlign: 'center',
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    calendarBlank: {
        width: '13%',
    },
    calendarDay: {
        width: '13%',
        minHeight: 74,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: spacing.xs,
        justifyContent: 'space-between',
    },
    calendarDaySelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    calendarDayText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
    },
    calendarDayToday: {
        color: colors.primary,
    },
    calendarDots: {
        flexDirection: 'row',
        gap: 3,
        alignSelf: 'center',
    },
    calendarDot: {
        width: 6,
        height: 6,
        borderRadius: radius.pill,
    },
    calendarNet: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: typography.weights.bold,
    },
    mutedText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transactionList: {
        gap: spacing.sm,
    },
    dayTransactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    dayTransactionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    dayTransactionAccent: {
        width: 4,
        alignSelf: 'stretch',
        borderRadius: radius.pill,
    },
    vaultHero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.secondaryLight,
        borderWidth: 1,
        borderColor: '#D8E2E9',
    },
    vaultLabel: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
        letterSpacing: 0.8,
    },
    vaultAmount: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    vaultBadge: {
        width: 52,
        height: 52,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vaultGrid: {
        gap: spacing.sm,
    },
    feedbackCard: {
        paddingVertical: spacing.md,
    },
    feedbackCardSuccess: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    feedbackCardError: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    feedbackText: {
        flex: 1,
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
    },
    vaultItemCard: {
        gap: spacing.md,
    },
    vaultItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    vaultItemName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    vaultActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    vaultActionButton: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    smallBadge: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vaultCurrent: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    transferActionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    transferButton: {
        flex: 1,
    },
    transferHistoryList: {
        gap: spacing.xs,
    },
    transferHistoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        paddingTop: spacing.xs,
    },
    transferHistoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    transferHistoryDot: {
        width: 8,
        height: 8,
        borderRadius: radius.pill,
    },
    transferHistoryLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    transferHistoryAmount: {
        fontSize: typography.sizes.xs,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordInfo: {
        flex: 1,
        gap: 2,
    },
    recordDesc: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    recordDate: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    amount: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
    },
    recordActions: {
        alignItems: 'flex-end',
        gap: spacing.xs,
    },
    deleteButton: {
        padding: spacing.xs,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeights.sm,
    },
    modalSectionLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
        marginBottom: spacing.sm,
    },
    categoryWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    categoryPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    categoryPillSelected: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    categoryPillText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    categoryPillTextSelected: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
    },
    switchCopy: {
        flex: 1,
        gap: 2,
    },
    switchTitle: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    switchDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transferInfoCard: {
        backgroundColor: colors.surfaceLayered,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    transferInfoTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    transferInfoText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeights.sm,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: spacing.lg,
        width: 60,
        height: 60,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.floating,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
});
