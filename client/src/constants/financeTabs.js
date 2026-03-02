import {
    Calendar,
    CreditCard,
    LayoutDashboard,
    Shield
} from 'lucide-react';

export const FINANCE_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'transactions', label: 'History', icon: CreditCard }
];
