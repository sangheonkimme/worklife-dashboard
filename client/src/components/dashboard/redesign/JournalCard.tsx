"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const MOODS = ["😄", "🙂", "😐", "😕", "🔥", "😴", "🥲"] as const;
type Mood = (typeof MOODS)[number];
const STORAGE_KEY = "wl-journal-today-v1";

interface PersistedJournal {
  date: string;
  mood: Mood;
  text: string;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export function JournalCard() {
  const { t, i18n } = useTranslation("dashboard");
  const [mood, setMood] = useState<Mood>("🔥");
  const [text, setText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedJournal;
      if (parsed.date === todayKey()) {
        setMood(parsed.mood);
        setText(parsed.text);
      }
    } catch {
      // ignore corrupted state
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedJournal = { date: todayKey(), mood, text };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [mood, text]);

  const dateLabel = new Date().toLocaleDateString(i18n.language || "ko", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="wl-journal">
      <div className="wl-journal__head">
        <div className="wl-journal__tab">{t("deskPile.journal.tab")}</div>
        <div className="wl-mood" role="radiogroup" aria-label="mood">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mood === m}
              className={`wl-mood-btn${mood === m ? " wl-mood-btn--on" : ""}`}
              onClick={() => setMood(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="wl-journal__body">
        <div className="wl-journal__mood" aria-hidden>
          {mood}
        </div>
        <input
          className="wl-journal__input"
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          placeholder={t("deskPile.journal.placeholder")}
          maxLength={80}
        />
      </div>

      <div className="wl-journal__foot">
        <span className="wl-hand">{dateLabel}</span>
        <span className="wl-journal__count">{text.length} / 80</span>
      </div>
    </div>
  );
}
