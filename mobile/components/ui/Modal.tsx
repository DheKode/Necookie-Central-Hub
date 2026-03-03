import React from 'react';
import { Modal as RNModal, ScrollView, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle, ModalProps } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface CozyModalProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    variant?: 'center' | 'sheet';
    contentStyle?: StyleProp<ViewStyle>;
    scrollable?: boolean;
}

export function Modal({
    visible,
    onClose,
    children,
    variant = 'sheet',
    contentStyle,
    scrollable = false,
    ...rest
}: CozyModalProps) {
    const content = scrollable ? (
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
                        <View style={[styles.content, variant === 'sheet' ? styles.sheetContent : styles.centerContent, contentStyle]}>
                            {content}
                        </View>
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
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        minHeight: 240,
        maxHeight: '88%',
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        gap: spacing.md,
    },
});
