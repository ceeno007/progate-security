import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useThemeColors, SPACING, SHADOWS } from '../theme';

interface Props {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'; // Added ghost
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<Props> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    icon
}) => {
    const colors = useThemeColors();

    const getBackgroundColor = () => {
        switch (variant) {
            case 'primary': return colors.primary;
            case 'secondary': return colors.surfaceHighlight;
            case 'danger': return colors.danger;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary': return '#fff'; // Always white on primary
            case 'secondary': return colors.text;
            case 'danger': return '#fff';
            case 'outline': return colors.primary;
            case 'ghost': return colors.textSecondary;
            default: return '#fff';
        }
    };

    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: isOutline ? colors.border : 'transparent',
                    borderWidth: isOutline ? 1.5 : 0,
                },
                variant === 'primary' && SHADOWS.medium, // only shadow on primary
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.contentContainer}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        { color: getTextColor() },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: SPACING.s,
    },
    text: {
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.3,
    },
});
