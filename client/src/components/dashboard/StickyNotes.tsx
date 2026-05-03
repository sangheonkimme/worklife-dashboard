"use client";

import { useState } from "react";
import { Box, Title, Text } from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { stickyNotesApi } from "@/services/api/stickyNotesApi";
import { StickyNoteCard } from "./StickyNoteCard";
import { JournalCard } from "./redesign/JournalCard";
import { PinBoardCard } from "./redesign/PinBoardCard";
import {
  STICKY_NOTE_COLORS,
  STICKY_NOTE_COLOR_ARRAY,
} from "@/types/stickyNote";
import type { StickyNote } from "@/types/stickyNote";
import type { StickyVariant } from "@/utils/stickyNoteColor";
import { getApiErrorMessage } from "@/utils/error";
import { trackEvent } from "@/lib/analytics";

// 무료 플랜 기본 한도. 유료 플랜은 추후 plan별 cap으로 교체 (DB 개편 후).
const MAX_NOTES = 3;

const SWATCHES: { variant: StickyVariant; hex: string }[] = [
  { variant: "yellow", hex: STICKY_NOTE_COLORS.YELLOW },
  { variant: "pink", hex: STICKY_NOTE_COLORS.PINK },
  { variant: "blue", hex: STICKY_NOTE_COLORS.BLUE },
];

export function StickyNotes() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["dashboard", "system"]);
  const [selectedColor, setSelectedColor] = useState<string>(
    STICKY_NOTE_COLORS.YELLOW
  );

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["stickyNotes"],
    queryFn: stickyNotesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: { color: string; position: number }) =>
      stickyNotesApi.create(data),
    onSuccess: (createdNote, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stickyNotes"] });
      notifications.show({
        title: t("system:notifications.successTitle"),
        message: t("dashboard:stickyNotes.notifications.createSuccess"),
        color: "green",
      });
      trackEvent({
        name: "sticky_note_saved",
        params: {
          action: "create",
          color: variables?.color,
          position: variables?.position,
          note_id: (createdNote as StickyNote | undefined)?.id,
        },
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

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      stickyNotesApi.update(id, { content }),
    onMutate: async ({ id, content }) => {
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
    onSuccess: (_result, variables) => {
      trackEvent({
        name: "sticky_note_saved",
        params: {
          action: "update",
          note_id: variables.id,
          char_count: variables.content.length,
        },
      });
    },
    onError: (_error, _variables, context) => {
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => stickyNotesApi.deleteById(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ["stickyNotes"] });
      notifications.show({
        title: t("system:notifications.successTitle"),
        message: t("dashboard:stickyNotes.notifications.deleteSuccess"),
        color: "green",
      });
      trackEvent({
        name: "sticky_note_deleted",
        params: { note_id: id },
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

  const handleUpdate = (id: string, content: string) => {
    updateMutation.mutate({ id, content });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // 다음 빈 position 찾기 (0부터 순차)
  const usedPositions = new Set(notes.map((n) => n.position));
  const nextPosition = (() => {
    for (let i = 0; ; i++) {
      if (!usedPositions.has(i)) return i;
    }
  })();

  const isLimitReached = notes.length >= MAX_NOTES;

  const handleAdd = () => {
    if (isLimitReached) return;
    // 선택된 색상이 이미 다 찼으면 다른 색으로 자동 폴백
    const usedColors = new Set(notes.map((n) => n.color));
    let color = selectedColor;
    if (usedColors.has(color)) {
      const fallback = STICKY_NOTE_COLOR_ARRAY.find((c) => !usedColors.has(c));
      if (fallback) color = fallback;
    }
    createMutation.mutate({ color, position: nextPosition });
  };

  if (isLoading) {
    return (
      <Box className="wl-notes-card">
        <Title order={4} mb="md">
          {t("dashboard:stickyNotes.title")}
        </Title>
        <Text c="dimmed">{t("dashboard:stickyNotes.loading")}</Text>
      </Box>
    );
  }

  // 정렬: position 오름차순으로 표시 (생성 순서 안정성)
  const sortedNotes = [...notes].sort((a, b) => a.position - b.position);

  return (
    <Box className="wl-notes-card">
      <Box
        mb="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Box style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Title
            order={2}
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            {t("dashboard:stickyNotes.title")}
          </Title>
          <Text className="wl-hand" size="md" c="dimmed">
            {t("dashboard:stickyNotes.handTagline")}
          </Text>
        </Box>

        <Box style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            className="wl-color-pick"
            role="radiogroup"
            aria-label={t("dashboard:stickyNotes.colorPickerAria")}
          >
            {SWATCHES.map((s) => (
              <button
                key={s.variant}
                type="button"
                role="radio"
                aria-checked={selectedColor === s.hex}
                aria-label={s.variant}
                className={`wl-swatch wl-swatch--${s.variant}${
                  selectedColor === s.hex ? " wl-swatch--active" : ""
                }`}
                onClick={() => setSelectedColor(s.hex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="wl-add-note"
            onClick={handleAdd}
            disabled={isLimitReached || createMutation.isPending}
            aria-label={t("dashboard:stickyNotes.createButton")}
          >
            + {t("dashboard:stickyNotes.createButton")}
          </button>
        </Box>
      </Box>

      <div className="wl-notes-board">
        {sortedNotes.map((note) => (
          <StickyNoteCard
            key={note.id}
            note={note}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}

        {/* 비어있을 때만 시안과 동일한 dashed 슬롯을 표시. 추가는 헤더 버튼으로 */}
        {sortedNotes.length === 0 && (
          <button
            type="button"
            className="wl-sticky--empty"
            onClick={handleAdd}
            aria-label={t("dashboard:stickyNotes.createButton")}
          >
            + {t("dashboard:stickyNotes.createButton")}
          </button>
        )}
      </div>

      <Box
        mt="sm"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--wl-ink-mute)",
        }}
      >
        <span>
          {t("dashboard:stickyNotes.limitNotice", { count: MAX_NOTES })}
        </span>
        <span style={{ fontFamily: "var(--wl-font-mono)" }}>
          {sortedNotes.length} / {MAX_NOTES}
        </span>
      </Box>

      <div className="wl-desk-pile">
        <div className="wl-desk-pile__row">
          <JournalCard />
          <PinBoardCard />
        </div>
      </div>
    </Box>
  );
}
