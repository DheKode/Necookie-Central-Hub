import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, SectionHeader } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { CATEGORY_COLORS } from '../constants';
import { currency } from '../utils';
import type { BudgetStat, FinanceStats } from '../types';

type Props = {
    stats: FinanceStats;
    budgetStats: BudgetStat[];
    categoryData: { entries: Array<{ name: string; value: number }>; total: number };
    dailyTrend: Array<{ label: string; amount: number }>;
    maxTrendAmount: number;
    onOpenTransactionModal: (type: 'income' | 'expense') => void;
};

const toneColorMap = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
} as const;

export function FinanceDashboardSection({
    stats,
    budgetStats,
    categoryData,
    dailyTrend,
    maxTrendAmount,
    onOpenTransactionModal,
}: Props) {
    return (
        <View style={styles.sectionStack}>
            <Card style={styles.heroCard}>
                <View style={styles.heroContent}>
                    <View style={styles.heroText}>
                        <Text style={styles.heroLabel}>Net available balance</Text>
                        <Text style={styles.heroAmount}>{currency(stats.totalBalance)}</Text>
                        <Text style={styles.heroSubtext}>Track your flow, savings, and spending rhythm.</Text>
                    </View>
                    <View style={styles.heroActions}>
                        <Button label="Add Income" onPress={() => onOpenTransactionModal('income')} style={styles.heroButton} />
                        <Button label="Add Expense" variant="danger" onPress={() => onOpenTransactionModal('expense')} style={styles.heroButton} />
                    </View>
                </View>
            </Card>

            <View style={styles.statGrid}>
                <StatCard icon="trending-down-outline" color={colors.danger} background={colors.dangerLight} label="Today's Burn" value={currency(stats.expenseToday)} />
                <StatCard icon="calendar-outline" color={colors.warning} background={colors.warningLight} label="Weekly Burn" value={currency(stats.expenseWeek)} />
                <StatCard icon="trending-up-outline" color={colors.success} background={colors.primaryLight} label="Income Today" value={currency(stats.incomeToday)} />
            </View>

            <Card variant="outline">
                <SectionHeader title="Monthly budget" />
                <View style={styles.listGap}>
                    {budgetStats.map((item) => (
                        <View key={item.category} style={styles.rowGap}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.primaryText}>{item.category}</Text>
                                <Text style={styles.secondaryText}>{currency(item.spent)} / {currency(item.limit)}</Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: toneColorMap[item.tone] }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </Card>

            <Card variant="outline">
                <SectionHeader title="Spend breakdown" />
                {categoryData.entries.length === 0 ? (
                    <Text style={styles.secondaryText}>No expense data yet.</Text>
                ) : (
                    <View style={styles.listGap}>
                        {categoryData.entries.map((item, index) => {
                            const percentage = categoryData.total ? (item.value / categoryData.total) * 100 : 0;

                            return (
                                <View key={item.name} style={styles.rowGap}>
                                    <View style={styles.rowBetween}>
                                        <View style={styles.labelWrap}>
                                            <View style={[styles.breakdownDot, { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} />
                                            <Text style={styles.primaryText}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.secondaryText}>{currency(item.value)}</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </Card>

            <Card variant="outline">
                <SectionHeader title="Daily trend" actionLabel="Last 7 days" />
                <View style={styles.trendChart}>
                    {dailyTrend.map((item) => (
                        <View key={item.label} style={styles.trendBarWrap}>
                            <Text style={styles.trendAmount}>{item.amount > 0 ? currency(item.amount) : '$0'}</Text>
                            <View style={styles.trendTrack}>
                                <View style={[styles.trendBar, { height: `${Math.max((item.amount / maxTrendAmount) * 100, item.amount > 0 ? 10 : 4)}%` }]} />
                            </View>
                            <Text style={styles.trendLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </Card>
        </View>
    );
}

type StatCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
    label: string;
    value: string;
};

function StatCard({ icon, color, background, label, value }: StatCardProps) {
    return (
        <Card variant="outline" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: background }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    sectionStack: { gap: spacing.md },
    heroCard: {
        padding: spacing.xl,
        backgroundColor: '#1F2933',
        borderWidth: 1,
        borderColor: '#2D3B47',
    },
    heroContent: { gap: spacing.lg },
    heroText: { gap: spacing.xs },
    heroLabel: {
        color: '#B7C2CC',
        textTransform: 'uppercase',
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        letterSpacing: 1,
    },
    heroAmount: {
        color: colors.surface,
        fontSize: 40,
        fontWeight: typography.weights.bold,
    },
    heroSubtext: {
        color: '#C9D3DC',
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
    },
    heroActions: { flexDirection: 'row', gap: spacing.sm },
    heroButton: { flex: 1 },
    statGrid: { gap: spacing.sm },
    statCard: { gap: spacing.sm },
    statIcon: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
        letterSpacing: 0.8,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        color: colors.textPrimary,
        fontWeight: typography.weights.bold,
    },
    listGap: { gap: spacing.md },
    rowGap: { gap: spacing.xs },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },
    primaryText: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    secondaryText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    labelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    breakdownDot: {
        width: 10,
        height: 10,
        borderRadius: radius.pill,
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
    trendChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.xs,
        minHeight: 180,
        paddingTop: spacing.sm,
    },
    trendBarWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing.xs,
    },
    trendAmount: {
        fontSize: 10,
        color: colors.textTertiary,
    },
    trendTrack: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    trendBar: {
        width: '70%',
        backgroundColor: colors.primary,
        borderTopLeftRadius: radius.sm,
        borderTopRightRadius: radius.sm,
        minHeight: 4,
    },
    trendLabel: {
        fontSize: 11,
        color: colors.textSecondary,
    },
});
