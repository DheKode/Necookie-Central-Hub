import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, radius, shadows } from '../../theme';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'elevated' | 'flat' | 'outline';
}

export function Card({ children, style, variant = 'elevated', ...rest }: CardProps) {
    return (
        <Animated.View
            entering={FadeInDown.duration(260)}
            style={[
                styles.base,
                variant === 'elevated' && styles.elevated,
                variant === 'flat' && styles.flat,
                variant === 'outline' && styles.outline,
                style
            ]}
            {...rest}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.lg,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(234, 230, 223, 0.7)',
    },
    elevated: {
        ...shadows.medium,
    },
    flat: {
        backgroundColor: colors.surfaceLayered,
    },
    outline: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
});
