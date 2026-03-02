import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    TouchableOpacityProps,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function Button({
    label,
    variant = 'primary',
    size = 'md',
    loading = false,
    style,
    disabled,
    ...rest
}: ButtonProps) {

    const getContainerStyle = (): ViewStyle => {
        let baseStyle: ViewStyle = {};

        switch (variant) {
            case 'primary':
                baseStyle = { backgroundColor: colors.buttonPrimaryBg };
                break;
            case 'secondary':
                baseStyle = {
                    backgroundColor: colors.buttonSecondaryBg,
                    borderWidth: 1,
                    borderColor: colors.buttonSecondaryBorder
                };
                break;
            case 'danger':
                baseStyle = { backgroundColor: colors.danger, borderWidth: 0 };
                break;
            case 'ghost':
                baseStyle = { backgroundColor: 'transparent', borderWidth: 0 };
                break;
        }

        if (disabled) {
            baseStyle.opacity = 0.5;
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'primary':
            case 'danger':
                return { color: colors.buttonPrimaryText };
            case 'secondary':
            case 'ghost':
                return { color: colors.buttonSecondaryText };
        }
    };

    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm };
            case 'md': return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md };
            case 'lg': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderRadius: radius.lg };
        }
    };

    return (
        <TouchableOpacity
            style={[styles.base, getSizeStyle(), getContainerStyle(), style]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={getTextStyle().color} />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontWeight: typography.weights.medium,
        fontSize: typography.sizes.md,
    },
});
