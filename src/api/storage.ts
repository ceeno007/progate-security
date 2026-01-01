import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

export const storage = {
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
    clear: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_INFO_KEY);
    }
};
