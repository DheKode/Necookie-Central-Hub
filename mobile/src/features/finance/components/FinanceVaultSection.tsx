import React from 'react';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, EmptyState, SectionHeader } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { getVaultTransferHistory, currency, toAmount } from '../utils';
import type { FinanceRecord, FundRecord, GoalRecord, VaultFeedback } from '../types';

type Props = {
    walletBalance: number;
    records: FinanceRecord[];
    funds: FundRecord[];
    goals: GoalRecord[];
    vaultFeedback: VaultFeedback | null;
    onCreateFund: () => void;
    onCreateGoal: () => void;
    onEditFund: (fund: FundRecord) => void;
    onEditGoal: (goal: GoalRecord) => void;
    onDeleteFund: (id: number) => void;
    onDeleteGoal: (id: number) => void;
    onTransfer: (item: FundRecord | GoalRecord, itemType: 'fund' | 'goal', action: 'deposit' | 'withdraw' | 'adjust') => void;
};

export function FinanceVaultSection({
    walletBalance,
    records,
    funds,
    goals,
    vaultFeedback,
    onCreateFund,
    onCreateGoal,
    onEditFund,
    onEditGoal,
    onDeleteFund,
    onDeleteGoal,
    onTransfer,
}: Props) {
    return (
        <View style={styles.sectionStack}>
            <Card style={styles.heroCard}>
                <View>
                    <Text style={styles.heroLabel}>Available in wallet</Text>
                    <Text style={styles.heroAmount}>{currency(walletBalance)}</Text>
                    <Text style={styles.heroCopy}>Reserved funds and savings goals can branch off from this.</Text>
                </View>
                <View style={styles.heroBadge}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.secondary} />
                </View>
            </Card>

            {vaultFeedback ? (
                <Card
                    variant="outline"
                    style={[
                        styles.feedbackCard,
                        vaultFeedback.tone === 'success' ? styles.successFeedback : styles.errorFeedback,
                    ]}
                >
                    <View style={styles.feedbackRow}>
                        <Ionicons
                            name={vaultFeedback.tone === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                            size={18}
                            color={vaultFeedback.tone === 'success' ? colors.success : colors.danger}
                        />
                        <Text style={styles.feedbackText}>{vaultFeedback.message}</Text>
                    </View>
                </Card>
            ) : null}

            <Card variant="outline">
                <SectionHeader title="Savings accounts" actionLabel="Create" onActionPress={onCreateFund} />
                {funds.length === 0 ? (
                    <EmptyState
                        iconName="wallet-outline"
                        title="No savings accounts yet"
                        description="Create your first fund for bills, travel, or anything you want ring-fenced."
                        actionLabel="Create fund"
                        onActionPress={onCreateFund}
                    />
                ) : (
                    <View style={styles.itemList}>
                        {funds.map((fund) => (
                            <VaultCard
                                key={fund.id}
                                item={fund}
                                itemType="fund"
                                records={records}
                                onEdit={() => onEditFund(fund)}
                                onDelete={() => onDeleteFund(fund.id)}
                                onTransfer={onTransfer}
                            />
                        ))}
                    </View>
                )}
            </Card>

            <Card variant="outline">
                <SectionHeader title="Savings goals" actionLabel="Create" onActionPress={onCreateGoal} />
                {goals.length === 0 ? (
                    <EmptyState
                        iconName="flag-outline"
                        title="No active goals"
                        description="Set a target and start tracking progress toward your next purchase or buffer."
                        actionLabel="Create goal"
                        onActionPress={onCreateGoal}
                    />
                ) : (
                    <View style={styles.itemList}>
                        {goals.map((goal) => (
                            <VaultCard
                                key={goal.id}
                                item={goal}
                                itemType="goal"
                                records={records}
                                onEdit={() => onEditGoal(goal)}
                                onDelete={() => onDeleteGoal(goal.id)}
                                onTransfer={onTransfer}
                            />
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );
}

type VaultCardProps = {
    item: FundRecord | GoalRecord;
    itemType: 'fund' | 'goal';
    records: FinanceRecord[];
    onEdit: () => void;
    onDelete: () => void;
    onTransfer: (item: FundRecord | GoalRecord, itemType: 'fund' | 'goal', action: 'deposit' | 'withdraw' | 'adjust') => void;
};

function VaultCard({ item, itemType, records, onEdit, onDelete, onTransfer }: VaultCardProps) {
    const currentAmount = toAmount(item.current_amount);
    const targetAmount = toAmount(item.target_amount);
    const progress = targetAmount ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
    const transferHistory = getVaultTransferHistory(records, item.name);
    const goalItem = itemType === 'goal' ? item as GoalRecord : null;
    const isEmergency = Boolean(goalItem?.is_emergency_fund);

    return (
        <Card style={styles.itemCard} variant="flat">
            <View style={styles.itemHeader}>
                <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.caption}>
                        {itemType === 'fund'
                            ? `Target ${currency(targetAmount)}`
                            : goalItem?.deadline
                                ? `Due ${format(parseISO(goalItem.deadline), 'MMM d, yyyy')}`
                                : 'No deadline'}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                    <View style={[
                        styles.badge,
                        { backgroundColor: itemType === 'fund' ? colors.secondaryLight : isEmergency ? colors.dangerLight : colors.primaryLight },
                    ]}>
                        <Ionicons
                            name={itemType === 'fund' ? 'card-outline' : isEmergency ? 'flash-outline' : 'trophy-outline'}
                            size={14}
                            color={itemType === 'fund' ? colors.secondary : isEmergency ? colors.danger : colors.success}
                        />
                    </View>
                </View>
            </View>

            <Text style={styles.balanceText}>
                {itemType === 'goal'
                    ? `${currency(currentAmount)} / ${currency(targetAmount)}`
                    : currency(currentAmount)}
            </Text>
            <View style={styles.progressTrack}>
                <View style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: itemType === 'fund' ? colors.secondary : isEmergency ? colors.danger : colors.success },
                ]} />
            </View>

            <View style={styles.transferRow}>
                <Button label="Withdraw" variant="secondary" size="sm" onPress={() => onTransfer(item, itemType, 'withdraw')} style={styles.transferButton} />
                <Button label="Deposit" size="sm" onPress={() => onTransfer(item, itemType, 'deposit')} style={styles.transferButton} />
                <Button label="Adjust" variant="ghost" size="sm" onPress={() => onTransfer(item, itemType, 'adjust')} style={styles.transferButton} />
            </View>

            {transferHistory.length ? (
                <View style={styles.historyList}>
                    {transferHistory.map((entry) => (
                        <View key={entry.id} style={styles.historyRow}>
                            <View style={styles.historyInfo}>
                                <View style={[styles.historyDot, { backgroundColor: itemType === 'fund' ? (entry.direction === 'deposit' ? colors.secondary : colors.success) : (entry.direction === 'deposit' ? colors.danger : colors.success) }]} />
                                <Text style={styles.historyLabel}>
                                    {entry.direction === 'deposit' ? 'Deposit' : 'Withdraw'} · {format(parseISO(entry.date), 'MMM d')}
                                </Text>
                            </View>
                            <Text style={styles.historyAmount}>{currency(entry.amount)}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
        </Card>
    );
}

const styles = StyleSheet.create({
    sectionStack: { gap: spacing.md },
    heroCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.secondaryLight,
        borderWidth: 1,
        borderColor: '#D8E2E9',
    },
    heroLabel: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
        letterSpacing: 0.8,
    },
    heroAmount: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    heroCopy: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
    },
    heroBadge: {
        width: 52,
        height: 52,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackCard: {
        paddingVertical: spacing.md,
    },
    successFeedback: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    errorFeedback: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    feedbackText: {
        flex: 1,
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
    },
    itemList: { gap: spacing.sm },
    itemCard: { gap: spacing.md },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    itemName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceText: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    progressTrack: {
        height: 10,
        backgroundColor: colors.borderLight,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: radius.pill,
    },
    transferRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    transferButton: { flex: 1 },
    historyList: { gap: spacing.xs },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        paddingTop: spacing.xs,
    },
    historyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    historyDot: {
        width: 8,
        height: 8,
        borderRadius: radius.pill,
    },
    historyLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
    historyAmount: {
        fontSize: typography.sizes.xs,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
});
