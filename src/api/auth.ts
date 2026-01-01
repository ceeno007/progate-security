import { apiClient } from './client';
import { storage } from './storage';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    user: {
        id: string;
        name?: string;
        role: string;
        estate_id: string;
        estate_name?: string;
        estate_logo_url?: string;
    };
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
            userId: data.user?.id || data.user_id,
            estateId: data.user?.estate_id || data.estate_id,
            estateName: data.user?.estate_name,
            role: data.user?.role || data.role
        };
        await storage.saveUser(user);

        // Save estate logo if provided
        if (data.user?.estate_logo_url) {
            await storage.saveEstateLogo(data.user.estate_logo_url);
        }

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
