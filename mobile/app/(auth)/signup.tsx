import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FormField } from '../../components/ui';
import { isSupabaseConfigured, supabase } from '../../src/lib/supabase';
import { colors, radius, spacing, typography } from '../../theme';

export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (!isSupabaseConfigured) {
            Alert.alert('Supabase not configured', 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable signup.');
            return;
        }

        setLoading(true);
        const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Signup failed', error.message);
            setLoading(false);
            return;
        }

        if (!session) {
            Alert.alert('Success', 'Check your email for the confirmation link.');
            router.replace('/login');
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
                        <Text style={styles.eyebrow}>Create account</Text>
                        <Text style={styles.title}>Set up your hub</Text>
                        <Text style={styles.subtitle}>Create a stable mobile account flow before the internal release build goes out.</Text>
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
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Button
                            label={loading ? 'Creating Account...' : 'Sign Up'}
                            onPress={signUpWithEmail}
                            disabled={loading || !isSupabaseConfigured || !email.trim() || !password}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <Text style={styles.link}>Sign In</Text>
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
        top: -96,
        left: -28,
        width: 220,
        height: 220,
        borderRadius: 999,
        backgroundColor: colors.secondaryLight,
        opacity: 0.72,
    },
    glowBottom: {
        position: 'absolute',
        right: -40,
        bottom: 56,
        width: 180,
        height: 180,
        borderRadius: 999,
        backgroundColor: colors.primaryLight,
        opacity: 0.66,
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
