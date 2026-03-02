import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface Option {
    id: string;
    label: string;
}

interface PillFilterProps {
    options: Option[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function PillFilter({ options, selectedId, onSelect }: PillFilterProps) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {options.map((option) => {
                    const isSelected = option.id === selectedId;
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.pill,
                                isSelected ? styles.pillSelected : styles.pillUnselected
                            ]}
                            onPress={() => onSelect(option.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.text,
                                isSelected ? styles.textSelected : styles.textUnselected
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        // Allows background bleed if needed
    },
    container: {
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    pill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    pillSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pillUnselected: {
        backgroundColor: colors.surface,
        borderColor: colors.borderLight,
    },
    text: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    textSelected: {
        color: colors.surface,
    },
    textUnselected: {
        color: colors.textSecondary,
    },
});
