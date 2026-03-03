import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, FormField, Modal, PillFilter } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { TRANSFER_TYPES } from '../constants';
import { currency } from '../utils';
import type { VaultTransferState } from '../types';

type Props = {
    visible: boolean;
    walletBalance: number;
    transferState: VaultTransferState;
    transferAmount: string;
    submitting: boolean;
    onClose: () => void;
    onChangeAction: (action: 'deposit' | 'withdraw' | 'adjust') => void;
    onChangeAmount: (value: string) => void;
    onSubmit: () => void;
};

export function FinanceVaultTransferModal({
    visible,
    walletBalance,
    transferState,
    transferAmount,
    submitting,
    onClose,
    onChangeAction,
    onChangeAmount,
    onSubmit,
}: Props) {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
            scrollable
            title={`${transferState.action === 'deposit'
                ? 'Deposit into'
                : transferState.action === 'withdraw'
                    ? 'Withdraw from'
                    : 'Adjust'} ${transferState.itemName}`}
            subtitle={
                transferState.action === 'deposit'
                    ? `Available in wallet: ${currency(walletBalance)}`
                    : `Available in ${transferState.itemName}: ${currency(transferState.currentAmount)}`
            }
            footer={(
                <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} />
                    <Button
                        label={
                            transferState.action === 'deposit'
                                ? 'Confirm deposit'
                                : transferState.action === 'withdraw'
                                    ? 'Confirm withdrawal'
                                    : 'Confirm adjustment'
                        }
                        onPress={onSubmit}
                        loading={submitting}
                    />
                </View>
            )}
        >
            <PillFilter
                options={TRANSFER_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                selectedId={transferState.action}
                onSelect={(id) => onChangeAction(id as 'deposit' | 'withdraw' | 'adjust')}
            />

            <FormField label="Amount" keyboardType="decimal-pad" value={transferAmount} onChangeText={onChangeAmount} placeholder="0.00" />

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Transfer impact</Text>
                <Text style={styles.infoText}>
                    {transferState.action === 'deposit'
                        ? 'This moves money out of wallet and into the selected vault item.'
                        : transferState.action === 'withdraw'
                            ? 'This moves money back into wallet from the selected vault item.'
                            : 'This changes the reserved balance only and does not affect wallet totals.'}
                </Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    infoCard: {
        backgroundColor: colors.surfaceLayered,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    infoTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    infoText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeights.sm,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
    },
});
