import React, { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { isSupabaseConfigured, supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../theme';
import { Button, FormField } from '../../components/ui';

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
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert('Signup Failed', error.message);
            setLoading(false);
        } else {
            if (!session) {
                Alert.alert('Success', 'Check your email for the confirmation link!');
                router.replace('/(auth)/login');
            } else {
                router.replace('/(tabs)');
            }
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Let's get started</Text>
                    <Text style={styles.subtitle}>Create a peaceful space for your daily life</Text>
                </View>

                <View style={styles.form}>
                    {!isSupabaseConfigured && (
                        <Text style={styles.warningText}>
                            Supabase is not configured. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
                        </Text>
                    )}
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
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        label={loading ? 'Creating Account...' : 'Sign Up'}
                        onPress={signUpWithEmail}
                        disabled={loading || !isSupabaseConfigured}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.link}>Sign In</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    form: {
        gap: spacing.md,
    },
    warningText: {
        color: colors.warning,
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
    },
    button: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
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
