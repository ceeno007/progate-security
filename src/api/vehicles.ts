import { apiClient } from './client';

export interface VehicleInfo {
    plate_number: string;
    status: 'APPROVED' | 'DENIED' | 'UNKNOWN';
    make_model: string;
    owner: string;
}

export const vehiclesApi = {
    checkPlate: async (plateNumber: string): Promise<VehicleInfo> => {
        return await apiClient(`/vehicles/check/${plateNumber}`, {
            method: 'GET',
        });
    }
};
