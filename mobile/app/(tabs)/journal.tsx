import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { Card, SectionHeader, FAB, PillFilter, EmptyState, Button } from '../../components/ui';
import { dataService } from '../../src/services/dataService';
import { format } from 'date-fns';

const MOODS = [
    { id: 'happy', label: '😊' },
    { id: 'calm', label: '😌' },
    { id: 'focused', label: '🧠' },
    { id: 'tired', label: '😴' },
    { id: 'stressed', label: '😫' },
];

export default function JournalScreen() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMood, setSelectedMood] = useState('calm');
    const [newEntry, setNewEntry] = useState('');
    const [isWriting, setIsWriting] = useState(false);

    const fetchData = async () => {
        try {
            const data = await dataService.fetchJournal();
            setEntries(data || []);
        } catch (error) {
            console.error('Error fetching journal:', error);
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
        if (!newEntry.trim()) return;
        try {
            await dataService.addJournalEntry({
                content: newEntry,
                mood: selectedMood
            });
            setNewEntry('');
            setIsWriting(false);
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Failed to save entry');
        }
    };

    const renderEntry = ({ item }: { item: any }) => (
        <Card style={styles.entryCard}>
            <View style={styles.entryHeader}>
                <Text style={styles.entryMood}>{MOODS.find(m => m.id === item.mood)?.label || '📝'}</Text>
                <Text style={styles.entryDate}>{format(new Date(item.created_at), 'MMMM do, h:mm a')}</Text>
            </View>
            <Text style={styles.entryContent}>{item.content}</Text>
        </Card>
    );

    if (isWriting) {
        return (
            <View style={[styles.container, styles.writingContainer]}>
                <View style={styles.writingHeader}>
                    <TouchableOpacity onPress={() => setIsWriting(false)}>
                        <Ionicons name="close" size={28} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.writingTitle}>New Entry</Text>
                    <TouchableOpacity onPress={handleAddEntry}>
                        <Text style={styles.saveBtn}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.moodPicker}>
                    <Text style={styles.label}>How are you feeling?</Text>
                    <PillFilter
                        options={MOODS}
                        selectedId={selectedMood}
                        onSelect={setSelectedMood}
                    />
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
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={entries}
                renderItem={renderEntry}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <EmptyState
                            iconName="book-outline"
                            title="Your journal is empty"
                            description="Start capturing your thoughts and moods today."
                            actionLabel="Write first entry"
                            onActionPress={() => setIsWriting(true)}
                        />
                    ) : null
                }
            />

            <FAB iconName="create-outline" onPress={() => setIsWriting(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    entryCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    entryMood: {
        fontSize: 24,
        marginRight: spacing.sm,
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
    writingContainer: {
        backgroundColor: colors.surface,
        paddingTop: spacing.xl,
    },
    writingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
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
        padding: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    textInput: {
        flex: 1,
        padding: spacing.lg,
        fontSize: typography.sizes.lg,
        color: colors.textPrimary,
        textAlignVertical: 'top',
    },
});
