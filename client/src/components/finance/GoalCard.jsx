import React, { useState } from 'react';
import { Target, AlertTriangle, TrendingUp, X, Check, Plus } from 'lucide-react';
import { api } from '../../api';

/**
 * GoalCard Component
 * 
 * Displays a specific savings goal (e.g., "New Laptop", "Emergency Fund").
 * Includes a progress bar and calculating daily savings needed to hit the deadline.
 * Supports contributing (Deposit), withdrawing, or adjusting the balance manually.
 * 
 * Props:
 * @param {object} goal - The goal object containing target, deadline, amount, etc.
 * @param {function} onUpdate - Callback when goal data changes.
 * @param {function} onDelete - Callback when goal is deleted.
 * @param {number} walletBalance - Context of available funds in wallet.
 * @param {function} onTransaction - Callback to record the transaction.
 */
const GoalCard = ({ goal, onUpdate, onDelete, walletBalance, onTransaction }) => {
    // Calculate percentage complete
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

    // UI State for editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState('');

    // 'adjust' mode allows setting the value directly without affecting wallet (for corrections)
    const [mode, setMode] = useState('deposit'); // 'deposit', 'withdraw', 'adjust'

    // Calculate days remaining until deadline
    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    // Calculate how much needs to be saved per day to hit target
    const dailySave = daysLeft && daysLeft > 0 ? (goal.target_amount - goal.current_amount) / daysLeft : 0;

    /**
     * handleTransaction
     * Processes changes to the goal's balance.
     */
    const handleTransaction = async () => {
        // Validation
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
        const val = parseFloat(amount);

        // Balance Check
        if (mode === 'deposit' && val > walletBalance) {
            alert("Insufficient wallet balance!");
            return;
        }
        if (mode === 'withdraw' && val > goal.current_amount) {
            alert("Insufficient goal balance!");
            return;
        }

        // Calculate New Amount
        let newAmount = goal.current_amount;
        if (mode === 'deposit') newAmount += val;
        else if (mode === 'withdraw') newAmount -= val;
        else if (mode === 'adjust') newAmount = val; // Direct set

        // API Call
        const { data, error } = await api.updateGoal(goal.id, { current_amount: newAmount });

        if (!error && data) {
            // Log Transaction (Only for Real Money Moves: Deposit/Withdraw)
            if (mode === 'deposit') {
                await onTransaction({
                    type: 'expense',
                    amount: val,
                    category: 'Savings',
                    description: `Transfer to ${goal.name}`,
                    date: new Date().toISOString().split('T')[0]
                });
            } else if (mode === 'withdraw') {
                await onTransaction({
                    type: 'income',
                    amount: val,
                    category: 'Savings',
                    description: `Withdraw from ${goal.name}`,
                    date: new Date().toISOString().split('T')[0]
                });
            }
            // 'adjust' mode does NOT create a transaction record as it is assumed to be a correction.

            // Reset UI
            onUpdate(data[0]);
            setAmount('');
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm relative group">

            {/* Delete Button (Top Right, Hover Only) */}
            <button onClick={() => onDelete(goal.id)} className="absolute top-4 right-4 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>

            {/* Header: Icon and Title */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {/* Icon Container: Red for Emergency, Green for Regular Targets */}
                    <div className={`p-3 rounded-xl ${goal.is_emergency_fund ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {goal.is_emergency_fund ? <AlertTriangle size={24} /> : <Target size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main">{goal.name}</h3>
                        <p className="text-xs text-text-muted">{daysLeft > 0 ? `${daysLeft} days left` : 'No deadline'}</p>
                    </div>
                </div>
            </div>

            {/* Current Amount Display */}
            <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-text-main">₱{goal.current_amount.toLocaleString()}</span>
                <span className="text-xs text-text-muted mb-1"> / ₱{goal.target_amount.toLocaleString()}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.is_emergency_fund ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Daily Savings Recommendation (If behind schedule) */}
            {dailySave > 0 && goal.current_amount < goal.target_amount && (
                <div className="bg-surface-highlight/50 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-text-muted" />
                    <p className="text-xs text-text-muted">Save <span className="text-text-main font-bold">₱{Math.ceil(dailySave).toLocaleString()}</span> / day to hit goal.</p>
                </div>
            )}

            {/* --- INTERACTION SECTION --- */}
            {isEditing ? (
                // EDIT MODE: Show controls map
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">

                    {/* Tabs for Mode Selection */}
                    <div className="flex p-1 bg-surface-highlight rounded-xl gap-1">
                        <button
                            onClick={() => setMode('deposit')}
                            className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-lg transition-all ${mode === 'deposit' ? 'bg-background text-indigo-500 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >Deposit</button>
                        <button
                            onClick={() => setMode('withdraw')}
                            className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-lg transition-all ${mode === 'withdraw' ? 'bg-background text-rose-500 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >Withdraw</button>
                        <button
                            onClick={() => setMode('adjust')}
                            className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-lg transition-all ${mode === 'adjust' ? 'bg-background text-amber-500 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >Adjust</button>
                    </div>

                    {/* Input Field and Action Buttons */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={mode === 'adjust' ? "New Total Balance" : "Amount"}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            autoFocus
                        />
                        {/* Submit Button */}
                        <button onClick={handleTransaction} className={`p-2 text-white rounded-xl ${mode === 'deposit' ? 'bg-indigo-500' : mode === 'withdraw' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                            <Check size={16} />
                        </button>
                        {/* Cancel Button */}
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-highlight text-text-muted rounded-xl"><X size={16} /></button>
                    </div>

                    {/* Explanatory Text based on Mode */}
                    {mode === 'deposit' && <p className="text-[10px] text-text-muted text-center">Deducts from Wallet (₱{walletBalance.toLocaleString()})</p>}
                    {mode === 'withdraw' && <p className="text-[10px] text-text-muted text-center">Adds to Wallet</p>}
                    {mode === 'adjust' && <p className="text-[10px] text-text-muted text-center">Updates fund only (No Wallet impact)</p>}
                </div>
            ) : (
                // DEFAULT MODE: Show 'Contribute' button
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 rounded-xl bg-surface-highlight text-text-main text-xs font-bold hover:bg-border transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={14} /> Contribute
                </button>
            )}
        </div>
    );
};

export default GoalCard;
