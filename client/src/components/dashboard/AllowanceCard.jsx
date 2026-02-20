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
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const records = await api.fetchFinanceRecords();
      if (!records) return;

      let total = 0;
      records.forEach(log => {
        const val = parseFloat(log.amount);
        if (log.type === 'income') total += val;
        else total -= val;
      });
      setBalance(total);

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

      setGraphData(normalizedHeights);
      setLoading(false);

    } catch (error) {
      console.error("Failed to load finance widget", error);
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-6 flex flex-col justify-between shadow-sm h-full transition-theme">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Allowance</p>
          <h2 className="text-2xl font-mono text-text-main font-bold">
            {loading ? '...' : formatter.format(balance)}
          </h2>
        </div>
        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 border border-emerald-500/20">
          <span className="text-xs font-bold font-mono">
            {balance > 0 ? 'Active' : 'Low'}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-1 h-12">
        {graphData.map((height, idx) => (
          <div
            key={idx}
            className={`w-1/5 rounded-t-sm transition-all duration-500 ${idx === 4
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-surface-highlight'
              }`}
            style={{ height: `${height}%` }}
            title={`Day ${idx + 1}`}
          />
        ))}
      </div>
      <p className="text-text-muted text-[10px] mt-2 text-center font-medium uppercase tracking-wide">
        Weekly Spending Trend
      </p>
    </div>
  );
};

export default AllowanceCard;