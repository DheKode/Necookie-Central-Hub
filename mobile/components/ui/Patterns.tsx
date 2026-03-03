import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from './Card';

type ListRowProps = {
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBackground?: string;
    title: string;
    subtitle?: string;
    meta?: string;
    value?: string;
    tone?: 'default' | 'success' | 'danger';
    onPress?: () => void;
    trailing?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

type MetricCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    style?: StyleProp<ViewStyle>;
};

type ActionGroupProps = {
    actions: Array<{
        id: string;
        label: string;
        icon: keyof typeof Ionicons.glyphMap;
        tint?: string;
        background?: string;
        onPress: () => void;
    }>;
    style?: StyleProp<ViewStyle>;
};

const toneMap = {
    primary: { color: colors.primary, background: colors.primaryLight },
    secondary: { color: colors.secondary, background: colors.secondaryLight },
    success: { color: colors.success, background: colors.primaryLight },
    warning: { color: colors.warning, background: colors.warningLight },
    danger: { color: colors.danger, background: colors.dangerLight },
} as const;

export function ListRow({
    icon,
    iconColor = colors.primary,
    iconBackground = colors.primaryLight,
    title,
    subtitle,
    meta,
    value,
    tone = 'default',
    onPress,
    trailing,
    style,
}: ListRowProps) {
    const content = (
        <View style={[styles.row, style]}>
            {icon ? (
                <View style={[styles.rowIcon, { backgroundColor: iconBackground }]}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
            ) : null}
            <View style={styles.rowCopy}>
                <View style={styles.rowTitleLine}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
                </View>
                {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
            </View>
            {value ? <Text style={[styles.rowValue, tone === 'success' && styles.successValue, tone === 'danger' && styles.dangerValue]}>{value}</Text> : null}
            {trailing}
        </View>
    );

    if (!onPress) {
        return content;
    }

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            {content}
        </TouchableOpacity>
    );
}

export function MetricCard({ icon, label, value, tone = 'primary', style }: MetricCardProps) {
    const toneColors = toneMap[tone];

    return (
        <Card variant="outline" style={[styles.metricCard, style]}>
            <View style={[styles.metricIcon, { backgroundColor: toneColors.background }]}>
                <Ionicons name={icon} size={18} color={toneColors.color} />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </Card>
    );
}

export function ActionGroup({ actions, style }: ActionGroupProps) {
    return (
        <Card variant="outline" style={[styles.actionCard, style]}>
            <View style={styles.actionOverlay}>
                {actions.map((action) => (
                    <TouchableOpacity key={action.id} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.85}>
                        <View style={[styles.actionIcon, { backgroundColor: action.background ?? colors.primaryLight }]}>
                            <Ionicons name={action.icon} size={20} color={action.tint ?? colors.primary} />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowCopy: {
        flex: 1,
        gap: 2,
    },
    rowTitleLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },
    rowTitle: {
        flex: 1,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    rowMeta: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    rowSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    rowValue: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    successValue: {
        color: colors.success,
    },
    dangerValue: {
        color: colors.danger,
    },
    metricCard: {
        gap: spacing.sm,
    },
    metricIcon: {
        width: 34,
        height: 34,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricLabel: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
        letterSpacing: 0.8,
    },
    metricValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    actionCard: {
        padding: spacing.md,
    },
    actionOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    actionItem: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: typography.sizes.xs,
        lineHeight: typography.lineHeights.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
});
