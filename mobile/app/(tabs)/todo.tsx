import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card, ErrorState, FAB, PillFilter, EmptyState, LoadingState, Screen, ScreenContent, ScreenHeader, ScreenSection, SectionHeader, screenLayout } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export default function TodoScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const tasksData = await dataService.fetchTasks();
            setTasks(tasksData || []);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            setError('Failed to load tasks.');
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

    const handleToggleTask = async (task: any) => {
        try {
            if (!task.completed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            await dataService.toggleTask({ id: task.id, status: !task.completed });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        } catch (error) {
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Completed') return task.completed;
        if (selectedFilter === 'Pending') return !task.completed;
        return true;
    });

    const renderTask = ({ item }: { item: any }) => (
        <Card style={[styles.taskCard, item.completed && styles.taskCompleted]}>
            <TouchableOpacity
                style={styles.checkbox}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
                accessibilityLabel={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                onPress={() => handleToggleTask(item)}
            >
                <Ionicons
                    name={item.completed ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.completed ? colors.primary : colors.textTertiary}
                />
            </TouchableOpacity>
            <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.completed && styles.textStrikethrough]}>
                    {item.title}
                </Text>
                {item.due_date && (
                    <Text style={styles.taskDueDate}>
                        <Ionicons name="calendar-outline" size={12} /> {format(new Date(item.due_date), 'MMM d')}
                    </Text>
                )}
            </View>
            {item.priority === 'high' && (
                <View style={[styles.priorityBadge, { backgroundColor: colors.dangerLight }]}>
                    <Text style={[styles.priorityText, { color: colors.danger }]}>High</Text>
                </View>
            )}
        </Card>
    );

    return (
        <Screen>
            <ScreenHeader
                eyebrow="Tasks"
                title="Task flow"
                subtitle="Capture, filter, and clear work with the same rhythm as the rest of the app."
            />
            <ScreenContent>
            <FlatList
                data={filteredTasks}
                renderItem={renderTask}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={screenLayout.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <ScreenSection>
                        <SectionHeader
                            eyebrow="Filter"
                            title="Status"
                            description="Keep pending and completed work in the same list rhythm."
                        />
                        <PillFilter
                            options={[
                                { id: 'All', label: 'All' },
                                { id: 'Pending', label: 'Pending' },
                                { id: 'Completed', label: 'Completed' },
                            ]}
                            selectedId={selectedFilter}
                            onSelect={setSelectedFilter}
                        />
                    </ScreenSection>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    loading ? (
                        <LoadingState title="Loading tasks" description="Pulling your current task list into view." />
                    ) : error ? (
                        <ErrorState description={error} onActionPress={fetchData} />
                    ) : (
                        <EmptyState
                            iconName="checkmark-circle-outline"
                            title={selectedFilter === 'All' ? "All clear" : "Nothing here"}
                            description={selectedFilter === 'All' ? "You've finished everything on your plate. Enjoy the peace!" : `You have no ${selectedFilter.toLowerCase()} tasks.`}
                        />
                    )
                }
            />
            </ScreenContent>

            <FAB iconName="add" onPress={() => console.log('Add task pressed')} accessibilityLabel="Add robust task" />
        </Screen>
    );
}

const styles = StyleSheet.create({
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    taskCompleted: {
        opacity: 0.6,
    },
    checkbox: {
        marginRight: spacing.md,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        fontWeight: typography.weights.medium,
    },
    textStrikethrough: {
        textDecorationLine: 'line-through',
        color: colors.textTertiary,
    },
    taskDueDate: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        marginTop: 2,
    },
    priorityBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.sm,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: typography.weights.bold,
        textTransform: 'uppercase',
    },
});
