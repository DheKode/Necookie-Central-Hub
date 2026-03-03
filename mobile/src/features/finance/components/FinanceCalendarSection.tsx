import React from 'react';
import { addMonths, format, isSameDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, SectionHeader } from '../../../../components/ui';
import { colors, radius, spacing, typography } from '../../../../theme';
import { currency, toAmount } from '../utils';
import type { DaySummary } from '../types';

type Props = {
    calendarMonth: Date;
    setCalendarMonth: React.Dispatch<React.SetStateAction<Date>>;
    selectedDate: Date;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
    daysInMonth: Date[];
    blankDays: null[];
    dailyMap: Record<string, DaySummary>;
    selectedDay?: DaySummary;
};

export function FinanceCalendarSection({
    calendarMonth,
    setCalendarMonth,
    selectedDate,
    setSelectedDate,
    daysInMonth,
    blankDays,
    dailyMap,
    selectedDay,
}: Props) {
    return (
        <View style={styles.sectionStack}>
            <Card variant="outline">
                <View style={styles.header}>
                    <Text style={styles.title}>{format(calendarMonth, 'MMMM yyyy')}</Text>
                    <View style={styles.actions}>
                        <IconButton icon="chevron-back" onPress={() => setCalendarMonth((current) => addMonths(current, -1))} />
                        <IconButton icon="chevron-forward" onPress={() => setCalendarMonth((current) => addMonths(current, 1))} />
                    </View>
                </View>

                <View style={styles.weekdays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>
                    ))}
                </View>

                <View style={styles.grid}>
                    {blankDays.map((_, index) => (
                        <View key={`blank-${index}`} style={styles.blank} />
                    ))}
                    {daysInMonth.map((day) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const dayData = dailyMap[key];
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const net = (dayData?.income ?? 0) - (dayData?.expense ?? 0);

                        return (
                            <TouchableOpacity
                                key={key}
                                style={[styles.day, isSelected && styles.daySelected]}
                                onPress={() => setSelectedDate(day)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.dayText, isToday && styles.dayToday]}>{format(day, 'd')}</Text>
                                <View style={styles.dots}>
                                    {dayData?.income ? <View style={[styles.dot, { backgroundColor: colors.success }]} /> : null}
                                    {dayData?.expense ? <View style={[styles.dot, { backgroundColor: colors.danger }]} /> : null}
                                </View>
                                {dayData ? (
                                    <Text style={[styles.net, { color: net >= 0 ? colors.success : colors.danger }]}>
                                        {net >= 0 ? '+' : '-'}{Math.abs(Math.round(net))}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Card>

            <Card variant="outline">
                <SectionHeader title={`Activity for ${format(selectedDate, 'MMMM d')}`} />
                {!selectedDay?.transactions.length ? (
                    <Text style={styles.emptyText}>No transactions recorded for this date.</Text>
                ) : (
                    <View style={styles.transactionList}>
                        {selectedDay.transactions.map((item) => (
                            <View key={`day-${item.id}`} style={styles.transactionRow}>
                                <View style={styles.transactionInfo}>
                                    <View style={[styles.accent, { backgroundColor: item.type === 'income' ? colors.success : colors.danger }]} />
                                    <View>
                                        <Text style={styles.description}>{item.description || item.category}</Text>
                                        <Text style={styles.caption}>{item.category}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.textPrimary }]}>
                                    {item.type === 'income' ? '+' : '-'}{currency(toAmount(item.amount))}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );
}

function IconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.iconButton} onPress={onPress}>
            <Ionicons name={icon} size={18} color={colors.textPrimary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    sectionStack: { gap: spacing.md },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceLayered,
    },
    weekdays: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    weekday: {
        flex: 1,
        textAlign: 'center',
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    blank: {
        width: '13%',
    },
    day: {
        width: '13%',
        minHeight: 74,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: spacing.xs,
        justifyContent: 'space-between',
    },
    daySelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    dayText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.bold,
    },
    dayToday: {
        color: colors.primary,
    },
    dots: {
        flexDirection: 'row',
        gap: 3,
        alignSelf: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: radius.pill,
    },
    net: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: typography.weights.bold,
    },
    emptyText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    transactionList: {
        gap: spacing.sm,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    transactionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    accent: {
        width: 4,
        alignSelf: 'stretch',
        borderRadius: radius.pill,
    },
    description: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    caption: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    amount: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
    },
});
