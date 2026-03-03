import React from 'react';
import { EmptyState, Screen, ScreenContent, ScreenHeader } from '../../components/ui';

export default function TabTwoScreen() {
  return (
    <Screen>
      <ScreenHeader eyebrow="Journal" title="Journal" subtitle="Your journal entries will appear here." />
      <ScreenContent>
        <EmptyState
          iconName="book-outline"
          title="Journal"
          description="Your journal entries will appear here."
          actionLabel="Write an entry"
          onActionPress={() => { }}
        />
      </ScreenContent>
    </Screen>
  );
}
