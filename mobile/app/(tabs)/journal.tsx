import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card, EmptyState, FAB, LoadingState, Modal, PillFilter, Screen, ScreenContent, ScreenHeader, ScreenSection, SectionHeader } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

const MOODS = [
    { id: 'happy', label: 'Bright' },
    { id: 'calm', label: 'Calm' },
    { id: 'focused', label: 'Focused' },
    { id: 'tired', label: 'Tired' },
    { id: 'stressed', label: 'Stressed' },
];

export default function JournalScreen() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMood, setSelectedMood] = useState('calm');
    const [newEntry, setNewEntry] = useState('');
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const data = await dataService.fetchJournal();
            setEntries(data || []);
        } catch (fetchError) {
            console.error('Error fetching journal:', fetchError);
            setError('Journal entries could not be loaded.');
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

    const handleAddEntry = async () => {
        if (!newEntry.trim()) {
            return;
        }

        try {
            await dataService.addJournalEntry({
                content: newEntry,
                mood: selectedMood,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setNewEntry('');
            setIsWriting(false);
            fetchData();
        } catch (saveError) {
            console.error('Error saving journal entry:', saveError);
            Alert.alert('Error', 'Failed to save entry');
        }
    };

    const renderEntry = ({ item }: { item: any }) => (
        <Card style={styles.entryCard}>
            <View style={styles.entryHeader}>
                <Text style={styles.entryMood}>{MOODS.find((mood) => mood.id === item.mood)?.label || 'Entry'}</Text>
                <Text style={styles.entryDate}>{format(new Date(item.created_at), 'MMMM do, h:mm a')}</Text>
            </View>
            <Text style={styles.entryContent}>{item.content}</Text>
        </Card>
    );

    return (
        <Screen>
            <ScreenHeader
                eyebrow="Journal"
                title="Daily notes"
                subtitle="Reflect in a lightweight writing flow that matches the rest of the mobile system."
            />
            <ScreenContent>
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <ScreenSection style={styles.headerSection}>
                            <SectionHeader title="Recent Entries" actionLabel="Write" onActionPress={() => setIsWriting(true)} />
                        </ScreenSection>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        loading ? (
                            <LoadingState title="Loading journal" description="Gathering your recent reflections." />
                        ) : error ? (
                            <EmptyState
                                iconName="alert-circle-outline"
                                title="Journal unavailable"
                                description={error}
                                actionLabel="Try again"
                                onActionPress={fetchData}
                            />
                        ) : (
                            <EmptyState
                                iconName="book-outline"
                                title="A fresh page"
                                description="Take a moment to reflect. What's on your mind today?"
                                actionLabel="Write first entry"
                                onActionPress={() => setIsWriting(true)}
                            />
                        )
                    }
                />
            </ScreenContent>

            <FAB iconName="create-outline" onPress={() => setIsWriting(true)} accessibilityLabel="New journal entry" />

            <Modal visible={isWriting} onClose={() => setIsWriting(false)} scrollable>
                <View style={styles.modalHeader}>
                    <Text style={styles.writingTitle}>New Entry</Text>
                    <TouchableOpacity onPress={handleAddEntry}>
                        <Text style={styles.saveBtn}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.moodPicker}>
                    <Text style={styles.label}>How are you feeling?</Text>
                    <PillFilter options={MOODS} selectedId={selectedMood} onSelect={setSelectedMood} />
                </View>

                <TextInput
                    style={styles.textInput}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    autoFocus
                    value={newEntry}
                    onChangeText={setNewEntry}
                />
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: spacing.xxxl,
    },
    headerSection: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    entryCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    entryMood: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        textTransform: 'uppercase',
    },
    entryDate: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        fontWeight: typography.weights.medium,
    },
    entryContent: {
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        lineHeight: typography.lineHeights.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    writingTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
    },
    saveBtn: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
        color: colors.primary,
    },
    moodPicker: {
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    textInput: {
        minHeight: 220,
        padding: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        textAlignVertical: 'top',
        borderRadius: spacing.md,
        backgroundColor: colors.surfaceLayered,
    },
});
