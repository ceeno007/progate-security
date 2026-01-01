import { apiClient } from './client';

export interface AccessVerificationResponse {
    valid: boolean;
    visitor_name?: string;
    resident_name?: string;
    valid_until?: string;
    message?: string;
}

export const accessApi = {
    verifyCode: async (code: string): Promise<AccessVerificationResponse> => {
        // Query param usage as per docs: POST /access/verify?code=123456
        return await apiClient(`/access/verify?code=${code}`, {
            method: 'POST',
        });
    },

    checkIn: async (code: string) => {
        return await apiClient(`/access/check-in?code=${code}`, {
            method: 'POST',
        });
    }
};
