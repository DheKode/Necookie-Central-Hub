import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, FormField, Modal, PillFilter } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import type { TransactionFormState } from '../types';

type Props = {
    visible: boolean;
    form: TransactionFormState;
    submitting: boolean;
    onClose: () => void;
    onChange: (updater: (current: TransactionFormState) => TransactionFormState) => void;
    onSubmit: () => void;
};

export function FinanceTransactionModal({ visible, form, submitting, onClose, onChange, onSubmit }: Props) {
    return (
        <Modal visible={visible} onClose={onClose}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Add transaction</Text>
                <Text style={styles.subtitle}>Capture the same core inputs the web flow uses.</Text>

                <PillFilter
                    options={TRANSACTION_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                    selectedId={form.type}
                    onSelect={(id) => onChange((current) => ({
                        ...current,
                        type: id as 'income' | 'expense',
                        category: CATEGORIES[id as 'income' | 'expense'][0],
                    }))}
                />

                <FormField label="Amount" keyboardType="decimal-pad" value={form.amount} onChangeText={(value) => onChange((current) => ({ ...current, amount: value }))} placeholder="0.00" />
                <FormField label="Description" value={form.description} onChangeText={(value) => onChange((current) => ({ ...current, description: value }))} placeholder="Optional note" />
                <FormField label="Date" value={form.date} onChangeText={(value) => onChange((current) => ({ ...current, date: value }))} placeholder="YYYY-MM-DD" autoCapitalize="none" />

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

                <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} />
                    <Button label="Save" onPress={onSubmit} loading={submitting} />
                </View>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeights.sm,
    },
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
