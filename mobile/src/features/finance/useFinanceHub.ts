import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    startOfMonth,
} from 'date-fns';
import { dataService } from '../../services/dataService';
import { CATEGORIES } from './constants';
import {
    buildBudgetStats,
    buildCategoryData,
    buildDailyMap,
    buildDailyTrend,
    buildStats,
    normalizeFundRecord,
    normalizeGoalRecord,
    toAmount,
} from './utils';
import type {
    FinanceRecord,
    FundRecord,
    GoalRecord,
    TransactionFormState,
    VaultEditingState,
    VaultFeedback,
    VaultFormState,
    VaultTransferState,
} from './types';

const createTransactionForm = (type: 'income' | 'expense'): TransactionFormState => ({
    type,
    amount: '',
    category: CATEGORIES[type][0],
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
});

const createVaultForm = (type: 'fund' | 'goal'): VaultFormState => ({
    type,
    name: '',
    target: '',
    deadline: '',
    isEmergency: false,
});

const defaultVaultEditing = (): VaultEditingState => ({
    mode: 'create',
    itemType: 'fund',
    itemId: null,
});

const defaultTransferState = (): VaultTransferState => ({
    visible: false,
    itemType: 'fund',
    action: 'deposit',
    itemId: null,
    itemName: '',
    currentAmount: 0,
});

