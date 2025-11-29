import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { folderApi } from "@/services/api/folderApi";
import type {
  CreateFolderDto,
  UpdateFolderDto,
} from "@/types/folder";
import { notifications } from "@mantine/notifications";
import { getApiErrorMessage } from "@/utils/error";

export const useFolders = () => {
  return useQuery({
    queryKey: ["folders"],
    queryFn: () => folderApi.getFolders(),
  });
};

export const useFolder = (id: string) => {
  return useQuery({
    queryKey: ["folders", id],
    queryFn: () => folderApi.getFolderById(id),
    enabled: !!id,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderDto) => folderApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      notifications.show({
        title: "성공",
        message: "폴더가 생성되었습니다",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "오류",
        message: getApiErrorMessage(error, "폴더 생성에 실패했습니다"),
        color: "red",
      });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderDto }) =>
      folderApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      notifications.show({
        title: "성공",
        message: "폴더가 수정되었습니다",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "오류",
        message: getApiErrorMessage(error, "폴더 수정에 실패했습니다"),
        color: "red",
      });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => folderApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      notifications.show({
        title: "성공",
        message: "폴더가 삭제되었습니다",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "오류",
        message: getApiErrorMessage(error, "폴더 삭제에 실패했습니다"),
        color: "red",
      });
    },
  });
};
