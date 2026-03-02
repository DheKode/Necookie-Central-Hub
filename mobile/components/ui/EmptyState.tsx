import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export function EmptyState({
    iconName,
    title,
    description,
    actionLabel,
    onActionPress
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            {iconName && (
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={48} color={colors.primary} />
                </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {actionLabel && onActionPress && (
                <Button
                    variant="primary"
                    label={actionLabel}
                    onPress={onActionPress}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        backgroundColor: colors.primaryLight,
        padding: spacing.lg,
        borderRadius: 9999,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: typography.lineHeights.md,
    },
    button: {
        minWidth: 160,
    }
});
