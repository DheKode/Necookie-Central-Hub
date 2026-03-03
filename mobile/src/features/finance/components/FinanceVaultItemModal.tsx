import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, FormField, Modal, PillFilter } from '../../../../components/ui';
import { colors, spacing, typography } from '../../../../theme';
import { CREATE_TYPES } from '../constants';
import type { VaultEditingState, VaultFormState } from '../types';

type Props = {
    visible: boolean;
    form: VaultFormState;
    editing: VaultEditingState;
    submitting: boolean;
    onClose: () => void;
    onChange: (updater: (current: VaultFormState) => VaultFormState) => void;
    onSubmit: () => void;
};

export function FinanceVaultItemModal({ visible, form, editing, submitting, onClose, onChange, onSubmit }: Props) {
    return (
        <Modal visible={visible} onClose={onClose}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{editing.mode === 'edit' ? 'Edit vault item' : 'Create vault item'}</Text>
                <Text style={styles.subtitle}>
                    {editing.mode === 'edit'
                        ? 'Update the details for this fund or goal.'
                        : 'Start with funds and goals first; transfer mechanics can layer in after this.'}
                </Text>

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

                <FormField label="Name" value={form.name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} placeholder={form.type === 'fund' ? 'Bills reserve' : 'New laptop'} />
                <FormField label="Target amount" keyboardType="decimal-pad" value={form.target} onChangeText={(value) => onChange((current) => ({ ...current, target: value }))} placeholder="0.00" />

                {form.type === 'goal' ? (
                    <>
                        <FormField label="Deadline" value={form.deadline} onChangeText={(value) => onChange((current) => ({ ...current, deadline: value }))} placeholder="YYYY-MM-DD" autoCapitalize="none" />
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

                <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} />
                    <Button label={editing.mode === 'edit' ? 'Save' : 'Create'} onPress={onSubmit} loading={submitting} />
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
        marginTop: spacing.sm,
    },
});
