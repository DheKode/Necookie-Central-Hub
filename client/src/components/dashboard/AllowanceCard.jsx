import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { subDays, isSameDay, parseISO } from 'date-fns';

const AllowanceCard = () => {
  const [balance, setBalance] = useState(0);
  const [graphData, setGraphData] = useState([10, 30, 20, 50, 40]);
  const [loading, setLoading] = useState(true);

  const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  useEffect(() => {
    let isMounted = true;

    const loadFinancialData = async () => {
      try {
        const records = await api.fetchFinanceRecords();
        if (!records || !isMounted) return;

        let total = 0;
        records.forEach(log => {
          const val = parseFloat(log.amount);
          if (log.type === 'income') total += val;
          else total -= val;
        });

        const today = new Date();
        const dailyExpenses = [];

        for (let i = 4; i >= 0; i--) {
          const targetDate = subDays(today, i);
          const dayExpense = records
            .filter(log => log.type === 'expense' && isSameDay(parseISO(log.date), targetDate))
            .reduce((sum, log) => sum + parseFloat(log.amount), 0);
          dailyExpenses.push(dayExpense);
        }

        const maxSpend = Math.max(...dailyExpenses, 100);
        const normalizedHeights = dailyExpenses.map(val =>
          Math.max(10, Math.round((val / maxSpend) * 100))
        );

        setBalance(total);
        setGraphData(normalizedHeights);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load finance widget", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFinancialData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-nc-surface border border-nc-border rounded-[1.5rem] p-6 flex flex-col justify-between shadow-sm h-full transition-theme">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-nc-muted text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-1">Allowance</p>
          <h2 className="text-3xl font-mono text-nc-text font-bold tracking-tight">
            {loading ? '...' : formatter.format(balance)}
          </h2>
        </div>
        <div className={`p-2 rounded-xl border flex items-center justify-center ${balance > 0 ? 'bg-nc-success/10 text-nc-success border-nc-success/20' : 'bg-nc-warning/10 text-nc-warning border-nc-warning/20'}`}>
          <span className="text-[10px] uppercase tracking-widest font-bold font-mono">
            {balance > 0 ? 'Active' : 'Low'}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-end gap-1.5 h-14">
        {graphData.map((height, idx) => (
          <div
            key={idx}
            className={`w-1/5 rounded-t transition-all duration-500 ${idx === 4
                ? 'bg-nc-primary shadow-[0_0_15px_rgba(124,155,255,0.4)]'
                : 'bg-nc-surfaceElevated hover:bg-nc-border'
              }`}
            style={{ height: `${height}%` }}
            title={`Day ${idx + 1}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
         <div className="h-px flex-1 bg-nc-border" />
         <p className="text-nc-muted text-[9px] font-mono uppercase tracking-[0.2em]">
           Weekly Trend
         </p>
         <div className="h-px flex-1 bg-nc-border" />
      </div>
    </div>
  );
};

export default AllowanceCard;