import api from '@/lib/axios';
import type {
  UpdateUserSettingsPayload,
  UserSettings,
} from '@/types/userSettings';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userSettingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get<ApiResponse<UserSettings>>('/api/user-settings');
    return response.data.data;
  },
  updateSettings: async (
    payload: UpdateUserSettingsPayload
  ): Promise<UserSettings> => {
    const response = await api.put<ApiResponse<UserSettings>>(
      '/api/user-settings',
      payload
    );
    return response.data.data;
  },
};
