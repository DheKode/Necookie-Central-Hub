import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FormField } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../src/lib/supabase';
import { colors, radius, spacing, typography } from '../../theme';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        if (!isSupabaseConfigured) {
            Alert.alert('Supabase not configured', 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable login.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login failed', error.message);
            setLoading(false);
            return;
        }

        router.replace('/');
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
            <View style={styles.glowTop} pointerEvents="none" />
            <View style={styles.glowBottom} pointerEvents="none" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Text style={styles.eyebrow}>Necookie Hub</Text>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Pick up where you left off across tasks, notes, money, and history.</Text>
                    </View>

                    <Card variant="outline" style={styles.formCard}>
                        {!isSupabaseConfigured ? (
                            <View style={styles.warningBanner}>
                                <Text style={styles.warningText}>
                                    Supabase is not configured. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
                                </Text>
                            </View>
                        ) : null}

                        <FormField
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <FormField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Button
                            label={loading ? 'Checking...' : 'Sign In'}
                            onPress={signInWithEmail}
                            disabled={loading || !isSupabaseConfigured || !email.trim() || !password}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Need an account? </Text>
                            <Link href="/signup" asChild>
                                <Text style={styles.link}>Sign Up</Text>
                            </Link>
                        </View>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    glowTop: {
        position: 'absolute',
        top: -104,
        right: -24,
        width: 220,
        height: 220,
        borderRadius: 999,
        backgroundColor: colors.primaryLight,
    },
    glowBottom: {
        position: 'absolute',
        bottom: 40,
        left: -56,
        width: 184,
        height: 184,
        borderRadius: 999,
        backgroundColor: colors.secondaryLight,
        opacity: 0.62,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        gap: spacing.lg,
    },
    header: {
        gap: spacing.sm,
    },
    eyebrow: {
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: typography.weights.bold,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        lineHeight: typography.lineHeights.md,
        color: colors.textSecondary,
    },
    formCard: {
        gap: spacing.md,
        borderRadius: radius.xl,
    },
    warningBanner: {
        borderRadius: radius.md,
        backgroundColor: colors.warningLight,
        padding: spacing.md,
    },
    warningText: {
        color: colors.warning,
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
    },
    button: {
        marginTop: spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
    },
    link: {
        color: colors.primary,
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.sm,
    },
});
