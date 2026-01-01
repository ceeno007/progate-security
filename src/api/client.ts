import { API_CONFIG } from './config';
import { storage } from './storage';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    const token = await storage.getToken();

    // Merge headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized separately if needed (e.g., trigger refresh)
        if (response.status === 401) {
            // Optional: You could event emit 'logout' or try to refresh token here
            console.log('Unauthorized access - Token might be expired');
        }

        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            // Return text if not JSON
            data = { message: text };
        }

        if (!response.ok) {
            const errorMessage = data.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
};
