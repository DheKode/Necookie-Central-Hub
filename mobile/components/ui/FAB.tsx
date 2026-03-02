import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface FABProps extends TouchableOpacityProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    color?: string;
}

export function FAB({ iconName = 'add', color = colors.buttonPrimaryText, style, ...rest }: FABProps) {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            activeOpacity={0.8}
            {...rest}
        >
            <Ionicons name={iconName} size={24} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        backgroundColor: colors.buttonPrimaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.floating,
    },
});
