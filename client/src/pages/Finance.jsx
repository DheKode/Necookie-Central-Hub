import React, { useState } from 'react';
import TransactionModal from '../components/finance/TransactionModal';
import TransactionTable from '../components/finance/TransactionTable';
import { CATEGORIES } from '../constants/finance';
import { FINANCE_TABS } from '../constants/financeTabs';
import { useFinance } from '../hooks/useFinance';
import FinanceCalendar from './FinanceCalendar';
import FinanceDashboard from './FinanceDashboard';
import FinanceVault from './FinanceVault';

const Finance = () => {
  const {
    logs,
    loading,
    stats,
    addTransaction,
    deleteTransaction,
    budgetStats,
    chartData,
    customCategories
  } = useFinance();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'income' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const openModal = (type) => setModalConfig({ isOpen: true, type });
  const closeModal = () => setModalConfig((currentConfig) => ({ ...currentConfig, isOpen: false }));

  const handleConfirmTransaction = async (payload) => {
    const success = await addTransaction(payload);

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Finance Hub
          </h1>
          <p className="text-text-muted text-sm">Track your cash flow, savings, and future.</p>
        </div>

        <div className="flex bg-surface border border-border p-1 rounded-2xl overflow-x-auto w-full md:w-auto custom-scrollbar">
          {FINANCE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
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
            categories={CATEGORIES}
          />
        )}
      </div>

      <TransactionModal
        key={modalConfig.isOpen ? 'open' : 'closed'}
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={closeModal}
        onConfirm={handleConfirmTransaction}
        categories={CATEGORIES}
        customCategories={customCategories}
      />
    </div>
  );
};

export default Finance;
