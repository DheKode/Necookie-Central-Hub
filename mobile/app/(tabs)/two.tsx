import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/ui';
import { colors } from '../../theme';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        iconName="book-outline"
        title="Journal"
        description="Your journal entries will appear here."
        actionLabel="Write an entry"
        onActionPress={() => { }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
