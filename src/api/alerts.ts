import { apiClient } from './client';

export interface Alert {
    id: string; // Assuming an ID field exists based on usage in update
    type: string;
    description: string;
    resident_name: string;
    status: 'ACTIVE' | 'RESPONDING' | 'RESOLVED';
    created_at?: string;
}

export const alertsApi = {
    listAlerts: async (): Promise<Alert[]> => {
        return await apiClient('/alerts/', {
            method: 'GET',
        });
    },

    updateAlertStatus: async (alertId: string, status: 'RESPONDING' | 'RESOLVED') => {
        return await apiClient(`/alerts/${alertId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
};
