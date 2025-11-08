import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userSettingsApi } from '@/services/api/userSettingsApi';
import { useUserSettingsStore } from '@/store/useUserSettingsStore';
import type { UpdateUserSettingsPayload } from '@/types/userSettings';

export const USER_SETTINGS_QUERY_KEY = ['user-settings'] as const;

const getErrorMessage = (error: unknown, fallback: string) => {
  const isOffline = typeof navigator !== 'undefined' && navigator && !navigator.onLine;
  if (isOffline) {
    return '오프라인 상태예요. 네트워크 연결 후 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const hydrate = useUserSettingsStore((state) => state.hydrate);
  const setLoading = useUserSettingsStore((state) => state.setLoading);
  const setErrorState = useUserSettingsStore((state) => state.setError);
  const settings = useUserSettingsStore((state) => state.settings);
  const status = useUserSettingsStore((state) => state.status);
  const initialized = useUserSettingsStore((state) => state.initialized);
  const error = useUserSettingsStore((state) => state.error);

  const isTokenAvailable = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('accessToken'));
  }, []);

  const settingsQuery = useQuery({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: userSettingsApi.getSettings,
    enabled: isTokenAvailable,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (settingsQuery.fetchStatus === 'fetching') {
      setLoading();
    }
  }, [settingsQuery.fetchStatus, setLoading]);

  useEffect(() => {
    if (settingsQuery.data) {
      hydrate(settingsQuery.data);
    }
  }, [settingsQuery.data, hydrate]);

  useEffect(() => {
    if (settingsQuery.isError && settingsQuery.error) {
      setErrorState(getErrorMessage(settingsQuery.error, '사용자 설정을 불러오지 못했어요.'));
    }
  }, [settingsQuery.isError, settingsQuery.error, setErrorState]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserSettingsPayload) =>
      userSettingsApi.updateSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, data);
      hydrate(data);
    },
    onError: (mutationError) => {
      setErrorState(
        getErrorMessage(mutationError, '사용자 설정을 저장하지 못했어요.')
      );
    },
  });

  return {
    settings,
    status,
    initialized,
    error,
    refetch: settingsQuery.refetch,
    isFetching: settingsQuery.isFetching,
    isUpdating: updateMutation.isPending,
    updateSettings: updateMutation.mutateAsync,
  };
};
