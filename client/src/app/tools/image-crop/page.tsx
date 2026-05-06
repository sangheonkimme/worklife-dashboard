"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useTranslation } from "react-i18next";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { notifications } from "@mantine/notifications";
import {
  IconClipboard,
  IconDownload,
  IconFlipHorizontal,
  IconPhotoUp,
  IconRotate2,
  IconRotateClockwise2,
  IconUpload,
} from "@tabler/icons-react";
import { useImageCropStore } from "@/store/useImageCropStore";
import {
  copyBlobToClipboard,
  downloadBlob,
  getCroppedImage,
  getImageDimensions,
} from "@/utils/imageCrop";
import type { AspectPresetId, CropFormat } from "@/types/imageCrop";

interface SourceImage {
  src: string;
  width: number;
  height: number;
  name: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ZOOM = { min: 1, max: 4, step: 0.05 };

const PRESETS: {
  id: AspectPresetId | "ig" | "yt";
  ratio: number | undefined;
  label: string;
  sub: string;
  glyph: [number, number];
}[] = [
  { id: "free", ratio: undefined, label: "자유", sub: "비율 고정 X", glyph: [22, 14] },
  { id: "1:1", ratio: 1, label: "1 : 1", sub: "정사각", glyph: [16, 16] },
  { id: "4:3", ratio: 4 / 3, label: "4 : 3", sub: "기본", glyph: [22, 16] },
  { id: "16:9", ratio: 16 / 9, label: "16 : 9", sub: "와이드", glyph: [26, 14] },
  { id: "9:16", ratio: 9 / 16, label: "9 : 16", sub: "스토리", glyph: [12, 22] },
  { id: "4:5", ratio: 4 / 5, label: "4 : 5", sub: "포트폴리오", glyph: [16, 20] },
  { id: "ig", ratio: 1, label: "인스타", sub: "1080×1080", glyph: [18, 18] },
  { id: "yt", ratio: 16 / 9, label: "유튜브", sub: "1280×720", glyph: [24, 14] },
];

const FORMATS: { value: CropFormat; label: string }[] = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("read failed"));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ImageCropPage() {
  const { t } = useTranslation("widgets");
  const settings = useImageCropStore((s) => s.settings);
  const setSettings = useImageCropStore((s) => s.setSettings);
  const setAspectPreset = useImageCropStore((s) => s.setAspectPreset);
  const history = useImageCropStore((s) => s.history);
  const addHistory = useImageCropStore((s) => s.addHistory);

  const [source, setSource] = useState<SourceImage | null>(null);
  const [presetId, setPresetId] = useState<string>(settings.aspectPresetId);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragHover, setDragHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );
  const aspect = activePreset.ratio;

  // 페이스트 핸들러
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: t("imageCrop.notifications.unsupportedTitle"),
          message: t("imageCrop.notifications.unsupportedMessage"),
          color: "red",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        notifications.show({
          title: t("imageCrop.notifications.sizeTitle"),
          message: t("imageCrop.notifications.sizeMessage"),
          color: "red",
        });
        return;
      }
      try {
        const src = await readDataUrl(file);
        const { width, height } = await getImageDimensions(src);
        setSource({ src, width, height, name: file.name, size: file.size, type: file.type });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setArea(null);
      } catch (err) {
        console.error(err);
        notifications.show({
          title: t("imageCrop.notifications.loadFailedTitle"),
          message: t("imageCrop.notifications.loadFailedMessage"),
          color: "red",
        });
      }
    },
    [t]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) {
        e.preventDefault();
        void handleFile(files[0]);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const reset = () => {
    setSource(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setArea(null);
  };

  const choosePreset = (id: string) => {
    setPresetId(id);
    // store에 저장 가능한 표준 id만 영속화 (ig/yt는 ratio만 유지)
    const STORE_IDS: AspectPresetId[] = [
      "free",
      "1:1",
      "4:3",
      "16:9",
      "9:16",
      "4:5",
      "custom",
    ];
    const next = STORE_IDS.includes(id as AspectPresetId)
      ? (id as AspectPresetId)
      : "1:1";
    setAspectPreset(next);
  };

  const exportImage = useCallback(
    async (mode: "download" | "clipboard") => {
      if (!source || !area) {
        notifications.show({
          title: t("imageCrop.notifications.noImageTitle"),
          message: t("imageCrop.notifications.noImageMessage"),
          color: "yellow",
        });
        return;
      }
      setBusy(true);
      try {
        const result = await getCroppedImage(
          source.src,
          area,
          settings.format,
          settings.quality,
          settings.transparentBackground,
          { rotation, flipH }
        );
        const ts = new Date().toISOString().split("T")[0];
        const ext = settings.format === "jpeg" ? "jpg" : settings.format;
        const base = source.name.replace(/\.[^/.]+$/, "") || "crop";
        const fileName = `${base}-${ts}.${ext}`;

        if (mode === "download") {
          downloadBlob(result.blob, fileName);
          notifications.show({
            title: t("imageCrop.notifications.exportSuccessTitle"),
            message: t("imageCrop.notifications.exportSuccessMessage"),
            color: "green",
          });
        } else {
          await copyBlobToClipboard(result.blob);
          notifications.show({
            title: t("imageCrop.notifications.copiedTitle"),
            message: t("imageCrop.notifications.copiedMessage"),
            color: "green",
          });
        }

        addHistory({
          id: crypto.randomUUID?.() ?? `${Date.now()}`,
          createdAt: Date.now(),
          dataUrl: result.dataUrl,
          width: result.width,
          height: result.height,
          format: settings.format,
          fileName,
        });
      } catch (err) {
        console.error(err);
        notifications.show({
          title: t("imageCrop.notifications.exportFailedTitle"),
          message: t("imageCrop.notifications.exportFailedMessage"),
          color: "red",
        });
      } finally {
        setBusy(false);
      }
    },
    [
      source,
      area,
      settings.format,
      settings.quality,
      settings.transparentBackground,
      rotation,
      flipH,
      addHistory,
      t,
    ]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragHover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const formatLabel =
    FORMATS.find((f) => f.value === settings.format)?.label ?? "JPG";

  // 페이지 헤더의 부제 (원본 메타)
  const subText = source
    ? `${t("imageCrop.headerMeta", {
        w: source.width,
        h: source.height,
      })} · ${formatBytes(source.size)} · ${source.type
        .replace("image/", "")
        .toUpperCase()}`
    : t("imageCrop.pageSub");

  return (
    <div className="wl-tool-page">
      <header className="wl-page-head">
        <div>
          <div className="wl-crumb">{t("imageCrop.crumb")}</div>
          <h1 className="wl-page-title">
            {t("imageCrop.title")}
            <span className="wl-hand-sub">— {t("imageCrop.handSub")}</span>
          </h1>
          <div className="wl-page-sub">{subText}</div>
        </div>
        <div className="wl-page-head__actions">
          <button
            type="button"
            className="wl-timer-btn"
            onClick={reset}
            disabled={!source || busy}
          >
            {t("imageCrop.actions.reset")}
          </button>
          <button
            type="button"
            className="wl-timer-btn wl-timer-btn--primary"
            onClick={() => exportImage("download")}
            disabled={!source || !area || busy}
          >
            <IconDownload size={14} /> {t("imageCrop.actions.export")}
          </button>
        </div>
      </header>

      <div className="wl-crop-shell">
        {/* LEFT — control rail */}
        <aside className="wl-crop-rail">
          <div className="wl-rail-section">
            <div className="wl-rail-h">{t("imageCrop.sections.aspect")}</div>
            <div className="wl-ratio-grid">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`wl-ratio-card${
                    presetId === p.id ? " wl-ratio-card--on" : ""
                  }`}
                  onClick={() => choosePreset(p.id)}
                >
                  <span
                    className="wl-ratio-glyph"
                    style={{ width: p.glyph[0], height: p.glyph[1] }}
                  />
                  <b>{p.label}</b>
                  <small>{p.sub}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="wl-rail-section">
            <div className="wl-rail-h">{t("imageCrop.sections.area")}</div>
            <div className="wl-num-grid">
              <label>
                <span>W</span>
                <input
                  readOnly
                  value={area ? Math.round(area.width) : 0}
                />
                <em>px</em>
              </label>
              <label>
                <span>H</span>
                <input
                  readOnly
                  value={area ? Math.round(area.height) : 0}
                />
                <em>px</em>
              </label>
              <label>
                <span>X</span>
                <input
                  readOnly
                  value={area ? Math.round(area.x) : 0}
                />
                <em>px</em>
              </label>
              <label>
                <span>Y</span>
                <input
                  readOnly
                  value={area ? Math.round(area.y) : 0}
                />
                <em>px</em>
              </label>
            </div>
          </div>

          <div className="wl-rail-section">
            <div className="wl-rail-h">{t("imageCrop.sections.transform")}</div>
            <div className="wl-trans-row">
              <button
                type="button"
                onClick={() => setRotation((r) => r - 90)}
                disabled={!source}
              >
                <IconRotate2 size={14} /> -90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => r + 90)}
                disabled={!source}
              >
                <IconRotateClockwise2 size={14} /> +90°
              </button>
              <button
                type="button"
                className={flipH ? "wl-on" : ""}
                onClick={() => setFlipH((v) => !v)}
                disabled={!source}
              >
                <IconFlipHorizontal size={14} />{" "}
                {t("imageCrop.actions.flipH")}
              </button>
            </div>
            <div className="wl-rot-slider">
              <input
                type="range"
                min={-45}
                max={45}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                disabled={!source}
              />
              <span className="wl-rot-val">{rotation}°</span>
            </div>
          </div>
        </aside>

        {/* CENTER — preview stage */}
        <div className="wl-crop-stage">
          <div className="wl-stage-toolbar">
            <span className="wl-stage-meta">
              {source
                ? t("imageCrop.stage.preview")
                : t("imageCrop.stage.dropHint")}
            </span>
            <div className="wl-stage-zoom">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.max(ZOOM.min, +(z - 0.1).toFixed(2)))
                }
                aria-label="zoom out"
                disabled={!source}
              >
                −
              </button>
              <span style={{ minWidth: 36, textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.min(ZOOM.max, +(z + 0.1).toFixed(2)))
                }
                aria-label="zoom in"
                disabled={!source}
              >
                +
              </button>
              <span className="wl-div" />
              <button
                type="button"
                onClick={() => setZoom(1)}
                disabled={!source}
              >
                {t("imageCrop.stage.fit")}
              </button>
            </div>
          </div>

          <div
            className="wl-stage-canvas"
            onDragOver={(e) => {
              e.preventDefault();
              setDragHover(true);
            }}
            onDragLeave={() => setDragHover(false)}
            onDrop={onDrop}
          >
            {source ? (
              <Cropper
                image={source.src}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_, pixels) => setArea(pixels)}
                showGrid
                restrictPosition
                style={{
                  containerStyle: {
                    background: "transparent",
                    transform: flipH ? "scaleX(-1)" : undefined,
                  },
                }}
              />
            ) : (
              <EmptyDrop
                hover={dragHover}
                onClick={() => fileInputRef.current?.click()}
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="wl-stage-foot">
            <span>
              {area
                ? t("imageCrop.stage.output", {
                    w: Math.round(area.width),
                    h: Math.round(area.height),
                    ratio: activePreset.label,
                  })
                : t("imageCrop.stage.noOutput")}
            </span>
            <span>
              {source
                ? t("imageCrop.stage.zoomLabel", {
                    pct: Math.round(zoom * 100),
                  })
                : ""}
            </span>
          </div>
        </div>

        {/* RIGHT — output options */}
        <aside className="wl-crop-out">
          <div className="wl-rail-section">
            <div className="wl-rail-h">{t("imageCrop.sections.format")}</div>
            <div className="wl-format-row">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={settings.format === f.value ? "wl-on" : ""}
                  onClick={() => setSettings({ format: f.value })}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="wl-rail-section">
            <div className="wl-quality-row">
              <span>{t("imageCrop.sections.quality")}</span>
              <b>{Math.round(settings.quality * 100)}</b>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={Math.round(settings.quality * 100)}
              onChange={(e) =>
                setSettings({ quality: Number(e.target.value) / 100 })
              }
              disabled={settings.format === "png"}
              style={{ width: "100%", accentColor: "var(--wl-ink)" }}
            />
            {settings.format === "png" && (
              <small style={{ fontSize: 10, color: "var(--wl-ink-mute)" }}>
                {t("imageCrop.sections.qualityNotePng")}
              </small>
            )}
          </div>

          <div className="wl-rail-section">
            <div className="wl-rail-h">{t("imageCrop.sections.download")}</div>
            <button
              type="button"
              className="wl-dl-btn"
              onClick={() => exportImage("download")}
              disabled={!source || !area || busy}
            >
              <IconDownload size={14} />{" "}
              {t("imageCrop.actions.downloadAs", { format: formatLabel })}
            </button>
            <button
              type="button"
              className="wl-dl-btn wl-dl-btn--ghost"
              onClick={() => exportImage("clipboard")}
              disabled={!source || !area || busy}
            >
              <IconClipboard size={14} /> {t("imageCrop.actions.copy")}
            </button>
          </div>

          <div className="wl-tip-card">
            <span className="wl-hand">{t("imageCrop.tip.title")} ✎</span>
            <p>{t("imageCrop.tip.body")}</p>
          </div>

          {history.length > 0 && (
            <div className="wl-rail-section">
              <div className="wl-rail-h">
                {t("imageCrop.sections.recent")}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 6,
                }}
              >
                {history.slice(0, 6).map((h) => (
                  <a
                    key={h.id}
                    href={h.dataUrl}
                    download={h.fileName}
                    title={h.fileName}
                    style={{
                      display: "block",
                      aspectRatio: "1 / 1",
                      borderRadius: 6,
                      overflow: "hidden",
                      border: "1px solid var(--wl-line)",
                      background: "var(--wl-bg-paper)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.dataUrl}
                      alt={h.fileName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function EmptyDrop({
  hover,
  onClick,
}: {
  hover: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation("widgets");
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        width: "100%",
        height: "100%",
        minHeight: 320,
        padding: 24,
        background: hover ? "rgba(255,255,255,0.6)" : "transparent",
        border: `2px dashed ${
          hover ? "var(--wl-ink)" : "var(--wl-line-strong)"
        }`,
        borderRadius: 12,
        cursor: "pointer",
        color: "var(--wl-ink-soft)",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <IconPhotoUp size={48} stroke={1.4} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wl-ink)" }}>
          {t("imageCrop.empty.title")}
        </div>
        <div
          style={{ fontSize: 12, color: "var(--wl-ink-mute)", marginTop: 4 }}
        >
          {t("imageCrop.empty.description")}
        </div>
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--wl-ink)",
          background: "var(--wl-yellow)",
          padding: "6px 14px",
          borderRadius: 99,
          border: "1px solid var(--wl-yellow-edge)",
        }}
      >
        <IconUpload size={12} /> {t("imageCrop.empty.cta")}
      </span>
    </button>
  );
}
