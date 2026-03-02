import React, { useMemo, useState } from 'react';
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
    // State: Selected date for viewing details (defaults to today)
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Effect: Sync selected date when month changes, if the new month contains the selected date
    // (Optional enhancement, for now we just keep the separate state)

    // useMemo: Calculate all days in the current month only when currentDate changes.
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // useMemo: HashMap for O(1) lookup
    const dailyData = useMemo(() => {
        const map = {};
        logs.forEach(log => {
            const dateKey = format(parseISO(log.date), 'yyyy-MM-dd');
            if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0, transactions: [] };
            if (log.type === 'income') map[dateKey].income += log.amount;
            else map[dateKey].expense += log.amount;
            map[dateKey].transactions.push(log);
        });
        return map;
    }, [logs]);

    const startDay = getDay(startOfMonth(currentDate));
    const blanks = Array(startDay).fill(null);

    const prevMonth = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - 1);
        onDateChange(d);
    };

    const nextMonth = () => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + 1);
        onDateChange(d);
    };

    // Get logs for the currently selected date
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const selectedLogs = dailyData[selectedDateKey]?.transactions || [];

    return (
        <div className="space-y-6">
            {/* --- CALENDAR GRID CARD --- */}
            <div className="bg-surface border border-border rounded-3xl p-4 md:p-6 shadow-sm animate-in fade-in duration-500">
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

                <div className="grid grid-cols-7 mb-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="text-[10px] md:text-sm font-bold text-text-muted uppercase py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-4 auto-rows-fr">
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="p-1" />
                    ))}

                    {daysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const data = dailyData[dateKey];
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);
                        const net = data ? data.income - data.expense : 0;

                        return (
                            <div
                                key={dateKey}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    min-h-[60px] md:min-h-[100px] p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all relative cursor-pointer
                                    ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-surface'}
                                    ${activeDayStyle(isToday, data)}
                                `}
                            >
                                <div className="flex flex-col justify-between h-full">
                                    <span className={`text-[10px] md:text-xs font-bold ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Mobile: Simple Dots */}
                                    <div className="flex md:hidden gap-0.5 mt-1 justify-center">
                                        {data?.income > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                        {data?.expense > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                                    </div>

                                    {/* Desktop: Detailed Numbers */}
                                    <div className="hidden md:flex flex-col items-end">
                                        {data?.income > 0 && <span className="text-[10px] text-emerald-500 font-bold">+{Math.round(data.income / 1000)}k</span>}
                                        {data?.expense > 0 && <span className="text-[10px] text-rose-500 font-bold">-{Math.round(data.expense / 1000)}k</span>}
                                    </div>

                                    {/* Net Indicator (Desktop only usually, or small on mobile) */}
                                    {data && (
                                        <div className={`hidden md:block mt-auto text-xs font-bold text-center py-1 rounded-lg ${net >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                            {net >= 0 ? '+' : ''}{net.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- SELECTED DATE DETAILS (Mobile Friendly) --- */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                    Activity for <span className="text-primary">{format(selectedDate, 'MMMM d')}</span>
                </h3>

                {selectedLogs.length === 0 ? (
                    <p className="text-text-muted text-sm italic">No transactions recorded for this date.</p>
                ) : (
                    <div className="space-y-3">
                        {selectedLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-highlight/50 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-10 rounded-full ${log.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <div>
                                        <p className="font-bold text-text-main text-sm">{log.description || log.category}</p>
                                        <p className="text-xs text-text-muted">{log.category}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-bold ${log.type === 'income' ? 'text-emerald-500' : 'text-text-main'}`}>
                                    {log.type === 'income' ? '+' : '-'} {log.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {/* Daily Summary */}
                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-sm font-bold text-text-muted uppercase">Net Total</span>
                            <span className="text-lg font-bold text-text-main">
                                {(dailyData[selectedDateKey]?.income || 0) - (dailyData[selectedDateKey]?.expense || 0)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for conditional classes
const activeDayStyle = () => {
    // Determine active styles if needed
    return '';
};

export default FinanceCalendar;
