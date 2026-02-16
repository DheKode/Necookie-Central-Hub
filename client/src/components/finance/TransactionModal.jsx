import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';


/**
 * TransactionModal Component
 *
 * This component renders a modal (popup) for adding new financial transactions.
 * It supports both "Income" and "Expense" types, adjusting its UI accordingly.
 *
 * Props:
 * @param {boolean} isOpen - Controls whether the modal is visible or hidden.
 * @param {string} type - The type of transaction: 'income' or 'expense'.
 * @param {function} onClose - Callback function to close the modal.
 * @param {function} onConfirm - Callback function to submit the transaction data.
 * @param {object} categories - Pass categories as prop to avoid circular dependency or make it self-contained
 */
const TransactionModal = ({ isOpen, type, onClose, onConfirm, categories, customCategories = [] }) => {
    // State to hold the form data entered by the user.
    const [formData, setFormData] = useState({
        amount: '',
        category: type === 'income' ? categories.INCOME[0] : categories.EXPENSE[0],
        customCategory: '', // New state for custom input
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Reset form when modal opens or type/categories change
    React.useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                category: type === 'income' ? categories.INCOME[0] : categories.EXPENSE[0],
                customCategory: ''
            }));
        }
    }, [isOpen, type, categories]);

    // Function to handle the form submission.
    const handleSubmit = () => {
        // Determine final category value
        let finalCategory = formData.category;
        if (formData.category === 'Other') {
            // Must have a custom value if "Other" is selected
            if (!formData.customCategory.trim()) return;
            finalCategory = formData.customCategory.trim();
        }

        if (!formData.amount || !finalCategory) return;

        onConfirm({
            type,
            amount: parseFloat(formData.amount),
            category: finalCategory,
            description: formData.description,
            date: formData.date
        });
    };

    if (!isOpen) return null;

    const currentCategories = type === 'income' ? categories.INCOME : categories.EXPENSE;
    const colorTheme = type === 'income' ? 'emerald' : 'rose';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className={`p-4 md:p-6 border-b border-border flex justify-between items-center bg-${colorTheme}-500/10 shrink-0`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 text-${colorTheme}-600`}>
                        {type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        Add {type === 'income' ? 'Income' : 'Expense'}
                    </h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">₱</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-background border border-border rounded-xl pl-8 p-3 text-text-main focus:outline-none focus:border-primary font-mono font-bold text-lg"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Category</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {currentCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.category === cat
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-background text-text-muted border-border hover:border-primary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Custom Category Input (Only if "Other" is selected) */}
                        {formData.category === 'Other' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                <input
                                    type="text"
                                    value={formData.customCategory}
                                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                    placeholder="Type custom category..."
                                    className="w-full bg-surface-highlight border border-primary/50 rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary placeholder:text-text-muted/50"
                                    autoFocus
                                />
                                {/* Chips for existing custom categories */}
                                {customCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {customCategories.map(customCat => (
                                            <button
                                                key={customCat}
                                                onClick={() => setFormData({ ...formData, customCategory: customCat })}
                                                className="px-3 py-1 bg-surface-highlight border border-border rounded-full text-xs text-text-muted hover:text-text-main hover:border-primary transition-colors"
                                            >
                                                {customCat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. McDo"
                                className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl p-3 text-text-main text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 bg-surface-highlight border-t border-border flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 text-text-muted font-bold hover:bg-border rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formData.category === 'Other' && !formData.customCategory.trim()}
                        className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 bg-${colorTheme}-500 hover:bg-${colorTheme}-600 shadow-${colorTheme}-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
