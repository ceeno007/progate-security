import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const ScreenWrapper: React.FC<Props> = ({ children, style }) => {
    const colors = useThemeColors();
    const theme = useColorScheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={theme === 'dark' ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />
            <SafeAreaView style={[styles.safeArea, style]}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
