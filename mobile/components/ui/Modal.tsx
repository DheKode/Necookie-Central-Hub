import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Modal as RNModal, ModalProps, Platform, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface CozyModalProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    variant?: 'center' | 'sheet';
    title?: string;
    subtitle?: string;
    footer?: React.ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
    scrollable?: boolean;
}

export function Modal({
    visible,
    onClose,
    children,
    variant = 'sheet',
    title,
    subtitle,
    footer,
    contentStyle,
    scrollable = false,
    ...rest
}: CozyModalProps) {
    const body = scrollable ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
        </ScrollView>
    ) : children;

    return (
        <RNModal
            visible={visible}
            transparent
            animationType={variant === 'sheet' ? 'slide' : 'fade'}
            onRequestClose={onClose}
            {...rest}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, variant === 'sheet' && styles.sheetOverlay]}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardAvoider}
                        >
                            <View style={[styles.content, variant === 'sheet' ? styles.sheetContent : styles.centerContent, contentStyle]}>
                                {variant === 'sheet' ? <View style={styles.handle} /> : null}
                                {(title || subtitle) ? (
                                    <View style={styles.header}>
                                        <View style={styles.headerCopy}>
                                            {title ? <Text style={styles.title}>{title}</Text> : null}
                                            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                                        </View>
                                        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
                                            <Ionicons name="close" size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                                {body}
                                {footer ? <View style={styles.footer}>{footer}</View> : null}
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(58, 54, 51, 0.4)',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    sheetOverlay: {
        justifyContent: 'flex-end',
        paddingHorizontal: 0,
        paddingTop: spacing.xxxl,
        paddingBottom: 0,
    },
    keyboardAvoider: {
        width: '100%',
    },
    content: {
        backgroundColor: colors.surface,
        shadowColor: '#3A3633',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
    centerContent: {
        borderRadius: radius.xl,
        padding: spacing.xl,
    },
    sheetContent: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        minHeight: 240,
        maxHeight: '88%',
    },
    handle: {
        alignSelf: 'center',
        width: 44,
        height: 5,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    headerCopy: {
        flex: 1,
        gap: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        lineHeight: typography.lineHeights.sm,
        color: colors.textSecondary,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceLayered,
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        gap: spacing.md,
    },
    footer: {
        marginTop: spacing.lg,
    },
});
