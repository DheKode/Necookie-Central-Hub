import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps, useWindowDimensions } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface FABProps extends TouchableOpacityProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    color?: string;
}

export function FAB({ iconName = 'add', color = colors.buttonPrimaryText, style, ...rest }: FABProps) {
    const { width } = useWindowDimensions();
    const compact = width < 380;

    return (
        <Animated.View entering={FadeInUp.duration(320)} style={styles.wrapper}>
            <TouchableOpacity
                style={[styles.container, compact && styles.containerCompact, style]}
                activeOpacity={0.7}
                accessibilityRole="button"
                {...rest}
            >
                <Ionicons name={iconName} size={compact ? 22 : 24} color={color} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        right: spacing.xl,
        bottom: spacing.xl,
    },
    container: {
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        backgroundColor: colors.buttonPrimaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.floating,
    },
    containerCompact: {
        width: 58,
        height: 58,
    },
});
