import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Card, SectionHeader, FAB } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { useAuth } from '../../src/hooks/useAuth';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [nextTask, setNextTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [historyData, tasksData] = await Promise.all([
        dataService.fetchUnifiedHistory(5),
        dataService.fetchTasks()
      ]);
      setHistory(historyData || []);

      const incompleteTask = tasksData.find((t: any) => !t.completed);
      setNextTask(incompleteTask || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getTimeGreeting()}, {user?.email?.split('@')[0] || 'Friend'}</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM do')}</Text>
        </View>

        <SectionHeader title="Your Focus" />
        {nextTask ? (
          <Card style={styles.taskCard}>
            <View style={styles.taskIcon}>
              <Ionicons name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{nextTask.title}</Text>
              <Text style={styles.taskSubtitle}>Next on your list</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>All caught up! Time to relax?</Text>
          </Card>
        )}

        <SectionHeader title="Recent Activity" />
        <View style={styles.historyList}>
          {history.length > 0 ? (
            history.map((item, index) => (
              <View key={item.id || index} style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: item.color || colors.secondaryLight }]} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>{item.activity_name || item.description || 'Activity logged'}</Text>
                  <Text style={styles.historyTime}>{format(new Date(item.timestamp || item.created_at), 'h:mm a')}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistory}>No recent activity yet.</Text>
          )}
        </View>

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8EFEA' }]}>
              <Ionicons name="checkbox-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#E6EDF2' }]}>
              <Ionicons name="book-outline" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>Daily Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: '#FDF5EC' }]}>
              <Ionicons name="wallet-outline" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Log Cash</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FAB iconName="add" onPress={() => console.log('Quick add pressed')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  date: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  taskSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  historyList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.soft,
    marginBottom: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  historyTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  emptyHistory: {
    textAlign: 'center',
    color: colors.textTertiary,
    paddingVertical: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
