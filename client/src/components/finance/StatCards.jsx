import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingDown, Calendar, TrendingUp } from 'lucide-react';

/**
 * StatCards Component
 * 
 * Displays the high-level summary of the user's finances.
 * Includes:
 * 1. The main "Net Available Balance" card with Quick Action buttons.
 * 2. Three smaller cards for Today's Burn (Expense), Weekly Burn, and Today's Income.
 * 
 * Props:
 * @param {object} stats - Object containing totalBalance, expenseToday, expenseWeek, incomeToday.
 * @param {function} onOpenModal - Function to open the Add Transaction modal.
 */
const StatCards = ({ stats, onOpenModal }) => (
    <div className="mb-6 md:mb-8">

        {/* --- MAIN BALANCE CARD --- */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700 mb-6">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

                {/* Balance Display */}
                <div>
                    <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2">
                        Net Available Balance
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter">
                        ₱{stats.totalBalance.toLocaleString()}
                    </h2>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Add Income Button */}
                    <button
                        onClick={() => onOpenModal('income')}
                        className="flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 w-full md:w-auto text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20"
                    >
                        <ArrowUpRight size={20} /> Add Income
                    </button>

                    {/* Add Expense Button */}
                    <button
                        onClick={() => onOpenModal('expense')}
                        className="flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 w-full md:w-auto text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 bg-rose-500 hover:bg-rose-400 shadow-rose-900/20"
                    >
                        <ArrowDownRight size={20} /> Add Expense
                    </button>
                </div>
            </div>
        </div>

        {/* --- SECONDARY STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">

            {/* Card 1: Today's Expense */}
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                        <TrendingDown size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Today's Burn</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.expenseToday.toLocaleString()}</p>
            </div>

            {/* Card 2: Weekly Expense */}
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                        <Calendar size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Weekly Burn</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.expenseWeek.toLocaleString()}</p>
            </div>

            {/* Card 3: Today's Income */}
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Income Today</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.incomeToday.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

export default StatCards;
