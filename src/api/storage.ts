import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

const ACTIVITY_KEY = 'activity_log';

export interface ActivityLog {
    id: string;
    type: 'SCAN' | 'VEHICLE' | 'ALERT';
    title: string;
    subtitle: string;
    timestamp: number;
}

export const storage = {
    // ... existing methods ...
    saveToken: async (token: string) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    },
    getToken: async () => {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },
    saveRefreshToken: async (token: string) => {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    },
    getRefreshToken: async () => {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },
    saveUser: async (user: any) => {
        await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
    },
    getUser: async () => {
        const user = await SecureStore.getItemAsync(USER_INFO_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Biometric Preference
    saveBiometricEnabled: async (enabled: boolean) => {
        await SecureStore.setItemAsync('biometric_enabled', JSON.stringify(enabled));
    },
    getBiometricEnabled: async () => {
        const val = await SecureStore.getItemAsync('biometric_enabled');
        return val === 'true'; // parse boolean
    },

    // Theme Preference: 'light' | 'dark' | 'system'
    saveThemePreference: async (theme: 'light' | 'dark' | 'system') => {
        await SecureStore.setItemAsync('theme_preference', theme);
    },
    getThemePreference: async (): Promise<'light' | 'dark' | 'system'> => {
        const val = await SecureStore.getItemAsync('theme_preference');
        return (val as 'light' | 'dark' | 'system') || 'system';
    },
    addActivity: async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        try {
            const existing = await storage.getActivity();
            const newLog: ActivityLog = {
                ...log,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
            };
            const updated = [newLog, ...existing].slice(0, 10); // Keep last 10
            await SecureStore.setItemAsync(ACTIVITY_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save activity', e);
        }
    },
    getActivity: async (): Promise<ActivityLog[]> => {
        try {
            const logs = await SecureStore.getItemAsync(ACTIVITY_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            return [];
        }
    },

    clear: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_INFO_KEY);
        await SecureStore.deleteItemAsync(ACTIVITY_KEY);
    }
};
