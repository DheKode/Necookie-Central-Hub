import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid
} from 'recharts';

// Import Extracted Component
// Loading StatCards from the components folder because it's a large reusable chunk of UI.
import StatCards from '../components/finance/StatCards';

// Define localized colors for the charts
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * FinanceDashboard Component
 * 
 * Displays the main analytical view of the finance app.
 * Includes:
 * 1. Top Stat Cards (Balance, Today's stats) via StatCards component.
 * 2. Spend Breakdown Pie Chart.
 * 3. Daily Trend Bar Chart.
 * 
 * Props:
 * @param {object} stats - Aggregated statistics (totalBalance, etc).
 * @param {array} logs - Raw transaction logs (unused directly here but passed down if needed, usually stats is enough).
 * @param {function} onOpenModal - Callback to open the transaction modal.
 * @param {array} budgetStats - (Optional) used for budget progress bars if we add them later.
 * @param {array} pieData - Data formatted for the Pie Chart.
 * @param {array} barData - Data formatted for the Bar Chart.
 */
// Custom Tooltip Component that adapts to theme
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border p-3 rounded-xl shadow-xl">
                <p className="font-bold text-text-main mb-1">{label ? label : payload[0].name}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
                        {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const FinanceDashboard = ({ stats, onOpenModal, pieData, barData }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. TOP STATS CARDS */}
            <StatCards stats={stats} onOpenModal={onOpenModal} />

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- CHART 1: SPEND BREAKDOWN (PIE) --- */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-text-main mb-4">Spend Breakdown</h3>
                    <div className="flex-1">
                        {/* ResponsiveContainer makes the chart adapt to parent size */}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} // Donut chart style
                                    outerRadius={80}
                                    paddingAngle={5} // Space between slices
                                    dataKey="value"
                                >
                                    {/* Map data to Cells with specific colors */}
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* Tooltip on hover */}
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custom Legend Below Chart */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- CHART 2: DAILY TREND (BAR) --- */}
                <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-text-main mb-4">Daily Trend (Last 7 Days)</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                {/* Grid lines behind bars */}
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />

                                {/* X Axis: Dates */}
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }} // Recharts tick styles are inline, CSS vars usually work here but verify
                                    dy={10}
                                />

                                {/* Tooltip on hover */}
                                <Tooltip
                                    cursor={{ fill: 'var(--surface-highlight)', opacity: 0.5 }}
                                    content={<CustomTooltip />}
                                />

                                {/* The Bars themselves */}
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
