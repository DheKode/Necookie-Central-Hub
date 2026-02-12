import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingDown, Calendar, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Reusing StatCards Component
const StatCards = ({ stats, onOpenModal }) => (
    <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700 mb-6">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2">Net Available Balance</p>
                    <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter">
                        ₱{stats.totalBalance.toLocaleString()}
                    </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => onOpenModal('income')}
                        className="flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 w-full md:w-auto text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20"
                    >
                        <ArrowUpRight size={20} /> Add Income
                    </button>
                    <button
                        onClick={() => onOpenModal('expense')}
                        className="flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 w-full md:w-auto text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 bg-rose-500 hover:bg-rose-400 shadow-rose-900/20"
                    >
                        <ArrowDownRight size={20} /> Add Expense
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><TrendingDown size={20} /></div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Today's Burn</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.expenseToday.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Calendar size={20} /></div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Weekly Burn</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.expenseWeek.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-4 md:p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={20} /></div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Income Today</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main">₱{stats.incomeToday.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const FinanceDashboard = ({ stats, logs, onOpenModal, budgetStats, pieData, barData }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <StatCards stats={stats} onOpenModal={onOpenModal} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SPEND BREAKDOWN */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-text-main mb-4">Spend Breakdown</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* DAILY TREND */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-text-main mb-4">Daily Trend (Last 7 Days)</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                    dy={10}
                                />
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
        </div>
    );
};

export default FinanceDashboard;
