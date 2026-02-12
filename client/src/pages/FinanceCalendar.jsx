import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FinanceCalendar = ({ logs, currentDate, onDateChange }) => {

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Map data to days
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

    // Calculate day offsets for grid alignment
    const startDay = getDay(startOfMonth(currentDate)); // 0 = Sunday
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

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-xl font-bold text-text-main capitalize">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-text-main"><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-text-main"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* WEEKDAY HEADERS */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-bold text-text-muted uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* DAYS GRID */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 auto-rows-fr">
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} className="p-2" />
                ))}

                {daysInMonth.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const data = dailyData[dateKey];
                    const isToday = isSameDay(day, new Date());
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
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-text-muted'}`}>{format(day, 'd')}</span>
                                {data && (
                                    <div className="flex flex-col items-end">
                                        {data.income > 0 && <span className="text-[10px] text-emerald-500 font-bold">+{Math.round(data.income / 1000)}k</span>}
                                        {data.expense > 0 && <span className="text-[10px] text-rose-500 font-bold">-{Math.round(data.expense / 1000)}k</span>}
                                    </div>
                                )}
                            </div>

                            {/* Net Indicator */}
                            {data && (
                                <div className={`mt-2 text-xs font-bold text-center py-1 rounded-lg ${net >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    {net >= 0 ? '+' : ''}{net.toLocaleString()}
                                </div>
                            )}

                            {/* Tooltip-like details on hover (simple list) */}
                            {data && (
                                <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm rounded-2xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col overflow-y-auto pointer-events-none md:pointer-events-auto">
                                    <p className="text-[10px] font-bold text-text-muted mb-1 border-b border-border pb-1">Transactions</p>
                                    {data.transactions.slice(0, 3).map((t, idx) => (
                                        <div key={idx} className="flex justify-between text-[10px] mb-0.5">
                                            <span className="truncate max-w-[60%]">{t.description || t.category}</span>
                                            <span className={t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>{t.type === 'income' ? '+' : '-'} {t.amount}</span>
                                        </div>
                                    ))}
                                    {data.transactions.length > 3 && <span className="text-[10px] text-text-muted text-center block mt-1">+{data.transactions.length - 3} more</span>}
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
