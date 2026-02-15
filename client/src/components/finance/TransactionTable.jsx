import React, { useState, useMemo } from 'react';
import { Filter, Search, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * TransactionTable Component
 * 
 * This component displays a list of financial transactions in a table format.
 * It includes functionality for searching, filtering by category, and deleting transactions.
 * 
 * Props:
 * @param {Array} logs - The array of transaction objects to display.
 * @param {boolean} loading - Indicates if data is currently being fetched.
 * @param {function} onDelete - Callback function to handle transaction deletion.
 * @param {object} categories - Object containing INCOME and EXPENSE arrays.
 */
const TransactionTable = ({ logs, loading, onDelete, categories }) => {
    // State for the search input field
    const [searchTerm, setSearchTerm] = useState('');

    // State for the category filter dropdown, defaulting to 'All'
    const [filterCategory, setFilterCategory] = useState('All');

    // useMemo hook to efficiently filter logs.
    // This calculation only re-runs when 'logs', 'searchTerm', or 'filterCategory' changes.
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Check if description or amount matches the search term (case-insensitive)
            const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.amount.toString().includes(searchTerm);

            // Check if the log matches the selected category filter
            const matchesCategory = filterCategory === 'All' || log.category === filterCategory;

            // Return true only if both conditions are met
            return matchesSearch && matchesCategory;
        });
    }, [logs, searchTerm, filterCategory]);

    // Combine income and expense categories for the dropdown, adding 'All' at the start
    const allCategories = ['All', ...categories.INCOME, ...categories.EXPENSE];

    /**
     * Helper Component: CategoryBadge
     * Renders a small colored badge for the category name.
     */
    const CategoryBadge = ({ type, category }) => {
        // Determine color based on transaction type
        const isIncome = type === 'income';
        const color = isIncome ? 'emerald' : 'rose';

        return (
            <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-${color}-500/10 text-${color}-600 border-${color}-500/20 whitespace-nowrap`}>
                {category}
            </span>
        );
    };

    return (
        // Main Container
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-card animate-in fade-in duration-500">

            {/* --- FILTER & SEARCH BAR SECTION --- */}
            <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Title and Count Badge */}
                <h3 className="text-base md:text-lg font-bold text-text-main flex items-center gap-2">
                    Transaction History
                    <span className="text-xs bg-surface-highlight px-2 py-0.5 rounded-full text-text-muted">
                        {filteredLogs.length}
                    </span>
                </h3>

                {/* Controls Container */}
                <div className="flex gap-2 w-full md:w-auto">

                    {/* Search Input Field */}
                    <div className="relative flex-1 md:w-48">
                        {/* Search Icon */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Styling for the search input
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="relative">
                        {/* Filter Icon (pointer-events-none prevents it from blocking clicks) */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                            <Filter size={14} />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            // Styling for the dropdown
                            className="appearance-none bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold text-text-muted"
                        >
                            {/* Map through all categories to create options */}
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            {/* Conditional Rendering based on state */}
            {loading ? (
                // Loading State
                <div className="p-10 text-center text-text-muted">Syncing with bank...</div>
            ) : filteredLogs.length === 0 ? (
                // Empty State
                <div className="p-10 text-center text-text-muted">No transactions found matching criteria.</div>
            ) : (
                // Table Data State
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        {/* Table Header */}
                        <thead className="bg-surface-highlight text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="p-3 md:p-4">Date</th>
                                <th className="p-3 md:p-4">Category</th>
                                <th className="p-3 md:p-4">Description</th>
                                <th className="p-3 md:p-4 text-right">Amount</th>
                                <th className="p-3 md:p-4 w-10"></th> {/* Empty header for delete action */}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-border">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-highlight/50 transition-colors group">

                                    {/* Date Column */}
                                    <td className="p-3 md:p-4 text-text-main text-xs md:text-sm font-medium whitespace-nowrap">
                                        {format(parseISO(log.date), 'MMM d')}
                                    </td>

                                    {/* Category Column (using Badge) */}
                                    <td className="p-3 md:p-4">
                                        <CategoryBadge type={log.type} category={log.category} />
                                    </td>

                                    {/* Description Column (truncated on mobile) */}
                                    <td className="p-3 md:p-4 text-text-muted text-xs md:text-sm max-w-[120px] md:max-w-none truncate">
                                        {log.description || '-'}
                                    </td>

                                    {/* Amount Column (Green for Income, Default for Expense) */}
                                    <td className={`p-3 md:p-4 text-right font-mono font-bold text-xs md:text-base ${log.type === 'income' ? 'text-emerald-500' : 'text-text-main'
                                        }`}>
                                        {log.type === 'income' ? '+' : '-'} ₱{log.amount.toLocaleString()}
                                    </td>

                                    {/* Actions Column (Delete Button) */}
                                    <td className="p-3 md:p-4 text-right">
                                        <button
                                            onClick={() => onDelete(log.id)}
                                            // Mobile: Always visible. Desktop: Hidden until hover.
                                            className="text-text-muted hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;
