import React, { useState, useEffect } from 'react';
import { Plus, Target, Shield, AlertTriangle, TrendingUp, DollarSign, X, Check } from 'lucide-react';
import { ResponsiveContainer } from 'recharts'; // Assuming you might want charts later, but for now simple divs
import { api } from '../api';

// ==========================================
// SUB-COMPONENT: FUND CARD
// ==========================================
const FundCard = ({ fund, onUpdate, onDelete }) => {
    const percentage = Math.min((fund.current_amount / fund.target_amount) * 100, 100);
    const [isEditing, setIsEditing] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const handleAddMoney = async () => {
        if (!addAmount) return;
        const newAmount = fund.current_amount + parseFloat(addAmount);
        const { data, error } = await api.updateFund(fund.id, { current_amount: newAmount });
        if (!error && data) {
            onUpdate(data[0]);
            setAddAmount('');
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm relative group">
            <button onClick={() => onDelete(fund.id)} className="absolute top-4 right-4 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-${fund.color || 'indigo'}-500/10 text-${fund.color || 'indigo'}-500`}>
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-text-main">{fund.name}</h3>
                    <p className="text-xs text-text-muted">Target: ₱{fund.target_amount.toLocaleString()}</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text-main">₱{fund.current_amount.toLocaleString()}</span>
                    <span className="text-text-muted">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-surface-highlight rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 bg-${fund.color || 'indigo'}-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {isEditing ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        autoFocus
                    />
                    <button onClick={handleAddMoney} className="p-2 bg-emerald-500 text-white rounded-xl"><Check size={16} /></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-highlight text-text-muted rounded-xl"><X size={16} /></button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-border text-text-muted text-xs font-bold hover:border-primary hover:text-primary transition-colors"
                >
                    + Add Money
                </button>
            )}
        </div>
    );
};

// ==========================================
// SUB-COMPONENT: GOAL CARD
// ==========================================
const GoalCard = ({ goal, onUpdate, onDelete }) => {
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const [isEditing, setIsEditing] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const dailySave = daysLeft && daysLeft > 0 ? (goal.target_amount - goal.current_amount) / daysLeft : 0;

    const handleAddMoney = async () => {
        if (!addAmount) return;
        const newAmount = goal.current_amount + parseFloat(addAmount);
        const { data, error } = await api.updateGoal(goal.id, { current_amount: newAmount });
        if (!error && data) {
            onUpdate(data[0]);
            setAddAmount('');
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
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        autoFocus
                    />
                    <button onClick={handleAddMoney} className="p-2 bg-emerald-500 text-white rounded-xl"><Check size={16} /></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-highlight text-text-muted rounded-xl"><X size={16} /></button>
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
const FinanceVault = () => {
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
            {/* SECTION 1: RESERVED FUNDS */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Shield className="text-indigo-500" size={24} /> Reserved Funds
                    </h2>
                    <button
                        onClick={() => { setCreateType('fund'); setShowCreateModal(true); }}
                        className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-indigo-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {funds.map(fund => (
                        <FundCard key={fund.id} fund={fund} onUpdate={handleUpdateFund} onDelete={handleDeleteFund} />
                    ))}
                    {funds.length === 0 && (
                        <div className="col-span-full p-8 border border-dashed border-border rounded-3xl text-center text-text-muted text-sm">
                            No reserved funds yet. Create one to separate money for bills, etc.
                        </div>
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
                        <GoalCard key={goal.id} goal={goal} onUpdate={handleUpdateGoal} onDelete={handleDeleteGoal} />
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
