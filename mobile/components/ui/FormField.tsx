import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface FormFieldProps extends TextInputProps {
    label: string;
    error?: string;
}

export function FormField({ label, error, style, ...rest }: FormFieldProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={colors.textTertiary}
                {...rest}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight,
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.danger,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
