import React from 'react';
import { Modal as RNModal, View, StyleSheet, TouchableWithoutFeedback, ModalProps } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface CozyModalProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ visible, onClose, children, ...rest }: CozyModalProps) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            {...rest}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            {children}
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
        backgroundColor: 'rgba(58, 54, 51, 0.4)', // Dimmed textPrimary
        justifyContent: 'center',
        padding: spacing.xl,
    },
    content: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.xl,
        shadowColor: '#3A3633',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
});
