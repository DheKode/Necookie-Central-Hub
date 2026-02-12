import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, X, LayoutDashboard, Calendar, Shield, CreditCard, Filter, Search, Trash2, Zap, AlertTriangle, PieChart, BarChart as BarChartIcon
} from 'lucide-react';
import { api } from '../api';
import { format, isSameDay, isSameWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Import New Components
import FinanceDashboard from './FinanceDashboard';
import FinanceCalendar from './FinanceCalendar';
import FinanceVault from './FinanceVault';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const CATEGORIES = {
  INCOME: ['Allowance', 'Freelance', 'Gift', 'Salary', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Shopping', 'Games', 'Subscriptions', 'Other']
};

const BUDGET_LIMITS = {
  'Food': 5000,
  'Transport': 2000,
  'Shopping': 3000,
  'Games': 1000,
  'Subscriptions': 1500,
  'Other': 2000
};

// ==========================================
// 2. CUSTOM HOOK (Business Logic Layer)
// ==========================================
const useFinance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await api.fetchFinanceRecords();
        if (mounted && data) setLogs(data);
      } catch (err) {
        console.error("Failed to load finance records", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  // CRUD Actions
  const addTransaction = async (payload) => {
    const { data, error } = await api.addFinanceRecord(payload);
    if (!error && data) {
      setLogs(prevLogs => [data[0], ...prevLogs]);
      return true;
    }
    return false;
  };

  const deleteTransaction = async (id) => {
    const { error } = await api.deleteFinanceRecord(id);
    if (!error) {
      setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    let acc = { totalBalance: 0, incomeToday: 0, expenseToday: 0, expenseWeek: 0 };

    logs.forEach(log => {
      const val = parseFloat(log.amount);
      const logDate = parseISO(log.date);

      if (log.type === 'income') acc.totalBalance += val;
      else acc.totalBalance -= val;

      if (isSameDay(logDate, today)) {
        if (log.type === 'income') acc.incomeToday += val;
        else acc.expenseToday += val;
      }

      if (log.type === 'expense' && isSameWeek(logDate, today, { weekStartsOn: 1 })) {
        acc.expenseWeek += val;
      }
    });
    return acc;
  }, [logs]);

  // Budget Calc for Dashboard
  const budgetStats = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = logs.filter(l =>
      l.type === 'expense' &&
      isWithinInterval(parseISO(l.date), { start: startOfMonth(now), end: endOfMonth(now) })
    );

    const spending = {};
    CATEGORIES.EXPENSE.forEach(cat => spending[cat] = 0);

    currentMonthExpenses.forEach(l => {
      if (spending[l.category] !== undefined) spending[l.category] += l.amount;
    });

    return Object.keys(BUDGET_LIMITS).map(cat => {
      const spent = spending[cat] || 0;
      const limit = BUDGET_LIMITS[cat];
      const percentage = Math.min((spent / limit) * 100, 100);
      let color = 'bg-emerald-500'; // Safe
      if (percentage >= 80) color = 'bg-amber-500'; // Warning
      if (percentage >= 100) color = 'bg-rose-500'; // Danger
      return { category: cat, spent, limit, percentage, color };
    });
  }, [logs]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const categoryMap = {};
    const dailyMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[format(d, 'MMM d')] = 0;
    }

    logs.forEach(log => {
      if (log.type === 'expense') {
        categoryMap[log.category] = (categoryMap[log.category] || 0) + log.amount;
        const dayKey = format(parseISO(log.date), 'MMM d');
        if (dailyMap[dayKey] !== undefined) dailyMap[dayKey] += log.amount;
      }
    });

    const pieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));
    const barData = Object.keys(dailyMap).map(key => ({ date: key, amount: dailyMap[key] }));
    return { pieData, barData };
  }, [logs]);

  return { logs, loading, stats, addTransaction, deleteTransaction, budgetStats, chartData };
};

// ==========================================
// 3. SUB-COMPONENTS (Transaction Modal & Helpers)
// ==========================================
const TransactionModal = ({ isOpen, type, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: type === 'income' ? 'Allowance' : 'Food'
      });
    }
  }, [isOpen, type]);

  const handleSubmit = () => {
    if (!formData.amount || !formData.category) return;
    onConfirm({
      type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    });
  };

  if (!isOpen) return null;

  const categories = type === 'income' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE;
  const colorTheme = type === 'income' ? 'emerald' : 'rose';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`p-4 md:p-6 border-b border-border flex justify-between items-center bg-${colorTheme}-500/10`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 text-${colorTheme}-600`}>
            {type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            Add {type === 'income' ? 'Income' : 'Expense'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={20} /></button>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">₱</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-background border border-border rounded-xl pl-8 p-3 text-text-main focus:outline-none focus:border-primary font-mono font-bold text-lg"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.category === cat
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-background text-text-muted border-border hover:border-primary'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. McDo"
                className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 bg-surface-highlight border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-text-muted font-bold hover:bg-border rounded-xl transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 bg-${colorTheme}-500 hover:bg-${colorTheme}-600 shadow-${colorTheme}-500/20`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED: TRANSACTION TABLE WITH FILTERS ---
