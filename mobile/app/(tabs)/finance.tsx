import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { ErrorState, FAB, LoadingState, PillFilter, Screen, ScreenContent, ScreenHeader, ScreenSection, screenLayout } from '../../components/ui';
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
            <Screen>
                <ScreenHeader eyebrow="Finance" title="Finance hub" subtitle="Track money movement, savings, and transaction history in one place." />
                <ScreenContent style={styles.loadingStateWrap}>
                    <LoadingState title="Loading finance hub" description="Pulling balances, transactions, and vault data into one view." />
                </ScreenContent>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScreenHeader
                eyebrow="Finance"
                title="Finance hub"
                subtitle="Track money movement, savings, and transaction history in one place."
            />
            <ScreenContent>
            <ScrollView
                contentContainerStyle={[screenLayout.scrollContent, styles.content]}
                refreshControl={<RefreshControl refreshing={finance.refreshing} onRefresh={finance.onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                <ScreenSection>
                    <PillFilter
                        options={FINANCE_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
                        selectedId={finance.activeTab}
                        onSelect={(id) => finance.setActiveTab(id as typeof FINANCE_TABS[number]['id'])}
                    />
                </ScreenSection>

                {finance.error ? (
                    <ScreenSection>
                        <ErrorState description={finance.error} onActionPress={finance.onRefresh} />
                    </ScreenSection>
                ) : (
                    <>
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
                                records={finance.filteredTransactions}
                                search={finance.transactionSearch}
                                onChangeSearch={finance.setTransactionSearch}
                                typeFilter={finance.transactionTypeFilter}
                                onChangeTypeFilter={finance.setTransactionTypeFilter}
                                categoryFilter={finance.transactionCategoryFilter}
                                onChangeCategoryFilter={finance.setTransactionCategoryFilter}
                                categoryOptions={finance.transactionCategoryOptions}
                                sortMode={finance.transactionSortMode}
                                onChangeSortMode={finance.setTransactionSortMode}
                                onOpenTransactionModal={finance.openTransactionModal}
                                onDeleteTransaction={finance.deleteTransaction}
                            />
                        ) : null}
                    </>
                )}
            </ScrollView>
            </ScreenContent>

            <FinanceTransactionModal
                visible={finance.transactionModalVisible}
                form={finance.transactionForm}
                errors={finance.transactionErrors}
                submitting={finance.submittingTransaction}
                onClose={finance.closeTransactionModal}
                onChange={finance.updateTransactionForm}
                onChangeAmount={finance.updateTransactionAmount}
                onChangeDate={finance.updateTransactionDate}
                onSubmit={finance.submitTransaction}
            />

            <FinanceVaultItemModal
                visible={finance.vaultModalVisible}
                form={finance.vaultForm}
                errors={finance.vaultErrors}
                editing={finance.vaultEditing}
                submitting={finance.submittingVaultItem}
                onClose={finance.closeVaultModal}
                onChange={finance.updateVaultForm}
                onChangeTarget={finance.updateVaultTarget}
                onChangeDeadline={finance.updateVaultDeadline}
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
                onChangeAmount={finance.updateTransferAmount}
                onSubmit={finance.submitTransfer}
            />

            <FAB iconName="add" onPress={() => finance.openTransactionModal('expense')} accessibilityLabel="Add transaction" />
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: spacing.lg,
    },
    loadingStateWrap: {
        flex: 1,
        justifyContent: 'center',
    },
});
