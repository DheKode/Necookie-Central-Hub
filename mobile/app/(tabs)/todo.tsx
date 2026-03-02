import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Card, SectionHeader, FAB, PillFilter, EmptyState } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export default function TodoScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const fetchData = async () => {
        try {
            const [tasksData, projectsData] = await Promise.all([
                dataService.fetchTasks(),
                dataService.fetchProjects()
            ]);
            setTasks(tasksData || []);
            setProjects(projectsData || []);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            Alert.alert('Error', 'Failed to load tasks');
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
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <PillFilter
                    options={[
                        { id: 'All', label: 'All' },
                        { id: 'Pending', label: 'Pending' },
                        { id: 'Completed', label: 'Completed' },
                    ]}
                    selectedId={selectedFilter}
                    onSelect={setSelectedFilter}
                />
            </View>

            <FlatList
                data={filteredTasks}
                renderItem={renderTask}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <EmptyState
                            iconName="checkmark-circle-outline"
                            title={selectedFilter === 'All' ? "All clear" : "Nothing here"}
                            description={selectedFilter === 'All' ? "You've finished everything on your plate. Enjoy the peace!" : `You have no ${selectedFilter.toLowerCase()} tasks.`}
                        />
                    ) : null
                }
            />

            <FAB iconName="add" onPress={() => console.log('Add task pressed')} accessibilityLabel="Add robust task" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filterContainer: {
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl,
    },
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
