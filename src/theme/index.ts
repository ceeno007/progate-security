import { useColorScheme } from 'react-native';

const PALETTE = {
    electricBlue: '#0066CC', // More corporate/pro blue
    electricBlueDark: '#38bdf8', // Lighter for dark mode
    deepPurple: '#7C3AED',
    amber: '#F59E0B',
    red: '#DC2626',
    emerald: '#059669',

    slate900: '#0F172A',
    slate800: '#1E293B',
    slate700: '#334155',
    slate200: '#E2E8F0',
    slate100: '#F1F5F9',
    slate50: '#F8FAFC',
    slate400: '#94A3B8',
    slate500: '#64748B',

    white: '#FFFFFF',
    black: '#000000',
};

const DARK = {
    mode: 'dark',
    primary: PALETTE.white, // White accent in dark mode
    secondary: PALETTE.emerald, // Keeping element colors if needed, or map to slate
    accent: PALETTE.amber,
    danger: '#EF4444',
    success: '#34D399',

    background: '#000000', // Pure black OLED friendly
    surface: '#121212', // Slightly lighter black
    surfaceHighlight: '#272727',

    text: PALETTE.white,
    textSecondary: '#A1A1A1',
    textInverse: PALETTE.black, // Black text on White primary button

    border: '#272727',
    icon: PALETTE.white,
};

const LIGHT = {
    mode: 'light',
    primary: PALETTE.black, // Black accent in light mode
    secondary: PALETTE.deepPurple,
    accent: PALETTE.amber,
    danger: PALETTE.red,
    success: PALETTE.emerald,

    background: '#F5F5F7', // Apple warm gray/white
    surface: PALETTE.white,
    surfaceHighlight: '#E5E5EA',

    text: '#000000',
    textSecondary: '#86868B', // Apple gray
    textInverse: PALETTE.white, // White text on Black primary button

    border: '#E5E5EA',
    icon: '#000000',
};

export const useThemeColors = () => {
    // Import dynamically to avoid circular dependency
    const React = require('react');
    let colorScheme: 'light' | 'dark' = 'light';

    try {
        // Try to use ThemeContext if available
        const { useTheme } = require('../context/ThemeContext');
        const theme = useTheme();
        colorScheme = theme.colorScheme;
    } catch {
        // Fallback to system if ThemeContext not available
        const { useColorScheme } = require('react-native');
        colorScheme = useColorScheme() || 'light';
    }

    return colorScheme === 'dark' ? DARK : LIGHT;
};

// Deprecate direct usage of static COLORS if possible, or alias to default dark for now to prevent crash during refactor
export const COLORS = DARK;

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
};
