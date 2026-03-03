import React from 'react';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, EmptyState, FormField, PillFilter, SectionHeader } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { currency, toAmount } from '../utils';
import type { FinanceRecord, TransactionSortMode, TransactionTypeFilter } from '../types';

type Props = {
    records: FinanceRecord[];
    search: string;
    onChangeSearch: (value: string) => void;
    typeFilter: TransactionTypeFilter;
    onChangeTypeFilter: (value: TransactionTypeFilter) => void;
    categoryFilter: string;
    onChangeCategoryFilter: (value: string) => void;
    categoryOptions: string[];
    sortMode: TransactionSortMode;
    onChangeSortMode: (value: TransactionSortMode) => void;
    onOpenTransactionModal: (type: 'income' | 'expense') => void;
    onDeleteTransaction: (id: number) => void;
};

export function FinanceTransactionsSection({
    records,
    search,
    onChangeSearch,
    typeFilter,
    onChangeTypeFilter,
    categoryFilter,
    onChangeCategoryFilter,
    categoryOptions,
    sortMode,
    onChangeSortMode,
    onOpenTransactionModal,
    onDeleteTransaction,
}: Props) {
    const hasActiveFilters = Boolean(search.trim()) || typeFilter !== 'all' || categoryFilter !== 'all';

    return (
        <View style={styles.sectionStack}>
            <Card variant="outline">
                <SectionHeader title="Recent transactions" actionLabel="Add" onActionPress={() => onOpenTransactionModal('expense')} />

                <View style={styles.controls}>
                    <FormField
                        label="Search"
                        value={search}
                        onChangeText={onChangeSearch}
                        placeholder="Description, category, or amount"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={styles.controlGroup}>
                        <Text style={styles.controlLabel}>Type</Text>
                        <PillFilter
                            options={[
                                { id: 'all', label: 'All' },
                                { id: 'income', label: 'Income' },
                                { id: 'expense', label: 'Expense' },
                            ]}
                            selectedId={typeFilter}
                            onSelect={(id) => onChangeTypeFilter(id as TransactionTypeFilter)}
                        />
                    </View>

                    <View style={styles.controlGroup}>
                        <Text style={styles.controlLabel}>Sort</Text>
                        <PillFilter
                            options={[
                                { id: 'newest', label: 'Newest' },
                                { id: 'oldest', label: 'Oldest' },
                                { id: 'highest', label: 'Highest' },
                                { id: 'lowest', label: 'Lowest' },
                            ]}
                            selectedId={sortMode}
                            onSelect={(id) => onChangeSortMode(id as TransactionSortMode)}
                        />
                    </View>

                    <View style={styles.controlGroup}>
                        <Text style={styles.controlLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFilterRow}>
                            {categoryOptions.map((option) => {
                                const selected = option === categoryFilter;

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[styles.filterPill, selected && styles.filterPillSelected]}
                                        onPress={() => onChangeCategoryFilter(option)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.filterPillText, selected && styles.filterPillTextSelected]}>
                                            {option === 'all' ? 'All categories' : option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <Text style={styles.resultText}>
                        {records.length} {records.length === 1 ? 'transaction' : 'transactions'} shown
                    </Text>
                </View>

                {records.length === 0 ? (
                    <EmptyState
                        iconName="wallet-outline"
                        title={hasActiveFilters ? 'No matching transactions' : 'Track your flow'}
                        description={
                            hasActiveFilters
                                ? 'Adjust the filters or add a new transaction to widen the list.'
                                : 'Record a transaction to start building your finance history.'
                        }
                        actionLabel={hasActiveFilters ? 'Add one instead' : 'Add transaction'}
                        onActionPress={() => onOpenTransactionModal('expense')}
                    />
                ) : (
                    <View style={styles.list}>
                        {records.map((item) => (
                            <Card key={item.id} style={styles.recordCard}>
                                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? colors.primaryLight : colors.dangerLight }]}>
                                    <Ionicons
                                        name={item.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'}
                                        size={20}
                                        color={item.type === 'income' ? colors.success : colors.danger}
                                    />
                                </View>
                                <View style={styles.recordInfo}>
                                    <Text style={styles.description}>{item.description || item.category}</Text>
                                    <Text style={styles.caption}>{format(new Date(item.date), 'MMM d, yyyy')} • {item.category}</Text>
                                </View>
                                <View style={styles.actions}>
                                    <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.textPrimary }]}>
                                        {item.type === 'income' ? '+' : '-'}{currency(toAmount(item.amount))}
                                    </Text>
                                    <TouchableOpacity onPress={() => onDeleteTransaction(item.id)} style={styles.deleteButton}>
                                        <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionStack: { gap: spacing.md },
    controls: {
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    controlGroup: {
        gap: spacing.xs,
    },
    controlLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    categoryFilterRow: {
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    filterPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    filterPillSelected: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight,
    },
    filterPillText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    filterPillTextSelected: {
        color: colors.secondary,
        fontWeight: typography.weights.medium,
    },
    resultText: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        marginLeft: spacing.xs,
    },
    list: { gap: spacing.sm },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordInfo: {
        flex: 1,
        gap: 2,
    },
    description: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    actions: {
        alignItems: 'flex-end',
        gap: spacing.xs,
    },
    amount: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
    },
    deleteButton: {
        padding: spacing.xs,
    },
});
