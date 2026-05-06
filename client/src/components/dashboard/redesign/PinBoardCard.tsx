"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "wl-pin-board-v1";

interface Pin {
  id: string;
  label: string;
  value: string;
}

const DEFAULT_PINS: Pin[] = [
  { id: "wifi", label: "사무실 WIFI", value: "WL_office / coffee2024" },
  { id: "bank", label: "회사 계좌", value: "신한 110-***-****" },
  { id: "parcel", label: "택배함 비번", value: "#1204" },
  { id: "parking", label: "주차 자리", value: "B2 — 47번" },
];

export function PinBoardCard() {
  const { t } = useTranslation("dashboard");
  const [pins, setPins] = useState<Pin[]>(DEFAULT_PINS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPins(JSON.parse(raw) as Pin[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  }, [pins]);

  const addPin = () => {
    const id = `pin-${Date.now()}`;
    setPins((prev) => [...prev, { id, label: "새 핀", value: "" }]);
  };

  return (
    <div className="wl-pin-board">
      <div className="wl-pin-board__head">
        <h3>{t("deskPile.pinBoard.title")}</h3>
        <button type="button" className="wl-pin-add" onClick={addPin}>
          {t("deskPile.pinBoard.addLabel")}
        </button>
      </div>
      <div className="wl-pin-cards">
        {pins.map((pin) => (
          <div key={pin.id} className="wl-pin-card">
            <div className="wl-pin-label">{pin.label}</div>
            <div className="wl-pin-value">{pin.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
