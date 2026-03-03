import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button, FormField, Modal, PillFilter } from '../../../../components/ui';
import { colors, spacing, typography } from '../../../../theme';
import { CREATE_TYPES } from '../constants';
import type { VaultEditingState, VaultFormErrors, VaultFormState } from '../types';

type Props = {
    visible: boolean;
    form: VaultFormState;
    errors: VaultFormErrors;
    editing: VaultEditingState;
    submitting: boolean;
    onClose: () => void;
    onChange: (updater: (current: VaultFormState) => VaultFormState) => void;
    onChangeTarget: (value: string) => void;
    onChangeDeadline: (value: string) => void;
    onSubmit: () => void;
};

export function FinanceVaultItemModal({
    visible,
    form,
    errors,
    editing,
    submitting,
    onClose,
    onChange,
    onChangeTarget,
    onChangeDeadline,
    onSubmit,
}: Props) {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
            scrollable
            title={editing.mode === 'edit' ? 'Edit vault item' : 'Create vault item'}
            subtitle={
                editing.mode === 'edit'
                    ? 'Update the details for this fund or goal.'
                    : 'Start with funds and goals first; transfer mechanics can layer in after this.'
            }
            footer={(
                <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} />
                    <Button label={editing.mode === 'edit' ? 'Save' : 'Create'} onPress={onSubmit} loading={submitting} />
                </View>
            )}
        >
            <PillFilter
                options={CREATE_TYPES.map((item) => ({ id: item.id, label: item.label }))}
                selectedId={form.type}
                onSelect={(id) => {
                    if (editing.mode === 'edit') {
                        return;
                    }

                    onChange((current) => ({ ...current, type: id as 'fund' | 'goal' }));
                }}
            />

            <FormField
                label="Name"
                value={form.name}
                onChangeText={(value) => onChange((current) => ({ ...current, name: value }))}
                placeholder={form.type === 'fund' ? 'Bills reserve' : 'New laptop'}
                error={errors.name}
            />
            <FormField
                label="Target amount"
                keyboardType="decimal-pad"
                value={form.target}
                onChangeText={onChangeTarget}
                placeholder="0.00"
                error={errors.target}
            />

            {form.type === 'goal' ? (
                <>
                    <FormField
                        label="Deadline"
                        value={form.deadline}
                        onChangeText={onChangeDeadline}
                        placeholder="YYYY-MM-DD"
                        autoCapitalize="none"
                        keyboardType="number-pad"
                        maxLength={10}
                        error={errors.deadline}
                    />
                    <View style={styles.switchRow}>
                        <View style={styles.switchCopy}>
                            <Text style={styles.switchTitle}>Emergency fund</Text>
                            <Text style={styles.switchDescription}>Marks the goal as a safety buffer.</Text>
                        </View>
                        <Switch
                            value={form.isEmergency}
                            onValueChange={(value) => onChange((current) => ({ ...current, isEmergency: value }))}
                            thumbColor={colors.surface}
                            trackColor={{ false: colors.border, true: colors.danger }}
                        />
                    </View>
                </>
            ) : null}
        </Modal>
    );
}

const styles = StyleSheet.create({
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
    },
    switchCopy: {
        flex: 1,
        gap: 2,
    },
    switchTitle: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    switchDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
    },
});
