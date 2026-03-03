import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card, EmptyState, ErrorState, ListRow, LoadingState, Screen, ScreenContent, ScreenHeader, SectionHeader, screenLayout } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import { format, isSameDay } from 'date-fns';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const data = await dataService.fetchUnifiedHistory(50);
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('History could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useRefreshOnFocus(() => {
        fetchData();
    });

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

    const renderHistoryItem = (item: any) => {
        const isExercise = item.category === 'fitness';
        const isMeal = !!item.calories;
        const isTask = !!item.priority;

        let icon: 'document-text-outline' | 'fitness-outline' | 'nutrition-outline' | 'checkbox-outline' = 'document-text-outline';
        let color = colors.secondary;

        if (isExercise) { icon = "fitness-outline"; color = colors.primary; }
        if (isMeal) { icon = "nutrition-outline"; color = colors.warning; }
        if (isTask) { icon = "checkbox-outline"; color = colors.primary; }

        return (
            <ListRow
                icon={icon}
                iconColor={color}
                iconBackground={color + '15'}
                title={item.activity_name || item.title || item.description || 'Activity'}
                meta={format(new Date(item.timestamp || item.created_at), 'h:mm a')}
            />
        );
    };

    return (
        <Screen>
            <ScreenHeader
                eyebrow="History"
                title="Activity timeline"
                subtitle="A single running record of the moments logged across the app."
            />
            <ScreenContent>
            <FlatList
                data={groupedData}
                keyExtractor={item => item.title}
                contentContainerStyle={screenLayout.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                renderItem={({ item }) => (
                    <View style={styles.groupContainer}>
                        <SectionHeader eyebrow="Day" title={item.title} />
                        <Card style={styles.groupCard}>
                            {item.data.map((historyItem, index) => (
                                <React.Fragment key={historyItem.id || index}>
                                    {renderHistoryItem(historyItem)}
                                    {index < item.data.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </Card>
                    </View>
                )}
                ListEmptyComponent={
                    loading ? (
                        <LoadingState title="Loading history" description="Building your latest cross-app timeline." />
                    ) : error ? (
                        <ErrorState description={error} onActionPress={fetchData} />
                    ) : (
                        <EmptyState
                            iconName="time-outline"
                            title="A quiet day"
                            description="Your activity timeline is waiting for its first moment."
                        />
                    )
                }
            />
            </ScreenContent>
        </Screen>
    );
}

const styles = StyleSheet.create({
    groupContainer: {
        marginBottom: spacing.md,
    },
    groupCard: {
        padding: 0,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginLeft: 56,
    },
});
