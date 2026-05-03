"use client";

import { useTranslation } from "react-i18next";

interface CreateStickyNoteButtonProps {
  onCreate: (color: string, position: number) => void;
  nextPosition: number;
  availableColor: string;
}

export function CreateStickyNoteButton({
  onCreate,
  nextPosition,
  availableColor,
}: CreateStickyNoteButtonProps) {
  const { t } = useTranslation("dashboard");

  return (
    <button
      type="button"
      className="wl-sticky--empty"
      onClick={() => onCreate(availableColor, nextPosition)}
      aria-label={t("stickyNotes.createButton")}
    >
      + {t("stickyNotes.createButton")}
    </button>
  );
}
