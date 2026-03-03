export const FINANCE_TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'vault', label: 'Vault' },
    { id: 'transactions', label: 'Transactions' },
] as const;

export const TRANSACTION_TYPES = [
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
] as const;

export const CREATE_TYPES = [
    { id: 'fund', label: 'Fund' },
    { id: 'goal', label: 'Goal' },
] as const;

export const TRANSFER_TYPES = [
    { id: 'deposit', label: 'Deposit' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'adjust', label: 'Adjust' },
] as const;

export const CATEGORIES = {
    income: ['Allowance', 'Freelance', 'Gift', 'Salary', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Games', 'Subscriptions', 'Other'],
};

export const BUDGET_LIMITS: Record<string, number> = {
    Food: 5000,
    Transport: 2000,
    Shopping: 3000,
    Games: 1000,
    Subscriptions: 1500,
    Other: 2000,
};

export const CATEGORY_COLORS = ['#748C7B', '#6E8B9E', '#D39655', '#BD6F6B', '#9D8AC7', '#D88C9A'];
