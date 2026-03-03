import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../theme';
import { ActionGroup, Button, Card, EmptyState, ErrorState, FAB, ListRow, LoadingState, MetricCard, Screen, ScreenContent, ScreenHeader, ScreenSection, SectionHeader, screenLayout } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { useAuth } from '../../src/hooks/useAuth';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
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

  useRefreshOnFocus(() => {
    fetchData();
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'You will need to sign in again before you can access synced data on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
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
        right={<Button label="Sign out" variant="ghost" size="sm" onPress={handleSignOut} />}
      />
      <ScreenContent>
        <ScrollView
            contentContainerStyle={screenLayout.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            showsVerticalScrollIndicator={false}
        >
            <ScreenSection>
                <View style={styles.metricGrid}>
                    <MetricCard icon="time-outline" label="Recent entries" value={`${history.length}`} tone="secondary" style={styles.metric} />
                    <MetricCard icon="checkbox-outline" label="Open tasks" value={nextTask ? '1' : '0'} tone="primary" style={styles.metric} />
                </View>
            </ScreenSection>

            <ScreenSection>
                <SectionHeader
                    eyebrow="Priority"
                    title="Your focus"
                    description="Keep the next useful step visible without leaving the dashboard."
                />
                {loading ? (
                    <LoadingState title="Loading focus" description="Finding the next thing that deserves your attention." />
                ) : error ? (
                    <ErrorState description={error} onActionPress={fetchData} />
                ) : nextTask ? (
                    <Card variant="outline">
                        <ListRow
                            icon="star"
                            title={nextTask.title}
                            subtitle="Next on your list"
                            meta={nextTask.due_date ? format(new Date(nextTask.due_date), 'MMM d') : undefined}
                            trailing={<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
                            onPress={() => router.push('/todo')}
                        />
                    </Card>
                ) : (
                    <EmptyState title="All caught up" description="Your task list is clear. Use the downtime well." iconName="sparkles-outline" />
                )}
            </ScreenSection>

            <ScreenSection>
                <SectionHeader
                    eyebrow="Timeline"
                    title="Recent activity"
                    description="A compact read on the latest movement across the app."
                />
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
                <SectionHeader
                    eyebrow="Shortcuts"
                    title="Quick actions"
                    description="Use the same launch points no matter which module you came from."
                />
                <ActionGroup
                    actions={[
                        { id: 'task', label: 'Open Tasks', description: 'Capture work', icon: 'checkbox-outline', onPress: () => router.push('/todo') },
                        { id: 'journal', label: 'Write Journal', description: 'Reflect fast', icon: 'book-outline', tint: colors.secondary, background: colors.secondaryLight, onPress: () => router.push('/journal') },
                        { id: 'finance', label: 'Finance Hub', description: 'Track money', icon: 'wallet-outline', tint: colors.warning, background: colors.warningLight, onPress: () => router.push('/finance') },
                    ]}
                />
            </ScreenSection>
        </ScrollView>
      </ScreenContent>

      <FAB iconName="add" onPress={() => router.push('/todo')} accessibilityLabel="Open tasks" />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
