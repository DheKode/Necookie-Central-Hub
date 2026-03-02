import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, SectionHeader, Button } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Today" actionLabel="See all" />
      <Card style={styles.card}>
        <Button label="Quick Track Mood" variant="primary" />
        <View style={styles.spacer} />
        <Button label="Log Expense" variant="secondary" />
      </Card>

      <SectionHeader title="Active Tasks" />
      <Card variant="flat" style={styles.card}>
        <Button label="Buy Groceries" variant="ghost" />
        <Button label="Reply to Emails" variant="ghost" />
      </Card>

      <SectionHeader title="Recent Activity" />
      <Card variant="outline" style={styles.card}>
        <Button label="Nothing recently..." variant="ghost" disabled />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  spacer: {
    height: spacing.md,
  },
});