const TransactionTable = ({ logs, loading, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.amount.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'All' || log.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [logs, searchTerm, filterCategory]);

  const allCategories = ['All', ...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE];

  // Helper badge
  const CategoryBadge = ({ type, category }) => {
    const isIncome = type === 'income';
    const color = isIncome ? 'emerald' : 'rose';
    return (
      <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-${color}-500/10 text-${color}-600 border-${color}-500/20 whitespace-nowrap`}>
        {category}
      </span>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-card animate-in fade-in duration-500">
      {/* FILTER BAR */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
        <h3 className="text-base md:text-lg font-bold text-text-main flex items-center gap-2">
          Transaction History <span className="text-xs bg-surface-highlight px-2 py-0.5 rounded-full text-text-muted">{filteredLogs.length}</span>
        </h3>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"><Filter size={14} /></div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold text-text-muted"
            >
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-text-muted">Syncing with bank...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-10 text-center text-text-muted">No transactions found matching criteria.</div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-surface-highlight text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3 md:p-4">Date</th>
                <th className="p-3 md:p-4">Category</th>
                <th className="p-3 md:p-4">Description</th>
                <th className="p-3 md:p-4 text-right">Amount</th>
                <th className="p-3 md:p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-highlight/50 transition-colors group">
                  <td className="p-3 md:p-4 text-text-main text-xs md:text-sm font-medium whitespace-nowrap">
                    {format(parseISO(log.date), 'MMM d')}
                  </td>
                  <td className="p-3 md:p-4">
                    <CategoryBadge type={log.type} category={log.category} />
                  </td>
                  <td className="p-3 md:p-4 text-text-muted text-xs md:text-sm max-w-[120px] md:max-w-none truncate">
                    {log.description || '-'}
                  </td>
                  <td className={`p-3 md:p-4 text-right font-mono font-bold text-xs md:text-base ${log.type === 'income' ? 'text-emerald-500' : 'text-text-main'
                    }`}>
                    {log.type === 'income' ? '+' : '-'} ₱{log.amount.toLocaleString()}
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <button onClick={() => onDelete(log.id)} className="text-text-muted hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const Finance = () => {
  const { logs, loading, stats, addTransaction, deleteTransaction, budgetStats, chartData } = useFinance();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'income' });
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, calendar, vault, transactions
  const [calendarDate, setCalendarDate] = useState(new Date());

  const openModal = (type) => setModalConfig({ isOpen: true, type });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleConfirmTransaction = async (payload) => {
    const success = await addTransaction(payload);
    if (success) closeModal();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'transactions', label: 'History', icon: CreditCard },
  ];

  return (
    <div className="p-4 md:p-8 pb-32 max-w-[1400px] mx-auto min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Finance Hub
          </h1>
          <p className="text-text-muted text-sm">Track your cash flow, savings, and future.</p>
        </div>

        {/* TABS COMPONENT */}
        <div className="flex bg-surface border border-border p-1 rounded-2xl overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-surface-highlight text-text-main shadow-sm'
                : 'text-text-muted hover:text-text-main hover:bg-surface-highlight/50'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

        {activeTab === 'dashboard' && (
          <FinanceDashboard
            stats={stats}
            logs={logs}
            onOpenModal={openModal}
            budgetStats={budgetStats}
            pieData={chartData.pieData}
            barData={chartData.barData}
          />
        )}

        {activeTab === 'calendar' && (
          <FinanceCalendar
            logs={logs}
            currentDate={calendarDate}
            onDateChange={setCalendarDate}
          />
        )}

        {activeTab === 'vault' && (
          <FinanceVault
            walletBalance={stats.totalBalance}
            onTransaction={addTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionTable
            logs={logs}
            loading={loading}
            onDelete={deleteTransaction}
          />
        )}

      </div>

      <TransactionModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={closeModal}
        onConfirm={handleConfirmTransaction}
      />
    </div>
  );
};

export default Finance;