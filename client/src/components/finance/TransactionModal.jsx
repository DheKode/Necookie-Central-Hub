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
const TransactionModal = ({ isOpen, type, onClose, onConfirm, categories }) => {
    // State to hold the form data entered by the user.
    // We initialize it with default empty values.
    const [formData, setFormData] = useState({
        amount: '',       // The monetary value of the transaction
        category: type === 'income' ? categories.INCOME[0] : categories.EXPENSE[0],
        description: '',  // A brief note about the transaction
        date: new Date().toISOString().split('T')[0] // Default to today's date (YYYY-MM-DD format)
    });

    // Function to handle the form submission.
    const handleSubmit = () => {
        // Validation: Check if amount or category is missing.
        // If either is missing, we stop here and do not proceed.
        if (!formData.amount || !formData.category) return;

        // Call the onConfirm prop with the formatted transaction data.
        onConfirm({
            type, // 'income' or 'expense'
            amount: parseFloat(formData.amount), // Convert string amount to number
            category: formData.category,
            description: formData.description,
            date: formData.date
        });
    };

    // If the modal is not open (isOpen is false), we return null to render nothing.
    if (!isOpen) return null;

    // Determine which set of categories to display based on the transaction type.
    // Using the passed categories prop to keep it pure if possible, or fallback.
    const currentCategories = type === 'income' ? categories.INCOME : categories.EXPENSE;

    // Determine the color theme (Emerald for Income, Rose for Expense).
    const colorTheme = type === 'income' ? 'emerald' : 'rose';

    return (
        // Backdrop: A semi-transparent black overlay that covers the whole screen.
        // 'fixed inset-0' positions it over the entire viewport.
        // 'z-50' ensures it sets on top of other content.
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            {/* Modal Container: The actual popup window */}
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header Section: Title and Close Button */}
                <div className={`p-4 md:p-6 border-b border-border flex justify-between items-center bg-${colorTheme}-500/10`}>
                    {/* Title with Icon */}
                    <h3 className={`text-lg font-bold flex items-center gap-2 text-${colorTheme}-600`}>
                        {/* Display ArrowUpRight for Income, ArrowDownRight for Expense */}
                        {type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        Add {type === 'income' ? 'Income' : 'Expense'}
                    </h3>

                    {/* Close Button */}
                    <button onClick={onClose} className="text-text-muted hover:text-text-main">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Section: Form Inputs */}
                <div className="p-4 md:p-6 space-y-4">

                    {/* Amount Input Group */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Amount</label>
                        <div className="relative">
                            {/* Currency Symbol Positioned Absolutely inside the input container */}
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">₱</span>
                            <input
                                type="number"
                                value={formData.amount}
                                // Update state on change
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                // Styling the input to look prominent
                                className="w-full bg-background border border-border rounded-xl pl-8 p-3 text-text-main focus:outline-none focus:border-primary font-mono font-bold text-lg"
                                autoFocus // Automatically focus this input when modal opens
                            />
                        </div>
                    </div>

                    {/* Category Selection Group */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Category</label>
                        {/* Grid layout for category buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            {currentCategories.map(cat => (
                                <button
                                    key={cat}
                                    // Update category in state when clicked
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    // Conditional styling: Highlight if selected, otherwise standard style
                                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.category === cat
                                        ? 'bg-primary text-white border-primary shadow-md' // Selected Style
                                        : 'bg-background text-text-muted border-border hover:border-primary' // Unselected Style
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description and Date Inputs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Description Input */}
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

                        {/* Date Input */}
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

                {/* Footer Section: Action Buttons */}
                <div className="p-4 md:p-6 bg-surface-highlight border-t border-border flex justify-end gap-3">
                    {/* Cancel Button */}
                    <button onClick={onClose} className="px-5 py-2.5 text-text-muted font-bold hover:bg-border rounded-xl transition-colors">
                        Cancel
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={handleSubmit}
                        // Dynamic styling based on theme (emerald vs rose)
                        className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 bg-${colorTheme}-500 hover:bg-${colorTheme}-600 shadow-${colorTheme}-500/20`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
