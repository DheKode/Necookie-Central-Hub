export type FinanceRecord = {
    id: number;
    type: 'income' | 'expense';
    amount: number | string;
    category: string;
    description?: string | null;
    date: string;
};

export type FundRecord = {
    id: number;
    name: string;
    target_amount: number | string;
    current_amount?: number | string | null;
    color?: string | null;
};

export type GoalRecord = {
    id: number;
    name: string;
    target_amount: number | string;
    current_amount?: number | string | null;
    deadline?: string | null;
    is_emergency_fund?: boolean;
};

export type VaultEditingState =
    | { mode: 'create'; itemType: 'fund' | 'goal'; itemId: null }
    | { mode: 'edit'; itemType: 'fund' | 'goal'; itemId: number };

export type VaultTransferState = {
    visible: boolean;
    itemType: 'fund' | 'goal';
    action: 'deposit' | 'withdraw' | 'adjust';
    itemId: number | null;
    itemName: string;
    currentAmount: number;
};

export type VaultFeedback = {
    tone: 'success' | 'error';
    message: string;
};

export type VaultTransferEntry = {
    id: number;
    direction: 'deposit' | 'withdraw';
    amount: number;
    date: string;
    description: string;
};

export type FinanceStats = {
    totalBalance: number;
    incomeToday: number;
    expenseToday: number;
    expenseWeek: number;
};

export type BudgetStat = {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
    tone: 'success' | 'warning' | 'danger';
};

export type DaySummary = {
    income: number;
    expense: number;
    transactions: FinanceRecord[];
};

export type TransactionFormState = {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description: string;
    date: string;
};

export type VaultFormState = {
    type: 'fund' | 'goal';
    name: string;
    target: string;
    deadline: string;
    isEmergency: boolean;
};
