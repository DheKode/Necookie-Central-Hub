import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Card, SectionHeader, FAB, EmptyState } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { format } from 'date-fns';

export default function FinanceScreen() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const data = await dataService.fetchFinanceRecords();
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching finance records:', error);
            Alert.alert('Error', 'Failed to load finance data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const calculateMonthlySummary = () => {
        const now = new Date();
        const currentMonthRecords = records.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        return currentMonthRecords.reduce((acc, curr) => {
            if (curr.type === 'income') acc.income += curr.amount;
            else acc.expense += curr.amount;
            return acc;
        }, { income: 0, expense: 0 });
    };

    const summary = calculateMonthlySummary();

    const renderRecord = ({ item }: { item: any }) => (
        <Card style={styles.recordCard}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? '#E8EFEA' : '#F7E8E7' }]}>
                <Ionicons
                    name={item.type === 'income' ? "arrow-down-outline" : "arrow-up-outline"}
                    size={20}
                    color={item.type === 'income' ? colors.success : colors.danger}
                />
            </View>
            <View style={styles.recordInfo}>
                <Text style={styles.recordDesc}>{item.description || item.category}</Text>
                <Text style={styles.recordDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
            </View>
            <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.textPrimary }]}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
            </Text>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.summaryContainer}>
                <Card style={styles.summaryCard}>
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, { color: colors.success }]}>${summary.income.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={styles.summaryValue}>${summary.expense.toLocaleString()}</Text>
                    </View>
                </Card>
            </View>

            <SectionHeader title="Recent Transactions" />
            <FlatList
                data={records}
                renderItem={renderRecord}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <EmptyState
                            iconName="wallet-outline"
                            title="No transactions"
                            description="Keep track of your spending and income here."
                            actionLabel="Add transaction"
                            onActionPress={() => console.log('Add transaction pressed')}
                        />
                    ) : null
                }
            />

            <FAB iconName="add" onPress={() => console.log('Add transaction pressed')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    summaryContainer: {
        padding: spacing.md,
    },
    summaryCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    summaryColumn: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: typography.weights.medium,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.borderLight,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    recordInfo: {
        flex: 1,
    },
    recordDesc: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    recordDate: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        marginTop: 2,
    },
    amount: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
    },
});
