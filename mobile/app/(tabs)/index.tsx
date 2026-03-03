import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { ActionGroup, Card, EmptyState, FAB, ListRow, LoadingState, MetricCard, Screen, ScreenContent, ScreenHeader, ScreenSection, SectionHeader } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { useAuth } from '../../src/hooks/useAuth';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [nextTask, setNextTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [historyData, tasksData] = await Promise.all([
        dataService.fetchUnifiedHistory(5),
        dataService.fetchTasks()
      ]);
      setHistory(historyData || []);

      const incompleteTask = tasksData.find((t: any) => !t.completed);
      setNextTask(incompleteTask || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Dashboard data could not be loaded.');
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
    <Screen>
      <ScreenHeader
        eyebrow="Overview"
        title={`${getTimeGreeting()}, ${user?.email?.split('@')[0] || 'Friend'}`}
        subtitle={format(new Date(), 'EEEE, MMMM do')}
      />
      <ScreenContent>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenSection style={styles.metricsSection}>
          <View style={styles.metricGrid}>
            <MetricCard icon="time-outline" label="Recent entries" value={`${history.length}`} tone="secondary" style={styles.metric} />
            <MetricCard icon="checkbox-outline" label="Open tasks" value={nextTask ? '1' : '0'} tone="primary" style={styles.metric} />
          </View>
        </ScreenSection>

        <ScreenSection>
          <SectionHeader title="Your Focus" />
          {loading ? (
            <LoadingState title="Loading focus" description="Finding the next thing that deserves your attention." />
          ) : error ? (
            <Card variant="outline" style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>{error}</Text>
            </Card>
          ) : nextTask ? (
            <Card variant="outline">
              <ListRow
                icon="star"
                title={nextTask.title}
                subtitle="Next on your list"
                meta={nextTask.due_date ? format(new Date(nextTask.due_date), 'MMM d') : undefined}
                trailing={<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
              />
            </Card>
          ) : (
            <EmptyState title="All caught up" description="Your task list is clear. Use the downtime well." iconName="sparkles-outline" />
          )}
        </ScreenSection>

        <ScreenSection>
          <SectionHeader title="Recent Activity" />
          {loading ? (
            <LoadingState title="Loading timeline" description="Assembling your latest activity across the app." />
          ) : history.length > 0 ? (
            <Card variant="outline">
              {history.map((item, index) => (
                <View key={item.id || index}>
                  <ListRow
                    icon="ellipse"
                    iconColor={item.color || colors.secondary}
                    iconBackground={colors.surfaceLayered}
                    title={item.activity_name || item.description || 'Activity logged'}
                    meta={format(new Date(item.timestamp || item.created_at), 'h:mm a')}
                  />
                  {index < history.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </Card>
          ) : (
            <EmptyState title="No recent activity" description="Log something in any tab and it will appear here." iconName="time-outline" />
          )}
        </ScreenSection>

        <ScreenSection>
          <SectionHeader title="Quick Actions" />
          <ActionGroup
            actions={[
              { id: 'task', label: 'Add Task', icon: 'checkbox-outline', onPress: () => console.log('Add task pressed') },
              { id: 'journal', label: 'Daily Journal', icon: 'book-outline', tint: colors.secondary, background: colors.secondaryLight, onPress: () => console.log('New journal entry pressed') },
              { id: 'finance', label: 'Log Cash', icon: 'wallet-outline', tint: colors.warning, background: colors.warningLight, onPress: () => console.log('Add transaction pressed') },
            ]}
          />
        </ScreenSection>
      </ScrollView>
      </ScreenContent>

      <FAB iconName="add" onPress={() => console.log('Quick add pressed')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  metricsSection: {
    marginTop: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 56,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  feedbackText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
});
