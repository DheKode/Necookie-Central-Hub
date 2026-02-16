import React, { useState } from 'react';
import { Plus, Shield, X, ArrowDownRight } from 'lucide-react';
import { api } from '../../api';

/**
 * BankCard Component
 * 
 * Displays a savings fund as a visually appealing card (similar to a credit/debit card).
 * Allows users to Deposit (Add money) or Withdraw (Remove money) from the fund.
 * Updates are persisted to the backend via API.
 * 
 * Props:
 * @param {object} fund - The fund object containing details like name, amount, target, color, etc.
 * @param {function} onUpdate - Callback to update the parent state when this fund changes.
 * @param {function} onDelete - Callback to delete this fund.
 * @param {number} walletBalance - Current available balance in the main wallet (for validation).
 * @param {function} onTransaction - Callback to record a formal transaction record for the deposit/withdrawal.
 */
const BankCard = ({ fund, onUpdate, onDelete, walletBalance, onTransaction }) => {
    // Calculate progress percentage, capped at 100%
    const percentage = Math.min((fund.current_amount / fund.target_amount) * 100, 100);

    // State to control the visibility of the "Edit/Action" overlay
    const [isEditing, setIsEditing] = useState(false);

    // State for the amount input field during deposit/withdraw
    const [amount, setAmount] = useState('');

    // State for wallet synchronization (Deduct/Add to wallet?)
    const [syncWallet, setSyncWallet] = useState(true);

    // State for delete confirmation
    const [confirmDelete, setConfirmDelete] = useState(false);

    // State to track whether we are 'deposit'ing or 'withdraw'ing
    const [mode, setMode] = useState('deposit');

    /**
     * handleTransaction
     * Validates input and processes the financial transaction.
     */
    const handleTransaction = async () => {
        // 1. Basic Input Validation
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
        const val = parseFloat(amount);

        // 2. Logical Validation based on Mode
        // Cannot deposit more than you have in your wallet (ONLY IF SYNCING).
        if (mode === 'deposit' && syncWallet && val > walletBalance) {
            alert("Insufficient wallet balance!");
            return;
        }
        // Cannot withdraw more than is in the fund.
        if (mode === 'withdraw' && val > fund.current_amount) {
            alert("Insufficient fund balance!");
            return;
        }

        // 3. Calculate New Balance
        let newAmount = fund.current_amount;
        if (mode === 'deposit') newAmount += val;
        else if (mode === 'withdraw') newAmount -= val;

        // 4. Update the Fund in the Backend
        const { data, error } = await api.updateFund(fund.id, { current_amount: newAmount });

        if (!error && data) {
            // 5. Create a Transaction Record in History (ONLY IF SYNCING)
            if (syncWallet) {
                if (mode === 'deposit') {
                    await onTransaction({
                        type: 'expense', // Money leaving wallet is an expense to the wallet logic (transfer)
                        amount: val,
                        category: 'Savings',
                        description: `Transfer to ${fund.name}`,
                        date: new Date().toISOString().split('T')[0]
                    });
                } else if (mode === 'withdraw') {
                    await onTransaction({
                        type: 'income', // Money returning to wallet is income
                        amount: val,
                        category: 'Savings',
                        description: `Withdraw from ${fund.name}`,
                        date: new Date().toISOString().split('T')[0]
                    });
                }
            }

            // 6. Update Parent State & Reset Form
            onUpdate(data[0]);
            setAmount('');
            setIsEditing(false);
            setSyncWallet(true); // Reset to default
        }
    };

    /**
     * Helper to return Tailwind CSS gradient classes based on color name.
     */
    const getCardGradient = (color) => {
        const gradients = {
            indigo: 'from-indigo-600 to-violet-600',
            emerald: 'from-emerald-600 to-teal-600',
            rose: 'from-rose-600 to-pink-600',
            amber: 'from-amber-500 to-orange-600',
            blue: 'from-blue-600 to-cyan-600',
        };
        // Default to indigo if color not found
        return gradients[color] || gradients.indigo;
    };

    return (
        // Main Container with 3D perspective effect
        <div className="relative group perspective-1000">

            {/* --- ACTION OVERLAY (Visible when isEditing is true) --- */}
            {isEditing && (
                <div className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-center animate-in fade-in duration-200 border border-border">

                    {/* Overlay Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-text-main uppercase text-xs tracking-wider">
                            {mode === 'deposit' ? 'Add to Savings' : 'Withdraw Cash'}
                        </h4>
                        <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-main">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Deposit/Withdraw Toggle Switch */}
                    <div className="flex bg-surface-highlight p-1 rounded-xl mb-4">
                        <button
                            onClick={() => setMode('deposit')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'deposit' ? 'bg-background text-indigo-500 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => setMode('withdraw')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'withdraw' ? 'bg-background text-rose-500 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Withdraw
                        </button>
                    </div>

                    {/* Wallet Sync Toggle */}
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <input
                            type="checkbox"
                            id="syncWallet"
                            checked={syncWallet}
                            onChange={(e) => setSyncWallet(e.target.checked)}
                            className="w-4 h-4 accent-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="syncWallet" className="text-xs text-text-muted cursor-pointer select-none">
                            {mode === 'deposit' ? 'Deduct from Wallet' : 'Add to Wallet'}
                        </label>
                    </div>

                    {/* Amount Input */}
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₱</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-background border border-border rounded-xl pl-8 p-3 text-lg font-bold text-text-main focus:outline-none focus:border-primary"
                            autoFocus // Focus automatically when overlay appears
                        />
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleTransaction}
                        // Change color based on mode (Indigo for save, Rose for withdraw)
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${mode === 'deposit' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                            }`}
                    >
                        Confirm {mode}
                    </button>

                    {/* Available Balance Helper Text */}
                    <p className="text-[10px] text-text-muted text-center mt-3">
                        {mode === 'deposit'
                            ? `Available: ₱${walletBalance.toLocaleString()}`
                            : `Available: ₱${fund.current_amount.toLocaleString()}`
                        }
                    </p>
                </div>
            )}

            {/* --- MAIN CARD VISUAL --- */}
            <div className={`relative overflow-hidden rounded-3xl p-6 aspect-[1.586/1] shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] bg-gradient-to-br ${getCardGradient(fund.color || 'indigo')}`}>

                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>

                {/* Decorative Blurred Circles/Glows */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                {/* Card Content Layer */}
                <div className="relative z-10 flex flex-col justify-between h-full text-white">

                    {/* Top Row: Title and Icon */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Savings Account</p>
                            <h3 className="text-xl font-bold tracking-tight">{fund.name}</h3>
                        </div>
                        <Shield size={28} className="opacity-80" />
                    </div>

                    {/* Middle Row: Chip Graphic (Purely decorative) */}
                    <div className="flex items-center gap-4 my-auto">
                        <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-yellow-200 to-yellow-500 shadow-sm opacity-90"></div>
                        <div className="flex gap-1">
                            <div className="w-8 h-5 rounded-full border border-white/30"></div>
                            <div className="w-8 h-5 rounded-full border border-white/30 -ml-4"></div>
                        </div>
                    </div>

                    {/* Bottom Row: Balance and Action Buttons */}
                    <div>
                        <p className="text-xs font-medium opacity-70 uppercase mb-1">Current Balance</p>
                        <div className="flex justify-between items-end">
                            {/* Balance Display */}
                            <h2 className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow-md">
                                ₱{fund.current_amount.toLocaleString()}
                            </h2>

                            {/* Quick Action Buttons on Card */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setMode('withdraw'); setIsEditing(true); }}
                                    className="p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-colors text-white/90"
                                    title="Withdraw"
                                >
                                    <ArrowDownRight size={18} />
                                </button>
                                <button
                                    onClick={() => { setMode('deposit'); setIsEditing(true); }}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white"
                                    title="Deposit"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Button (Hidden unless card is hovered) */}
                {confirmDelete ? (
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1 animate-in fade-in duration-200">
                        <p className="text-[10px] text-white font-bold bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">Delete?</p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onDelete(fund.id)}
                                className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-sm transition-colors"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur-sm transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="absolute top-4 right-4 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* --- PROGRESS BAR BELOW CARD --- */}
            <div className="mt-4 px-2">
                <div className="flex justify-between text-xs font-bold text-text-muted mb-1.5">
                    <span>Progress to ₱{fund.target_amount.toLocaleString()}</span>
                    <span>{percentage.toFixed(0)}%</span>
                </div>
                {/* Progress Bar Track */}
                <div className="h-2 w-full bg-surface py-0.5 rounded-full overflow-hidden border border-border/50">
                    {/* Progress Bar Fill */}
                    <div
                        className={`h-full rounded-full transition-all duration-500 bg-${fund.color || 'indigo'}-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BankCard;
