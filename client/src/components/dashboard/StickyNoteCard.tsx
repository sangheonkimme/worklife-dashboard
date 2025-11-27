"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Textarea, ActionIcon, Box } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { StickyNote } from "@/types/stickyNote";

interface StickyNoteCardProps {
  note: StickyNote;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function StickyNoteCard({
  note,
  onUpdate,
  onDelete,
}: StickyNoteCardProps) {
  const { t } = useTranslation("dashboard");
  const [content, setContent] = useState(note.content);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 디바운스된 자동 저장
  const handleContentChange = (value: string) => {
    setContent(value);

    // 이전 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 500ms 후 자동 저장
    timeoutRef.current = setTimeout(() => {
      if (value !== note.content) {
        onUpdate(note.id, value);
      }
    }, 500);
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: note.color,
        position: "relative",
        height: "230px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
      }}
      styles={{
        root: {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
          },
        },
      }}
    >
      {/* 삭제 버튼 */}
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => onDelete(note.id)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
        aria-label={t("stickyNotes.aria.delete")}
      >
        <IconX size={16} />
      </ActionIcon>

      {/* 메모 입력 영역 */}
      <Box mt={4} style={{ flex: 1, overflow: "hidden" }}>
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.currentTarget.value)}
          placeholder={t("stickyNotes.placeholder")}
          styles={{
            wrapper: {
              height: "185px",
            },
            input: {
              backgroundColor: "transparent",
              border: "none",
              color: "#333",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none",
              height: "100%",
              overflow: "auto",
              "&:focus": {
                outline: "none",
              },
              "&::placeholder": {
                color: "#999",
              },
              // 스크롤바 스타일링
              "&::WebkitScrollbar": {
                width: "6px",
              },
              "&::WebkitScrollbarTrack": {
                background: "transparent",
              },
              "&::WebkitScrollbarThumb": {
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "3px",
                opacity: 0,
                transition: "opacity 0.3s ease",
              },
              "&:hover::WebkitScrollbarThumb": {
                opacity: 1,
              },
              "&::WebkitScrollbarThumb:hover": {
                background: "rgba(0, 0, 0, 0.3)",
              },
              // Firefox용 스크롤바 스타일
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
            },
          }}
        />
      </Box>
    </Card>
  );
}
