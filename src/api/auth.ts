import { apiClient } from './client';
import { storage } from './storage';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user_id: string;
    estate_id: string;
    role: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const data = await apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Save session data
        if (data.access_token) await storage.saveToken(data.access_token);
        if (data.refresh_token) await storage.saveRefreshToken(data.refresh_token);

        const user = {
            userId: data.user_id,
            estateId: data.estate_id,
            role: data.role
        };
        await storage.saveUser(user);

        return data;
    },

    refreshToken: async () => {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const data = await apiClient('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (data.access_token) {
            await storage.saveToken(data.access_token);
        }
        return data;
    },

    logout: async () => {
        await storage.clear();
    }
};
