import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Trash2, X, CreditCard,
  TrendingUp, TrendingDown, Calendar, Search, Filter, PieChart, BarChart as BarChartIcon, AlertTriangle, Zap
} from 'lucide-react';
import {
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { api } from '../api';
import { format, isSameDay, isSameWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const CATEGORIES = {
  INCOME: ['Allowance', 'Freelance', 'Gift', 'Salary', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Shopping', 'Games', 'Subscriptions', 'Other']
};

// Mock Budget Limits (In a real app, these would be in the DB)
const BUDGET_LIMITS = {
  'Food': 5000,
  'Transport': 2000,
  'Shopping': 3000,
  'Games': 1000,
  'Subscriptions': 1500,
  'Other': 2000
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

  return { logs, loading, stats, addTransaction, deleteTransaction };
};

// ==========================================
// 3. SUB-COMPONENTS (Presentation Layer)
// ==========================================

// --- NEW: BUDGET OVERVIEW COMPONENT ---
const BudgetOverview = ({ logs }) => {
  // Calculate spending per category for the current month
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

      // Determine Status Color
      let color = 'bg-emerald-500'; // Safe
      if (percentage >= 80) color = 'bg-amber-500'; // Warning
      if (percentage >= 100) color = 'bg-rose-500'; // Danger

      return { category: cat, spent, limit, percentage, color };
    });
  }, [logs]);

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Zap size={20} /></div>
        <h3 className="font-bold text-text-main">Monthly Budgets</h3>
      </div>

      <div className="space-y-5">
        {budgetStats.map((item) => (
          <div key={item.category}>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-text-main">{item.category}</span>
              <span className={item.percentage >= 100 ? "text-rose-500" : "text-text-muted"}>
                ₱{item.spent.toLocaleString()} / ₱{item.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 w-full bg-surface-highlight rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            {item.percentage >= 80 && item.percentage < 100 && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                <AlertTriangle size={10} /> Approaching Limit
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- NEW: CHARTS COMPONENT ---
const AnalyticsSection = ({ logs }) => {
  const data = useMemo(() => {
    // Pie Data
    const categoryMap = {};
    // Bar Data (Last 7 days)
    const dailyMap = {};

    // Initialize last 7 days for bar chart
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[format(d, 'MMM d')] = 0;
    }

    logs.forEach(log => {
      if (log.type === 'expense') {
        // Pie Prep
        categoryMap[log.category] = (categoryMap[log.category] || 0) + log.amount;

        // Bar Prep
        const dayKey = format(parseISO(log.date), 'MMM d');
        if (dailyMap[dayKey] !== undefined) {
          dailyMap[dayKey] += log.amount;
        }
      }
    });

    const pieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));
    const barData = Object.keys(dailyMap).map(key => ({ date: key, amount: dailyMap[key] }));

    return { pieData, barData };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* PIE CHART */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><PieChart size={20} /></div>
          <h3 className="font-bold text-text-main">Spend Breakdown</h3>
        </div>
        <div className="flex-1 w-full min-h-[200px]">
          {data.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.pieData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted text-sm">No expense data yet</div>
          )}
        </div>
      </div>

      {/* BAR CHART */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500"><BarChartIcon size={20} /></div>
          <h3 className="font-bold text-text-main">Daily Trend</h3>
        </div>
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--surface-highlight)' }}
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCards = ({ stats, onOpenModal }) => (
  <div className="max-w-6xl mx-auto mb-6 md:mb-8">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700 mb-6">
      <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
        <CreditCard size={150} />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2">Net Available Balance</p>
          <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter">
            ₱{stats.totalBalance.toLocaleString()}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <ActionButton
            icon={<ArrowUpRight size={20} />}
            label="Add Income"
            colorClass="bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20"
            onClick={() => onOpenModal('income')}
          />
          <ActionButton
            icon={<ArrowDownRight size={20} />}
            label="Add Expense"
            colorClass="bg-rose-500 hover:bg-rose-400 shadow-rose-900/20"
            onClick={() => onOpenModal('expense')}
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <MiniStatCard
        label="Today's Burn"
        amount={stats.expenseToday}
        icon={<TrendingDown size={20} />}
        color="rose"
      />
      <MiniStatCard
        label="Weekly Burn"
        amount={stats.expenseWeek}
        icon={<Calendar size={20} />}
        color="orange"
      />
      <MiniStatCard
        label="Income Today"
        amount={stats.incomeToday}
        icon={<TrendingUp size={20} />}
        color="emerald"
      />
    </div>
  </div>
);

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

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-card">
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

// ... [Keep TransactionModal, ActionButton, MiniStatCard, CategoryBadge EXACTLY as they were] ...
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

const ActionButton = ({ icon, label, colorClass, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 w-full md:w-auto text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 ${colorClass}`}
  >
    {icon} {label}
  </button>
);

const MiniStatCard = ({ label, amount, icon, color }) => (
  <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 bg-${color}-500/10 rounded-lg text-${color}-500`}>{icon}</div>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl md:text-2xl font-bold text-text-main">₱{amount.toLocaleString()}</p>
  </div>
);

const CategoryBadge = ({ type, category }) => {
  const isIncome = type === 'income';
  const color = isIncome ? 'emerald' : 'rose';
  return (
    <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-${color}-500/10 text-${color}-600 border-${color}-500/20 whitespace-nowrap`}>
      {category}
    </span>
  );
};

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const Finance = () => {
  const { logs, loading, stats, addTransaction, deleteTransaction } = useFinance();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'income' });

  const openModal = (type) => setModalConfig({ isOpen: true, type });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleConfirmTransaction = async (payload) => {
    const success = await addTransaction(payload);
    if (success) closeModal();
  };

  return (
    <div className="p-4 md:p-8 pb-24 max-w-6xl mx-auto">
      <StatCards stats={stats} onOpenModal={openModal} />

      {/* GRID LAYOUT FOR CHARTS AND BUDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AnalyticsSection logs={logs} />
        </div>
        <div className="lg:col-span-1">
          <BudgetOverview logs={logs} />
        </div>
      </div>

      <TransactionTable
        logs={logs}
        loading={loading}
        onDelete={deleteTransaction}
      />

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