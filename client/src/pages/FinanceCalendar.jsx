import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * FinanceCalendar Component
 * 
 * Displays a monthly calendar view of expenses and income.
 * Colors dates based on activity and allows monthly navigation.
 * 
 * Props:
 * @param {Array} logs - List of transaction logs.
 * @param {Date} currentDate - The currently selected month/year.
 * @param {Function} onDateChange - Callback to change the current date (for navigation).
 */
const FinanceCalendar = ({ logs, currentDate, onDateChange }) => {

    // useMemo: Calculate all days in the current month only when currentDate changes.
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        // Returns an array of Date objects for every day in the month
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // useMemo: Pre-process logs into a map for O(1) lookup by date.
    // Instead of filtering the logs array for every single day (O(N*M)), we loop logs once.
    const dailyData = useMemo(() => {
        const map = {};
        logs.forEach(log => {
            // Key format: YYYY-MM-DD
            const dateKey = format(parseISO(log.date), 'yyyy-MM-dd');

            // Initialize if key doesn't exist
            if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0, transactions: [] };

            // Aggregate values
            if (log.type === 'income') map[dateKey].income += log.amount;
            else map[dateKey].expense += log.amount;

            // Store transaction ref for tooltips
            map[dateKey].transactions.push(log);
        });
        return map;
    }, [logs]);

    // Calculate how many blank spaces needed at start of grid 
    // e.g. if Month starts on Tuesday (2), need 2 blanks (Sun, Mon).
    const startDay = getDay(startOfMonth(currentDate)); // 0 = Sunday
    const blanks = Array(startDay).fill(null);

    // Handler: Go to previous month
    const prevMonth = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - 1);
        onDateChange(d);
    };

    // Handler: Go to next month
    const nextMonth = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        onDateChange(d);
    };

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm animate-in fade-in duration-500">

            {/* --- HEADER: MONTH NAVIGATION --- */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-xl font-bold text-text-main capitalize">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-text-main">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-text-main">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* --- WEEKDAY HEADERS (Sun, Mon, etc.) --- */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-bold text-text-muted uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* --- CALENDAR GRID --- */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 auto-rows-fr">

                {/* Render Blank Cells for alignment */}
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} className="p-2" />
                ))}

                {/* Render actual days */}
                {daysInMonth.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const data = dailyData[dateKey];
                    const isToday = isSameDay(day, new Date());

                    // Net calculations for the day
                    const net = data ? data.income - data.expense : 0;

                    return (
                        <div
                            key={dateKey}
                            className={`
                                min-h-[80px] md:min-h-[100px] p-2 rounded-2xl border transition-all relative group
                                ${isToday ? 'border-primary ring-1 ring-primary/50' : 'border-border bg-surface'}
                                ${data ? 'hover:border-text-muted/50 cursor-pointer' : ''}
                            `}
                        >
                            {/* Day Number and Summary Dots */}
                            <div className="flex justify-between items-start">
                                {/* Day Number */}
                                <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                                    {format(day, 'd')}
                                </span>

                                {/* Quick visual summary (k format) */}
                                {data && (
                                    <div className="flex flex-col items-end">
                                        {data.income > 0 && <span className="text-[10px] text-emerald-500 font-bold">+{Math.round(data.income / 1000)}k</span>}
                                        {data.expense > 0 && <span className="text-[10px] text-rose-500 font-bold">-{Math.round(data.expense / 1000)}k</span>}
                                    </div>
                                )}
                            </div>

                            {/* Net Indicator (Profit/Loss for the day) */}
                            {data && (
                                <div className={`mt-2 text-xs font-bold text-center py-1 rounded-lg ${net >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    {net >= 0 ? '+' : ''}{net.toLocaleString()}
                                </div>
                            )}

                            {/* HOVER TOOLTIP: Shows list of transactions */}
                            {data && (
                                <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm rounded-2xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col overflow-y-auto pointer-events-none md:pointer-events-auto">
                                    <p className="text-[10px] font-bold text-text-muted mb-1 border-b border-border pb-1">Transactions</p>

                                    {/* List top 3 transactions */}
                                    {data.transactions.slice(0, 3).map((t, idx) => (
                                        <div key={idx} className="flex justify-between text-[10px] mb-0.5">
                                            <span className="truncate max-w-[60%]">{t.description || t.category}</span>
                                            <span className={t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>
                                                {t.type === 'income' ? '+' : '-'} {t.amount}
                                            </span>
                                        </div>
                                    ))}

                                    {/* 'More' indicator */}
                                    {data.transactions.length > 3 && (
                                        <span className="text-[10px] text-text-muted text-center block mt-1">
                                            +{data.transactions.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FinanceCalendar;
