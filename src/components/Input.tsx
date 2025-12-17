import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColors, SPACING } from '../theme';

interface Props extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<Props> = ({ label, error, icon, style, ...props }) => {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: error ? colors.danger : colors.border
                }
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, { color: colors.text }, style]}
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.primary}
                    {...props}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    label: {
        marginBottom: SPACING.s, // increased spacing
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    inputContainer: {
        borderRadius: 16, // more rounded
        borderWidth: 1.5, // slightly thicker
        flexDirection: 'row',
        alignItems: 'center',
        height: 60, // taller click area
        paddingHorizontal: SPACING.m,
    },
    iconContainer: {
        marginRight: SPACING.s,
    },
    input: {
        flex: 1,
        fontSize: 17, // larger text
        height: '100%',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        marginTop: SPACING.xs,
        marginLeft: 4,
    },
});
