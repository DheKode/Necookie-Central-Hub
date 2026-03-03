import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { PillFilter } from '../../components/ui';
import { FINANCE_TABS } from '../../src/features/finance/constants';
import { FinanceCalendarSection } from '../../src/features/finance/components/FinanceCalendarSection';
import { FinanceDashboardSection } from '../../src/features/finance/components/FinanceDashboardSection';
import { FinanceTransactionsSection } from '../../src/features/finance/components/FinanceTransactionsSection';
import { FinanceTransactionModal } from '../../src/features/finance/components/FinanceTransactionModal';
import { FinanceVaultItemModal } from '../../src/features/finance/components/FinanceVaultItemModal';
import { FinanceVaultSection } from '../../src/features/finance/components/FinanceVaultSection';
import { FinanceVaultTransferModal } from '../../src/features/finance/components/FinanceVaultTransferModal';
import { useFinanceHub } from '../../src/features/finance/useFinanceHub';

export default function FinanceScreen() {
    const finance = useFinanceHub();

    if (finance.loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading finance hub...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={finance.refreshing} onRefresh={finance.onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Finance Hub</Text>
                    <Text style={styles.subtitle}>Mobile is now aligned around the same core sections as web.</Text>
                </View>

                <PillFilter
                    options={FINANCE_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
                    selectedId={finance.activeTab}
                    onSelect={(id) => finance.setActiveTab(id as typeof FINANCE_TABS[number]['id'])}
                />

                {finance.activeTab === 'dashboard' ? (
                    <FinanceDashboardSection
                        stats={finance.stats}
                        budgetStats={finance.budgetStats}
                        categoryData={finance.categoryData}
                        dailyTrend={finance.dailyTrend}
                        maxTrendAmount={finance.maxTrendAmount}
                        onOpenTransactionModal={finance.openTransactionModal}
                    />
                ) : null}

                {finance.activeTab === 'calendar' ? (
                    <FinanceCalendarSection
                        calendarMonth={finance.calendarMonth}
                        setCalendarMonth={finance.setCalendarMonth}
                        selectedDate={finance.selectedDate}
                        setSelectedDate={finance.setSelectedDate}
                        daysInMonth={finance.daysInMonth}
                        blankDays={finance.blankDays}
                        dailyMap={finance.dailyMap}
                        selectedDay={finance.selectedDay}
                    />
                ) : null}

                {finance.activeTab === 'vault' ? (
                    <FinanceVaultSection
                        walletBalance={finance.walletBalance}
                        records={finance.records}
                        funds={finance.funds}
                        goals={finance.goals}
                        vaultFeedback={finance.vaultFeedback}
                        onCreateFund={() => finance.openVaultModal('fund')}
                        onCreateGoal={() => finance.openVaultModal('goal')}
                        onEditFund={(fund) => finance.openVaultEditModal(fund, 'fund')}
                        onEditGoal={(goal) => finance.openVaultEditModal(goal, 'goal')}
                        onDeleteFund={(id) => finance.deleteVaultItem('fund', id)}
                        onDeleteGoal={(id) => finance.deleteVaultItem('goal', id)}
                        onTransfer={finance.openTransferModal}
                    />
                ) : null}

                {finance.activeTab === 'transactions' ? (
                    <FinanceTransactionsSection
                        records={finance.records}
                        onOpenTransactionModal={finance.openTransactionModal}
                        onDeleteTransaction={finance.deleteTransaction}
                    />
                ) : null}
            </ScrollView>

            <FinanceTransactionModal
                visible={finance.transactionModalVisible}
                form={finance.transactionForm}
                submitting={finance.submittingTransaction}
                onClose={() => finance.setTransactionModalVisible(false)}
                onChange={(updater) => finance.setTransactionForm(updater)}
                onSubmit={finance.submitTransaction}
            />

            <FinanceVaultItemModal
                visible={finance.vaultModalVisible}
                form={finance.vaultForm}
                editing={finance.vaultEditing}
                submitting={finance.submittingVaultItem}
                onClose={finance.closeVaultModal}
                onChange={(updater) => finance.setVaultForm(updater)}
                onSubmit={finance.submitVaultItem}
            />

            <FinanceVaultTransferModal
                visible={finance.transferModalVisible}
                walletBalance={finance.walletBalance}
                transferState={finance.transferState}
                transferAmount={finance.transferAmount}
                submitting={finance.submittingTransfer}
                onClose={finance.closeTransferModal}
                onChangeAction={(action) => finance.setTransferState((current) => ({ ...current, action }))}
                onChangeAmount={finance.setTransferAmount}
                onSubmit={finance.submitTransfer}
            />

            <TouchableOpacity style={styles.fab} onPress={() => finance.openTransactionModal('expense')} accessibilityLabel="Add transaction">
                <Ionicons name="add" size={28} color={colors.surface} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl + 32,
        gap: spacing.lg,
    },
    header: {
        gap: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeights.sm,
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: spacing.lg,
        width: 60,
        height: 60,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.floating,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
});
