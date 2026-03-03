import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

type ScreenProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

type ScreenHeaderProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
};

type ScreenContentProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

type ScreenSectionProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: ScreenProps) {
    return (
        <SafeAreaView edges={['top']} style={[styles.screen, style]}>
            {children}
        </SafeAreaView>
    );
}

export function ScreenHeader({ eyebrow, title, subtitle, right }: ScreenHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerCopy}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
    );
}

export function ScreenContent({ children, style }: ScreenContentProps) {
    return <View style={[styles.content, style]}>{children}</View>;
}

export function ScreenSection({ children, style }: ScreenSectionProps) {
    return <View style={[styles.section, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    headerCopy: {
        flex: 1,
        gap: spacing.xs,
    },
    eyebrow: {
        fontSize: typography.sizes.xs,
        lineHeight: typography.lineHeights.xs,
        fontWeight: typography.weights.bold,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: typography.sizes.xxl,
        lineHeight: typography.lineHeights.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
        color: colors.textSecondary,
    },
    headerRight: {
        alignSelf: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    section: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
});
