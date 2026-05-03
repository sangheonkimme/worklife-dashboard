"use client";

import { useState, useRef, useEffect } from "react";
import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { StickyNote } from "@/types/stickyNote";
import { getStickyVariant } from "@/utils/stickyNoteColor";

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (value !== note.content) {
        onUpdate(note.id, value);
      }
    }, 500);
  };

  const variant = getStickyVariant(note.color);

  return (
    <div className={`wl-sticky wl-sticky--${variant}`}>
      <ActionIcon
        variant="subtle"
        color="dark"
        size="sm"
        onClick={() => onDelete(note.id)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          background: "rgba(0,0,0,0.06)",
          color: "rgba(0,0,0,0.55)",
        }}
        aria-label={t("stickyNotes.aria.delete")}
      >
        <IconX size={14} />
      </ActionIcon>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.currentTarget.value)}
        placeholder={t("stickyNotes.placeholder")}
        style={{
          flex: 1,
          width: "100%",
          padding: 0,
          marginTop: 4,
          resize: "none",
        }}
      />
    </div>
  );
}
