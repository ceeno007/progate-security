import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../api/storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            const saved = await storage.getThemePreference();
            setThemeModeState(saved);
        };
        loadTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await storage.saveThemePreference(mode);
    };

    const colorScheme: ColorScheme = themeMode === 'system'
        ? (systemScheme || 'light')
        : themeMode as ColorScheme;

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, colorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
