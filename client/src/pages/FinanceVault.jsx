import React, { useState, useEffect } from 'react';
import { Plus, Target, Shield, AlertTriangle, TrendingUp, DollarSign, X, Check, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer } from 'recharts'; // Assuming you might want charts later, but for now simple divs
import { api } from '../api';

// ==========================================
// SUB-COMPONENT: BANK CARD
// ==========================================
const BankCard = ({ fund, onUpdate, onDelete, walletBalance, onTransaction }) => {
    const percentage = Math.min((fund.current_amount / fund.target_amount) * 100, 100);
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('deposit'); // deposit, withdraw

    const handleTransaction = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
        const val = parseFloat(amount);

        // Validation
        if (mode === 'deposit' && val > walletBalance) {
            alert("Insufficient wallet balance!");
            return;
        }
        if (mode === 'withdraw' && val > fund.current_amount) {
            alert("Insufficient fund balance!");
            return;
        }

        let newAmount = fund.current_amount;
        if (mode === 'deposit') newAmount += val;
        else if (mode === 'withdraw') newAmount -= val;

        // 1. Update Fund
        const { data, error } = await api.updateFund(fund.id, { current_amount: newAmount });

        if (!error && data) {
            // 2. Creating Transaction Record (Only for Deposit/Withdraw)
            if (mode === 'deposit') {
                await onTransaction({
                    type: 'expense',
                    amount: val,
                    category: 'Savings',
                    description: `Transfer to ${fund.name}`,
                    date: new Date().toISOString().split('T')[0]
                });
            } else if (mode === 'withdraw') {
                await onTransaction({
                    type: 'income',
                    amount: val,
                    category: 'Savings',
                    description: `Withdraw from ${fund.name}`,
                    date: new Date().toISOString().split('T')[0]
                });
            }

            onUpdate(data[0]);
            setAmount('');
            setIsEditing(false);
        }
    };

    // Color Logic for Card
    const getCardGradient = (color) => {
        const gradients = {
            indigo: 'from-indigo-600 to-violet-600',
            emerald: 'from-emerald-600 to-teal-600',
            rose: 'from-rose-600 to-pink-600',
            amber: 'from-amber-500 to-orange-600',
            blue: 'from-blue-600 to-cyan-600',
        };
        return gradients[color] || gradients.indigo;
    };

    return (
        <div className="relative group perspective-1000">
            {/* EDIT/ACTION OVERLAY */}
            {isEditing && (
                <div className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-center animate-in fade-in duration-200 border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-text-main uppercase text-xs tracking-wider">
                            {mode === 'deposit' ? 'Add to Savings' : 'Withdraw Cash'}
                        </h4>
                        <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-main"><X size={18} /></button>
                    </div>

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

                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₱</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-background border border-border rounded-xl pl-8 p-3 text-lg font-bold text-text-main focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleTransaction}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${mode === 'deposit' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'}`}
                    >
                        Confirm {mode}
                    </button>

                    <p className="text-[10px] text-text-muted text-center mt-3">
                        {mode === 'deposit'
                            ? `Available: ₱${walletBalance.toLocaleString()}`
                            : `Available: ₱${fund.current_amount.toLocaleString()}`
                        }
                    </p>
                </div>
            )}

            {/* MAIN CARD VISUAL */}
            <div className={`relative overflow-hidden rounded-3xl p-6 aspect-[1.586/1] shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] bg-gradient-to-br ${getCardGradient(fund.color || 'indigo')}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                {/* Card Content */}
                <div className="relative z-10 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Savings Account</p>
                            <h3 className="text-xl font-bold tracking-tight">{fund.name}</h3>
                        </div>
                        <Shield size={28} className="opacity-80" />
                    </div>

                    <div className="flex items-center gap-4 my-auto">
                        <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-yellow-200 to-yellow-500 shadow-sm opacity-90"></div>
                        <div className="flex gap-1">
                            <div className="w-8 h-5 rounded-full border border-white/30"></div>
                            <div className="w-8 h-5 rounded-full border border-white/30 -ml-4"></div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium opacity-70 uppercase mb-1">Current Balance</p>
                        <div className="flex justify-between items-end">
                            <h2 className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow-md">
                                ₱{fund.current_amount.toLocaleString()}
                            </h2>
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

                {/* Delete Button (Hidden unless hovered) */}
                <button
                    onClick={() => onDelete(fund.id)}
                    className="absolute top-4 right-4 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress Bar Below Card */}
            <div className="mt-4 px-2">
                <div className="flex justify-between text-xs font-bold text-text-muted mb-1.5">
                    <span>Progress to ₱{fund.target_amount.toLocaleString()}</span>
                    <span>{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-surface py-0.5 rounded-full overflow-hidden border border-border/50">
                    <div
                        className={`h-full rounded-full transition-all duration-500 bg-${fund.color || 'indigo'}-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// SUB-COMPONENT: GOAL CARD
// ==========================================
const GoalCard = ({ goal, onUpdate, onDelete, walletBalance, onTransaction }) => {
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('deposit'); // deposit, withdraw, adjust

    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const dailySave = daysLeft && daysLeft > 0 ? (goal.target_amount - goal.current_amount) / daysLeft : 0;

    const handleTransaction = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
        const val = parseFloat(amount);

        // Validation
        if (mode === 'deposit' && val > walletBalance) {
            alert("Insufficient wallet balance!");
            return;
        }
        if (mode === 'withdraw' && val > goal.current_amount) {
            alert("Insufficient goal balance!");
            return;
        }

        let newAmount = goal.current_amount;
        if (mode === 'deposit') newAmount += val;
        else if (mode === 'withdraw') newAmount -= val;
        else if (mode === 'adjust') newAmount = val;

        // 1. Update Goal
        const { data, error } = await api.updateGoal(goal.id, { current_amount: newAmount });

        if (!error && data) {
            // 2. Creating Transaction Record
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

            onUpdate(data[0]);
            setAmount('');
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm relative group">
            <button onClick={() => onDelete(goal.id)} className="absolute top-4 right-4 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${goal.is_emergency_fund ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {goal.is_emergency_fund ? <AlertTriangle size={24} /> : <Target size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main">{goal.name}</h3>
                        <p className="text-xs text-text-muted">{daysLeft > 0 ? `${daysLeft} days left` : 'No deadline'}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-text-main">₱{goal.current_amount.toLocaleString()}</span>
                <span className="text-xs text-text-muted mb-1"> / ₱{goal.target_amount.toLocaleString()}</span>
            </div>

            <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.is_emergency_fund ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {dailySave > 0 && goal.current_amount < goal.target_amount && (
                <div className="bg-surface-highlight/50 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-text-muted" />
                    <p className="text-xs text-text-muted">Save <span className="text-text-main font-bold">₱{Math.ceil(dailySave).toLocaleString()}</span> / day to hit goal.</p>
                </div>
            )}

            {isEditing ? (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                    {/* Mode Toggles */}
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

                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={mode === 'adjust' ? "New Total Balance" : "Amount"}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            autoFocus
                        />
                        <button onClick={handleTransaction} className={`p-2 text-white rounded-xl ${mode === 'deposit' ? 'bg-indigo-500' : mode === 'withdraw' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                            <Check size={16} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-highlight text-text-muted rounded-xl"><X size={16} /></button>
                    </div>
                    {mode === 'deposit' && <p className="text-[10px] text-text-muted text-center">Deducts from Wallet (₱{walletBalance.toLocaleString()})</p>}
                    {mode === 'withdraw' && <p className="text-[10px] text-text-muted text-center">Adds to Wallet</p>}
                    {mode === 'adjust' && <p className="text-[10px] text-text-muted text-center">Updates fund only (No Wallet impact)</p>}
                </div>
            ) : (
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

// ==========================================
// MAIN COMPONENT
// ==========================================
const FinanceVault = ({ walletBalance = 0, onTransaction }) => {
    const [funds, setFunds] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createType, setCreateType] = useState('fund'); // 'fund' or 'goal'

    // Form State
    const [formData, setFormData] = useState({ name: '', target: '', deadline: '', isEmergency: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [fundsData, goalsData] = await Promise.all([
            api.fetchFunds(),
            api.fetchGoals()
        ]);
        if (fundsData) setFunds(fundsData);
        if (goalsData) setGoals(goalsData);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.target) return;

        const payload = {
            name: formData.name,
            target_amount: parseFloat(formData.target),
            deadline: formData.deadline || null,
        };

        if (createType === 'fund') {
            const { data } = await api.addFund({ ...payload, color: 'indigo' });
            if (data) setFunds([...funds, data[0]]);
        } else {
            const { data } = await api.addGoal({ ...payload, is_emergency_fund: formData.isEmergency });
            if (data) setGoals([...goals, data[0]]);
        }
        setShowCreateModal(false);
        setFormData({ name: '', target: '', deadline: '', isEmergency: false });
    };

    const handleUpdateFund = (updated) => {
        setFunds(prev => prev.map(f => f.id === updated.id ? updated : f));
    }

    const handleUpdateGoal = (updated) => {
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
    }

    const handleDeleteFund = async (id) => {
        await api.deleteFund(id);
        setFunds(prev => prev.filter(f => f.id !== id));
    }

    const handleDeleteGoal = async (id) => {
        await api.deleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
    }


    if (loading) return <div className="p-10 text-center text-text-muted">Loading Vault...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER: WALLET BALANCE */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 rounded-3xl flex items-center justify-between">
                <div>
                    <h3 className="text-text-muted text-sm font-bold uppercase mb-1">Available in Wallet</h3>
                    <h2 className="text-3xl font-bold text-text-main">₱{walletBalance.toLocaleString()}</h2>
                    <p className="text-xs text-text-muted mt-1">Transfers to funds/goals will differ from this amount.</p>
                </div>
                <div className="bg-background/80 p-3 rounded-2xl shadow-sm">
                    <Shield className="text-indigo-500" size={32} />
                </div>
            </div>

            {/* SECTION 1: BANK CARDS (SAVINGS) */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Shield className="text-indigo-500" size={24} /> Savings Accounts
                    </h2>
                    <button
                        onClick={() => { setCreateType('fund'); setShowCreateModal(true); }}
                        className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-indigo-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* BANK CARD GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funds.map(fund => (
                        <BankCard
                            key={fund.id}
                            fund={fund}
                            onUpdate={handleUpdateFund}
                            onDelete={handleDeleteFund}
                            walletBalance={walletBalance}
                            onTransaction={onTransaction}
                        />
                    ))}
                    {funds.length === 0 && (
                        <button
                            onClick={() => { setCreateType('fund'); setShowCreateModal(true); }}
                            className="h-56 w-full rounded-3xl border-2 border-dashed border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-3 transition-all group"
                        >
                            <div className="p-4 bg-surface-highlight rounded-full text-text-muted group-hover:text-indigo-500 transition-colors">
                                <Plus size={32} />
                            </div>
                            <p className="font-bold text-text-muted">Open New Savings Account</p>
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION 2: SAVINGS GOALS */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Target className="text-emerald-500" size={24} /> Savings Goals
                    </h2>
                    <button
                        onClick={() => { setCreateType('goal'); setShowCreateModal(true); }}
                        className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-emerald-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onUpdate={handleUpdateGoal}
                            onDelete={handleDeleteGoal}
                            walletBalance={walletBalance}
                            onTransaction={onTransaction}
                        />
                    ))}
                    {goals.length === 0 && (
                        <div className="col-span-full p-8 border border-dashed border-border rounded-3xl text-center text-text-muted text-sm">
                            No active savings goals. Set a target and track your progress!
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 p-6 space-y-4">
                        <h3 className="text-lg font-bold text-text-main">
                            Create {createType === 'fund' ? 'Reserved Fund' : 'Savings Goal'}
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                                placeholder={createType === 'fund' ? "e.g. Bills" : "e.g. New Laptop"}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Target Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-text-muted">₱</span>
                                <input
                                    type="number"
                                    value={formData.target}
                                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl pl-7 p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {createType === 'goal' && (
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Deadline (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        )}

                        {createType === 'goal' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    checked={formData.isEmergency}
                                    onChange={e => setFormData({ ...formData, isEmergency: e.target.checked })}
                                    className="accent-rose-500 w-4 h-4"
                                />
                                <label htmlFor="emergency" className="text-sm text-text-main">Mark as Emergency Fund</label>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-text-muted font-bold text-sm">Cancel</button>
                            <button onClick={handleCreate} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceVault;