export const useFinanceHub = () => {
    const [records, setRecords] = useState<FinanceRecord[]>([]);
    const [funds, setFunds] = useState<FundRecord[]>([]);
    const [goals, setGoals] = useState<GoalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submittingTransaction, setSubmittingTransaction] = useState(false);
    const [submittingVaultItem, setSubmittingVaultItem] = useState(false);
    const [submittingTransfer, setSubmittingTransfer] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'vault' | 'transactions'>('dashboard');
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [vaultModalVisible, setVaultModalVisible] = useState(false);
    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [vaultEditing, setVaultEditing] = useState<VaultEditingState>(defaultVaultEditing);
    const [transferState, setTransferState] = useState<VaultTransferState>(defaultTransferState);
    const [vaultFeedback, setVaultFeedback] = useState<VaultFeedback | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [transactionForm, setTransactionForm] = useState<TransactionFormState>(createTransactionForm('expense'));
    const [vaultForm, setVaultForm] = useState<VaultFormState>(createVaultForm('fund'));
    const [transferAmount, setTransferAmount] = useState('');

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
        setTransactionForm(createTransactionForm(type));
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

            if (data?.[0]) {
                setRecords((current) => [data[0] as FinanceRecord, ...current]);
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
        setVaultEditing(defaultVaultEditing());
    };

    const openVaultModal = (type: 'fund' | 'goal') => {
        setVaultEditing({ mode: 'create', itemType: type, itemId: null });
        setVaultForm(createVaultForm(type));
        setVaultModalVisible(true);
    };

    const openVaultEditModal = (item: FundRecord | GoalRecord, type: 'fund' | 'goal') => {
        const goalItem = type === 'goal' ? item as GoalRecord : null;

        setVaultEditing({ mode: 'edit', itemType: type, itemId: item.id });
        setVaultForm({
            type,
            name: item.name,
            target: String(toAmount(item.target_amount)),
            deadline: goalItem?.deadline ?? '',
            isEmergency: Boolean(goalItem?.is_emergency_fund),
        });
        setVaultModalVisible(true);
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
                const saved = result.data?.[0] ? normalizeFundRecord(result.data[0]) : undefined;

                if (result.error) {
                    throw result.error;
                }

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
                const saved = result.data?.[0] ? normalizeGoalRecord(result.data[0]) : undefined;

                if (result.error) {
                    throw result.error;
                }

                if (saved) {
                    setGoals((current) => (
                        vaultEditing.mode === 'edit'
                            ? current.map((goal) => (goal.id === saved.id ? { ...goal, ...saved } : goal))
                            : [...current, saved]
                    ));
                }
            }

            closeVaultModal();
            setVaultForm(createVaultForm('fund'));
        } catch (error) {
            console.error('Failed to save vault item:', error);
            Alert.alert('Error', 'Failed to save vault item.');
        } finally {
            setSubmittingVaultItem(false);
        }
    };

    const deleteVaultItem = (itemType: 'fund' | 'goal', itemId: number) => {
        const noun = itemType === 'fund' ? 'fund' : 'goal';

        Alert.alert(`Delete ${noun}`, `This will permanently remove the savings ${noun}.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const result = itemType === 'fund'
                            ? await dataService.deleteFund(itemId)
                            : await dataService.deleteGoal(itemId);

                        if (result.error) {
                            throw result.error;
                        }

                        if (itemType === 'fund') {
                            setFunds((current) => current.filter((fund) => fund.id !== itemId));
                        } else {
                            setGoals((current) => current.filter((goal) => goal.id !== itemId));
                        }
                    } catch (error) {
                        console.error(`Failed to delete ${noun}:`, error);
                        Alert.alert('Error', `Failed to delete ${noun}.`);
                    }
                },
            },
        ]);
    };

    const closeTransferModal = () => {
        setTransferModalVisible(false);
        setTransferAmount('');
        setTransferState(defaultTransferState());
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
        const financePayload = transferState.action === 'adjust'
            ? null
            : {
                type: transferState.action === 'deposit' ? 'expense' as const : 'income' as const,
                amount,
                category: 'Savings',
                description: `${transferState.action === 'deposit' ? 'Transfer to' : 'Withdraw from'} ${transferState.itemName}`,
                date: format(new Date(), 'yyyy-MM-dd'),
                payment_method: null,
                is_recurring: false,
                recurrence_interval: null,
            };

        try {
            const updatePromise = transferState.itemType === 'fund'
                ? dataService.updateFund(transferState.itemId, { current_amount: nextAmount })
                : dataService.updateGoal(transferState.itemId, { current_amount: nextAmount });
            const financePromise = financePayload
                ? dataService.addFinanceRecord(financePayload)
                : Promise.resolve({ data: null, error: null });
            const [updateResult, financeResult] = await Promise.all([updatePromise, financePromise]);

            if (updateResult.error) {
                throw updateResult.error;
            }

            if (financeResult.error) {
                throw financeResult.error;
            }

            if (transferState.itemType === 'fund' && updateResult.data?.[0]) {
                const normalized = normalizeFundRecord(updateResult.data[0]);
                setFunds((current) => current.map((fund) => (fund.id === normalized.id ? { ...fund, ...normalized } : fund)));
            }

            if (transferState.itemType === 'goal' && updateResult.data?.[0]) {
                const normalized = normalizeGoalRecord(updateResult.data[0]);
                setGoals((current) => current.map((goal) => (goal.id === normalized.id ? { ...goal, ...normalized } : goal)));
            }

            if (financeResult.data?.[0]) {
                setRecords((current) => [financeResult.data[0] as FinanceRecord, ...current]);
            }

            setVaultFeedback({
                tone: 'success',
                message: transferState.action === 'adjust'
                    ? `Adjusted ${transferState.itemName} to $${Math.round(amount).toLocaleString()} without changing wallet balance.`
                    : `${transferState.action === 'deposit' ? 'Moved' : 'Returned'} $${Math.round(amount).toLocaleString()} ${transferState.action === 'deposit' ? 'into' : 'from'} ${transferState.itemName}.`,
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

    return {
        records,
        funds,
        goals,
        loading,
        refreshing,
        submittingTransaction,
        submittingVaultItem,
        submittingTransfer,
        activeTab,
        setActiveTab,
        transactionModalVisible,
        setTransactionModalVisible,
        vaultModalVisible,
        transferModalVisible,
        vaultEditing,
        vaultFeedback,
        calendarMonth,
        setCalendarMonth,
        selectedDate,
        setSelectedDate,
        transactionForm,
        setTransactionForm,
        vaultForm,
        setVaultForm,
        transferState,
        setTransferState,
        transferAmount,
        setTransferAmount,
        stats,
        budgetStats,
        categoryData,
        dailyTrend,
        dailyMap,
        selectedDay,
        daysInMonth,
        blankDays,
        maxTrendAmount,
        walletBalance,
        onRefresh,
        openTransactionModal,
        submitTransaction,
        deleteTransaction,
        openVaultModal,
        openVaultEditModal,
        closeVaultModal,
        submitVaultItem,
        deleteVaultItem,
        openTransferModal,
        closeTransferModal,
        submitTransfer,
    };
};
