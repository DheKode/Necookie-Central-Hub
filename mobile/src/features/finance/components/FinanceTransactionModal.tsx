import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, FormField, Modal, PillFilter } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import type { TransactionFormErrors, TransactionFormState } from '../types';

type Props = {
    visible: boolean;
    form: TransactionFormState;
    errors: TransactionFormErrors;
    submitting: boolean;
    onClose: () => void;
    onChange: (updater: (current: TransactionFormState) => TransactionFormState) => void;
    onChangeAmount: (value: string) => void;
    onChangeDate: (value: string) => void;
    onSubmit: () => void;
};

export function FinanceTransactionModal({
    visible,
    form,
    errors,
    submitting,
    onClose,
    onChange,
    onChangeAmount,
    onChangeDate,
    onSubmit,
}: Props) {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
            scrollable
            title="Add transaction"
            subtitle="Capture the same core inputs the web flow uses with cleaner amount and date handling."
            footer={(
                <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} />
                    <Button label="Save" onPress={onSubmit} loading={submitting} />
                </View>
            )}
        >
            <PillFilter
                options={TRANSACTION_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                selectedId={form.type}
                onSelect={(id) => onChange((current) => ({
                    ...current,
                    type: id as 'income' | 'expense',
                    category: CATEGORIES[id as 'income' | 'expense'][0],
                }))}
            />

            <FormField
                label="Amount"
                keyboardType="decimal-pad"
                value={form.amount}
                onChangeText={onChangeAmount}
                placeholder="0.00"
                error={errors.amount}
            />
            <FormField label="Description" value={form.description} onChangeText={(value) => onChange((current) => ({ ...current, description: value }))} placeholder="Optional note" />
            <FormField
                label="Date"
                value={form.date}
                onChangeText={onChangeDate}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={10}
                error={errors.date}
            />

            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryWrap}>
                {CATEGORIES[form.type].map((category) => {
                    const selected = category === form.category;

                    return (
                        <TouchableOpacity
                            key={category}
                            style={[styles.categoryPill, selected && styles.categoryPillSelected]}
                            onPress={() => onChange((current) => ({ ...current, category }))}
                        >
                            <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
        marginBottom: spacing.sm,
    },
    categoryWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    categoryPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    categoryPillSelected: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    categoryText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    categoryTextSelected: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
});
