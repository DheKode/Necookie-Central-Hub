import React from 'react';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, EmptyState, SectionHeader } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { currency, toAmount } from '../utils';
import type { FinanceRecord } from '../types';

type Props = {
    records: FinanceRecord[];
    onOpenTransactionModal: (type: 'income' | 'expense') => void;
    onDeleteTransaction: (id: number) => void;
};

export function FinanceTransactionsSection({
    records,
    onOpenTransactionModal,
    onDeleteTransaction,
}: Props) {
    return (
        <View style={styles.sectionStack}>
            <Card variant="outline">
                <SectionHeader title="Recent transactions" actionLabel="Add" onActionPress={() => onOpenTransactionModal('expense')} />
                {records.length === 0 ? (
                    <EmptyState
                        iconName="wallet-outline"
                        title="Track your flow"
                        description="Record a transaction to start building your finance history."
                        actionLabel="Add transaction"
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
                                    <Text style={styles.caption}>{format(new Date(item.date), 'MMM d, yyyy')} · {item.category}</Text>
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
