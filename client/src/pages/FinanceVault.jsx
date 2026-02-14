import React, { useState, useEffect } from 'react';
import { Shield, Target, Plus } from 'lucide-react';
import { api } from '../api';

// Import Extracted Components
// Using components from the 'components/finance' folder for better modularity.
import BankCard from '../components/finance/BankCard';
import GoalCard from '../components/finance/GoalCard';

// ==========================================
// MAIN COMPONENT
// ==========================================
// FinanceVault: Is the container page for "Savings Accounts" and "Savings Goals".
const FinanceVault = ({ walletBalance = 0, onTransaction }) => {
    // State to hold list of savings funds
    const [funds, setFunds] = useState([]);

    // State to hold list of savings goals
    const [goals, setGoals] = useState([]);

    // State to track loading status
    const [loading, setLoading] = useState(true);

    // State to control visibility of the "Create New" modal
    const [showCreateModal, setShowCreateModal] = useState(false);

    // State to track which type we are creating: 'fund' or 'goal'
    const [createType, setCreateType] = useState('fund');

    // State for the form inputs
    const [formData, setFormData] = useState({ name: '', target: '', deadline: '', isEmergency: false });

    // useEffect: Load data when component mounts
    useEffect(() => {
        const loadData = async () => {
            // execute both API calls in parallel using Promise.all
            const [fundsData, goalsData] = await Promise.all([
                api.fetchFunds(),
                api.fetchGoals()
            ]);

            // Update state with results
            if (fundsData) setFunds(fundsData);
            if (goalsData) setGoals(goalsData);
            setLoading(false);
        };

        loadData();
    }, []);

    // Handler to create a new Fund or Goal
    const handleCreate = async () => {
        // Validation: Required fields
        if (!formData.name || !formData.target) return;

        // Construct payload object
        const payload = {
            name: formData.name,
            target_amount: parseFloat(formData.target),
            deadline: formData.deadline || null,
        };

        if (createType === 'fund') {
            // Call API to add Fund
            // Default color to 'indigo'
            const { data } = await api.addFund({ ...payload, color: 'indigo' });
            // Add to local state
            if (data) setFunds([...funds, data[0]]);
        } else {
            // Call API to add Goal
            const { data } = await api.addGoal({ ...payload, is_emergency_fund: formData.isEmergency });
            // Add to local state
            if (data) setGoals([...goals, data[0]]);
        }

        // Reset and close modal
        setShowCreateModal(false);
        setFormData({ name: '', target: '', deadline: '', isEmergency: false });
    };

    // Handler to update a specific fund in the list
    const handleUpdateFund = (updated) => {
        setFunds(prev => prev.map(f => f.id === updated.id ? updated : f));
    }

    // Handler to update a specific goal in the list
    const handleUpdateGoal = (updated) => {
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
    }

    // Handler to delete a fund
    const handleDeleteFund = async (id) => {
        await api.deleteFund(id);
        setFunds(prev => prev.filter(f => f.id !== id));
    }

    // Handler to delete a goal
    const handleDeleteGoal = async (id) => {
        await api.deleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
    }

    // Show loading spinner if fetching data
    if (loading) return <div className="p-10 text-center text-text-muted">Loading Vault...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* --- HEADER: WALLET BALANCE DISPLAY --- */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 rounded-3xl flex items-center justify-between">
                <div>
                    <h3 className="text-text-muted text-sm font-bold uppercase mb-1">Available in Wallet</h3>
                    <h2 className="text-3xl font-bold text-text-main">₱{walletBalance.toLocaleString()}</h2>
                    <p className="text-xs text-text-muted mt-1">Transfers to funds/goals will differ from this amount.</p>
                </div>
                {/* Decorative Icon Box */}
                <div className="bg-background/80 p-3 rounded-2xl shadow-sm">
                    <Shield className="text-indigo-500" size={32} />
                </div>
            </div>

            {/* --- SECTION 1: SAVINGS ACCOUNTS (BANK CARDS) --- */}
            <div>
                {/* Section Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Shield className="text-indigo-500" size={24} /> Savings Accounts
                    </h2>
                    {/* Add Button */}
                    <button
                        onClick={() => { setCreateType('fund'); setShowCreateModal(true); }}
                        className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-indigo-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Grid of Bank Cards */}
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

                    {/* Empty State / Add Placeholder */}
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

            {/* --- SECTION 2: SAVINGS GOALS --- */}
            <div>
                {/* Section Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Target className="text-emerald-500" size={24} /> Savings Goals
                    </h2>
                    {/* Add Button */}
                    <button
                        onClick={() => { setCreateType('goal'); setShowCreateModal(true); }}
                        className="p-2 bg-surface-highlight rounded-xl text-text-muted hover:text-emerald-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Grid of Goal Cards */}
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

                    {/* Empty State */}
                    {goals.length === 0 && (
                        <div className="col-span-full p-8 border border-dashed border-border rounded-3xl text-center text-text-muted text-sm">
                            No active savings goals. Set a target and track your progress!
                        </div>
                    )}
                </div>
            </div>

            {/* --- CREATE NEW ITEM MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 p-6 space-y-4">

                        {/* Modal Title */}
                        <h3 className="text-lg font-bold text-text-main">
                            Create {createType === 'fund' ? 'Reserved Fund' : 'Savings Goal'}
                        </h3>

                        {/* Name Input */}
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

                        {/* Target Amount Input */}
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

                        {/* Conditional Fields for GOALS only */}
                        {createType === 'goal' && (
                            <>
                                {/* Deadline Input */}
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>

                                {/* Emergency Fund Checkbox */}
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
                            </>
                        )}

                        {/* Modal Footer (Buttons) */}
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
