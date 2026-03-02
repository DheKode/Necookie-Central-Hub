import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Card, SectionHeader, EmptyState } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { format, isSameDay } from 'date-fns';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const data = await dataService.fetchUnifiedHistory(50);
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
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

    const groupHistoryByDate = () => {
        const groups: { title: string, data: any[] }[] = [];
        history.forEach(item => {
            const date = new Date(item.timestamp || item.created_at);
            let title = format(date, 'MMMM do, yyyy');
            if (isSameDay(date, new Date())) title = 'Today';

            const existingGroup = groups.find(g => g.title === title);
            if (existingGroup) {
                existingGroup.data.push(item);
            } else {
                groups.push({ title, data: [item] });
            }
        });
        return groups;
    };

    const groupedData = groupHistoryByDate();

    const renderItem = ({ item }: { item: any }) => {
        const isExercise = item.category === 'fitness';
        const isMeal = !!item.calories;
        const isTask = !!item.priority;

        let icon = "document-text-outline";
        let color = colors.secondary;

        if (isExercise) { icon = "fitness-outline"; color = colors.primary; }
        if (isMeal) { icon = "nutrition-outline"; color = colors.warning; }
        if (isTask) { icon = "checkbox-outline"; color = colors.primary; }

        return (
            <View style={styles.historyItem}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.activityName}>{item.activity_name || item.title || item.description || 'Activity'}</Text>
                    <Text style={styles.timestamp}>{format(new Date(item.timestamp || item.created_at), 'h:mm a')}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={groupedData}
                keyExtractor={item => item.title}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                renderItem={({ item }) => (
                    <View style={styles.groupContainer}>
                        <SectionHeader title={item.title} />
                        <Card style={styles.groupCard}>
                            {item.data.map((historyItem, index) => (
                                <React.Fragment key={historyItem.id || index}>
                                    {renderItem({ item: historyItem })}
                                    {index < item.data.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </Card>
                    </View>
                )}
                ListEmptyComponent={
                    !loading ? (
                        <EmptyState
                            iconName="time-outline"
                            title="No history yet"
                            description="Your activities will appear here once you start using the hub."
                        />
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    groupContainer: {
        marginBottom: spacing.md,
    },
    groupCard: {
        padding: 0,
        overflow: 'hidden',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityName: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textPrimary,
    },
    timestamp: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginLeft: spacing.xxxl,
    },
});
