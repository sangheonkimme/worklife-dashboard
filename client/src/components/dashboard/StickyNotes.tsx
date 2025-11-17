import { Box, Title, Grid, Text } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { stickyNotesApi } from "@/services/api/stickyNotesApi";
import { StickyNoteCard } from "./StickyNoteCard";
import { CreateStickyNoteButton } from "./CreateStickyNoteButton";
import { STICKY_NOTE_COLOR_ARRAY } from "@/types/stickyNote";
import type { StickyNote } from "@/types/stickyNote";
import { getApiErrorMessage } from "@/utils/error";

const MAX_NOTES = 3;
const POSITIONS = [0, 1, 2];

export function StickyNotes() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["dashboard", "system"]);

  // 스티커 메모 목록 조회
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["stickyNotes"],
    queryFn: stickyNotesApi.getAll,
  });

  // 스티커 메모 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: { color: string; position: number }) =>
      stickyNotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickyNotes"] });
      notifications.show({
        title: t("system:notifications.successTitle"),
        message: t("dashboard:stickyNotes.notifications.createSuccess"),
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t("system:notifications.errorTitle"),
        message: getApiErrorMessage(
          error,
          t("dashboard:stickyNotes.notifications.createError")
        ),
        color: "red",
      });
    },
  });

  // 스티커 메모 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      stickyNotesApi.update(id, { content }),
    onMutate: async ({ id, content }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: ["stickyNotes"] });
      const previousNotes = queryClient.getQueryData<StickyNote[]>([
        "stickyNotes",
      ]);

      queryClient.setQueryData<StickyNote[]>(["stickyNotes"], (old) =>
        old?.map((note) =>
          note.id === id
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (_error, _variables, context) => {
      // 실패 시 롤백
      if (context?.previousNotes) {
        queryClient.setQueryData(["stickyNotes"], context.previousNotes);
      }
      notifications.show({
        title: t("system:notifications.errorTitle"),
        message: t("dashboard:stickyNotes.notifications.updateError"),
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stickyNotes"] });
    },
  });

  // 스티커 메모 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => stickyNotesApi.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickyNotes"] });
      notifications.show({
        title: t("system:notifications.successTitle"),
        message: t("dashboard:stickyNotes.notifications.deleteSuccess"),
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: t("system:notifications.errorTitle"),
        message: t("dashboard:stickyNotes.notifications.deleteError"),
        color: "red",
      });
    },
  });

  // 핸들러 함수들
  const handleCreate = (color: string, position: number) => {
    createMutation.mutate({ color, position });
  };

  const handleUpdate = (id: string, content: string) => {
    updateMutation.mutate({ id, content });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // 사용된 position 찾기
  const usedPositions = new Set(notes.map((note) => note.position));

  // 다음 사용 가능한 색상 찾기
  const usedColors = new Set(notes.map((note) => note.color));
  const availableColor =
    STICKY_NOTE_COLOR_ARRAY.find((color) => !usedColors.has(color)) ||
    STICKY_NOTE_COLOR_ARRAY[notes.length % STICKY_NOTE_COLOR_ARRAY.length];

  // 다음 사용 가능한 position 찾기
  const nextPosition = POSITIONS.find((pos) => !usedPositions.has(pos)) ?? 0;

  if (isLoading) {
    return (
      <Box>
        <Title order={3} mb="md">
          {t("dashboard:stickyNotes.title")}
        </Title>
        <Text c="dimmed">{t("dashboard:stickyNotes.loading")}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Title order={4} mb="md">
        {t("dashboard:stickyNotes.title")}
      </Title>

      <Grid gutter="md">
        {/* 기존 메모들 렌더링 */}
        {notes.map((note) => (
          <Grid.Col key={note.id} span={{ base: 12, xs: 6, md: 4 }}>
            <StickyNoteCard
              note={note}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </Grid.Col>
        ))}

        {/* 3개 미만일 때만 새 메모 버튼 1개 표시 */}
        {notes.length < MAX_NOTES && (
          <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
            <CreateStickyNoteButton
              onCreate={handleCreate}
              nextPosition={nextPosition}
              availableColor={availableColor}
            />
          </Grid.Col>
        )}
      </Grid>

      {notes.length >= MAX_NOTES && (
        <Text size="sm" c="dimmed" mt="sm">
          {t("dashboard:stickyNotes.limitNotice", { count: MAX_NOTES })}
        </Text>
      )}
    </Box>
  );
}
