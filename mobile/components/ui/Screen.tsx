import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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
            <View pointerEvents="none" style={styles.backgroundGlowTop} />
            <View pointerEvents="none" style={styles.backgroundGlowBottom} />
            {children}
        </SafeAreaView>
    );
}

export function ScreenHeader({ eyebrow, title, subtitle, right }: ScreenHeaderProps) {
    const { width } = useWindowDimensions();

    return (
        <Animated.View entering={FadeInDown.duration(350)} style={[styles.header, width < 380 && styles.headerCompact]}>
            <View style={styles.headerCopy}>
                {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
                <Text style={[styles.title, width < 380 && styles.titleCompact]}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right ? <View style={styles.headerRight}>{right}</View> : null}
        </Animated.View>
    );
}

export function ScreenContent({ children, style }: ScreenContentProps) {
    return <View style={[styles.content, style]}>{children}</View>;
}

export function ScreenSection({ children, style }: ScreenSectionProps) {
    return <Animated.View entering={FadeIn.duration(280)} style={[styles.section, style]}>{children}</Animated.View>;
}

export const screenLayout = StyleSheet.create({
    scrollContent: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl + 32,
        gap: spacing.lg,
    },
    listContent: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl + 32,
        gap: spacing.md,
    },
    cardStack: {
        gap: spacing.sm,
    },
    dividerInset: {
        marginLeft: 56,
    },
});

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    backgroundGlowTop: {
        position: 'absolute',
        top: -72,
        right: -32,
        width: 220,
        height: 220,
        borderRadius: 999,
        backgroundColor: colors.primaryLight,
        opacity: 0.72,
    },
    backgroundGlowBottom: {
        position: 'absolute',
        bottom: 64,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 999,
        backgroundColor: colors.secondaryLight,
        opacity: 0.48,
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
    headerCompact: {
        paddingHorizontal: spacing.md,
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
    titleCompact: {
        fontSize: typography.sizes.xl,
        lineHeight: typography.lineHeights.xl,
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
        gap: spacing.sm,
    },
});
