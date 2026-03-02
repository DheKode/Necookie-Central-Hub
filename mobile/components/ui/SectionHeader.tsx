import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {actionLabel && onActionPress && (
                <TouchableOpacity onPress={onActionPress}>
                    <Text style={styles.action}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    action: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.primary,
    },
});
