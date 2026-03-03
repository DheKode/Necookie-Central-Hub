import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export function SectionHeader({ eyebrow, title, description, actionLabel, onActionPress }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.copy}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                <Text style={styles.title}>{title}</Text>
                {description ? <Text style={styles.description}>{description}</Text> : null}
            </View>
            {actionLabel && onActionPress ? (
                <TouchableOpacity style={styles.actionButton} onPress={onActionPress} activeOpacity={0.8}>
                    <Text style={styles.action}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    copy: {
        flex: 1,
        gap: spacing.xs,
    },
    eyebrow: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    description: {
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
        color: colors.textSecondary,
    },
    actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    action: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.primary,
    },
});
