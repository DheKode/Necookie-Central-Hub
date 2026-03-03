import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';
import { Card } from './Card';

type LoadingStateProps = {
    title?: string;
    description?: string;
};

type ErrorStateProps = {
    title?: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
};

export function LoadingState({
    title = 'Loading',
    description = 'Pulling in the latest data for this screen.',
}: LoadingStateProps) {
    return (
        <Card variant="outline" style={styles.card}>
            <ActivityIndicator size="small" color={colors.primary} />
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </Card>
    );
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'Try refreshing the screen or come back in a moment.',
    actionLabel = 'Try again',
    onActionPress,
}: ErrorStateProps) {
    return (
        <Card variant="outline" style={[styles.card, styles.errorCard]}>
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            {onActionPress ? <Button label={actionLabel} variant="secondary" onPress={onActionPress} /> : null}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
    },
    errorCard: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight,
    },
    copy: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 260,
    },
});
