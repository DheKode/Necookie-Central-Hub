import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Calendar, Shield, CreditCard
} from 'lucide-react';
import { api } from '../api'; // Import API helper for backend calls
import { format, isSameDay, isSameWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'; // Date utility library

// Import Extracted Components
// separating components into their own files makes the code cleaner and easier to maintain.
import FinanceDashboard from './FinanceDashboard';
import FinanceCalendar from './FinanceCalendar';
import FinanceVault from './FinanceVault';
import TransactionModal from '../components/finance/TransactionModal';
import TransactionTable from '../components/finance/TransactionTable';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
// Defining constant data structures for the application.
// We export these so other components (like TransactionModal) can use them.

import { CATEGORIES, BUDGET_LIMITS } from '../constants/finance';


// ==========================================
// 2. CUSTOM HOOK (Business Logic Layer)
// ==========================================
// We use a custom hook to separate the "logic" (state, effects, calculations) from the "view" (JSX).
// This makes the main component much smaller and easier to read.
const useFinance = () => {
  // State: 'logs' holds the array of transaction records fetched from server.
  const [logs, setLogs] = useState([]);

  // State: 'loading' tracks if we are currently fetching data.
  const [loading, setLoading] = useState(true);

  // useEffect: Runs once when the component mounts to load initial data.
  useEffect(() => {
    let mounted = true; // Flag to prevent state updates if component unmounts

    // Async function to fetch data
    const loadData = async () => {
      try {
        // Call API to get finance records
        const data = await api.fetchFinanceRecords();
        // Update state if component is still mounted
        if (mounted && data) setLogs(data);
      } catch (err) {
        // Log errors to console for debugging
        console.error("Failed to load finance records", err);
      } finally {
        // Stop loading spinner regardless of success or failure
        if (mounted) setLoading(false);
      }
    };

    // Execute the function
    loadData();

    // Cleanup function: sets mounted to false when component unmounts
    return () => { mounted = false; };
  }, []); // Empty dependency array [] means this runs only once.

  // Function to add a new transaction
  const addTransaction = async (payload) => {
    // Send data to backend
    const { data, error } = await api.addFinanceRecord(payload);

    // If successful, update local state immediately (optimistic GUI or just sync)
    // We assume backend returns the created object in 'data' array
    if (!error && data) {
      // Prepend value so it appears first in the list
      setLogs(prevLogs => [data[0], ...prevLogs]);
      return true; // Return success status
    }
    return false; // Return failure status
  };

  // Function to delete a transaction
  const deleteTransaction = async (id) => {
    // Call API to delete
    const { error } = await api.deleteFinanceRecord(id);

    // If successful, remove from local state
    if (!error) {
      setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    }
  };

  // Calculation: General Statistics (Balance, Income, Expense)
  // useMemo caches the result so we don't recalculate on every render unless 'logs' changes.
  const stats = useMemo(() => {
    const today = new Date();
    // Accumulator object
    let acc = { totalBalance: 0, incomeToday: 0, expenseToday: 0, expenseWeek: 0 };

    logs.forEach(log => {
      const val = parseFloat(log.amount); // Ensure amount is a number
      const logDate = parseISO(log.date); // Convert ISO string to Date object

      // Total Balance Calculation
      if (log.type === 'income') acc.totalBalance += val;
      else acc.totalBalance -= val;

      // Daily Stats (Only if date matches today)
      if (isSameDay(logDate, today)) {
        if (log.type === 'income') acc.incomeToday += val;
        else acc.expenseToday += val;
      }

      // Weekly Expense Stats (Only if date is within current week)
      if (log.type === 'expense' && isSameWeek(logDate, today, { weekStartsOn: 1 })) {
        acc.expenseWeek += val;
      }
    });
    return acc; // Return the calculated stats
  }, [logs]);

  // Calculation: Budget Utilization
  // Calculates how much has been spent vs limits for the CURRENT MONTH.
  const budgetStats = useMemo(() => {
    const now = new Date();

    // Filter logs to find expenses in the current month
    const currentMonthExpenses = logs.filter(l =>
      l.type === 'expense' &&
      isWithinInterval(parseISO(l.date), { start: startOfMonth(now), end: endOfMonth(now) })
    );

    // Initialize spending tracker for each category
    const spending = {};
    CATEGORIES.EXPENSE.forEach(cat => spending[cat] = 0);

    // Sum up spending per category
    currentMonthExpenses.forEach(l => {
      if (spending[l.category] !== undefined) spending[l.category] += l.amount;
    });

    // Transform into an array of objects for the Dashboard to render
    return Object.keys(BUDGET_LIMITS).map(cat => {
      const spent = spending[cat] || 0;
      const limit = BUDGET_LIMITS[cat];
      // Calculate percentage, capped at 100
      const percentage = Math.min((spent / limit) * 100, 100);

      // Determine color based on severity
      let color = 'bg-emerald-500'; // Safe (Green)
      if (percentage >= 80) color = 'bg-amber-500'; // Warning (Orange)
      if (percentage >= 100) color = 'bg-rose-500'; // Danger (Red)

      return { category: cat, spent, limit, percentage, color };
    });
  }, [logs]);

  // Calculation: Chart Data (Pie and Bar charts)
  const chartData = useMemo(() => {
    const categoryMap = {}; // For Pie Chart
    const dailyMap = {};    // For Bar Chart

    // Initialize last 7 days for Bar Chart with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[format(d, 'MMM d')] = 0;
    }

    logs.forEach(log => {
      if (log.type === 'expense') {
        // Add to category total
        categoryMap[log.category] = (categoryMap[log.category] || 0) + log.amount;

        // Add to daily total if the day exists in our map (last 7 days)
        const dayKey = format(parseISO(log.date), 'MMM d');
        if (dailyMap[dayKey] !== undefined) dailyMap[dayKey] += log.amount;
      }
    });

    // Convert maps to arrays for Recharts
    const pieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));
    const barData = Object.keys(dailyMap).map(key => ({ date: key, amount: dailyMap[key] }));

    return { pieData, barData };
  }, [logs]);

  // Return all state and functions needed by the UI
  return { logs, loading, stats, addTransaction, deleteTransaction, budgetStats, chartData };
};

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
const Finance = () => {
  // Use the custom hook to get all data and logic
  const { logs, loading, stats, addTransaction, deleteTransaction, budgetStats, chartData } = useFinance();

  // State for the Transaction Modal (is it open? is it income or expense?)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'income' });

  // State for the active tab (Navigation)
  // Options: 'dashboard', 'calendar', 'vault', 'transactions'
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for the Calendar view (currently selected date/month)
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Helper function to open the modal with a specific type
  const openModal = (type) => setModalConfig({ isOpen: true, type });

  // Helper function to close the modal
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // Handler for when user submits a new transaction from the modal
  const handleConfirmTransaction = async (payload) => {
    const success = await addTransaction(payload);
    // Only close modal if transaction was successful
    if (success) closeModal();
  };

  // Navigation Tabs Configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'transactions', label: 'History', icon: CreditCard },
  ];

  return (
    // Main Container
    <div className="p-4 md:p-8 pb-32 max-w-[1400px] mx-auto min-h-screen">

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          {/* Title with Gradient Text */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Finance Hub
          </h1>
          <p className="text-text-muted text-sm">Track your cash flow, savings, and future.</p>
        </div>

        {/* --- TABS COMPONENT --- */}
        <div className="flex bg-surface border border-border p-1 rounded-2xl overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              // Switch tab on click
              onClick={() => setActiveTab(tab.id)}
              // Dynamic CSS classes for active vs inactive state
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-surface-highlight text-text-main shadow-sm' // Active Style
                : 'text-text-muted hover:text-text-main hover:bg-surface-highlight/50' // Inactive Style
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* 1. Dashboard Tab */}
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

        {/* 2. Calendar Tab */}
        {activeTab === 'calendar' && (
          <FinanceCalendar
            logs={logs}
            currentDate={calendarDate}
            onDateChange={setCalendarDate}
          />
        )}

        {/* 3. Vault Tab (Savings) */}
        {activeTab === 'vault' && (
          <FinanceVault
            walletBalance={stats.totalBalance}
            onTransaction={addTransaction}
          />
        )}

        {/* 4. Transactions History Tab */}
        {activeTab === 'transactions' && (
          <TransactionTable
            logs={logs}
            loading={loading}
            onDelete={deleteTransaction}
            categories={CATEGORIES}
          />
        )}

      </div>

      {/* --- GLOBAL MODALS --- */}
      {/* Transaction Modal (Popup) */}
      <TransactionModal
        key={modalConfig.isOpen ? 'open' : 'closed'}
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={closeModal}
        onConfirm={handleConfirmTransaction}
        categories={CATEGORIES}
      />
    </div>
  );
};

export default Finance;