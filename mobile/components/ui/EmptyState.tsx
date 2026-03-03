import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography, spacing } from '../../theme';
import { Button } from './Button';
import { Card } from './Card';

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
        <Card variant="outline" style={styles.container}>
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
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    iconContainer: {
        backgroundColor: colors.primaryLight,
        width: 88,
        height: 88,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
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
