"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { generatePdfFromImages, downloadPdf } from "@/utils/pdfGenerator";
import type { PdfOptions } from "@/types/widget";

type PaperKey = "A4" | "Letter" | "Custom";
type Orient = "portrait" | "landscape";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  size: string;
  width: number;
  height: number;
}

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
];

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const PAPER_OPTIONS: { id: PaperKey; label: string; sub: string; ratio: string }[] = [
  { id: "A4", label: "A4", sub: "210 × 297 mm", ratio: "210/297" },
  { id: "Letter", label: "Letter", sub: "8.5 × 11 in", ratio: "8.5/11" },
  { id: "Custom", label: "원본", sub: "이미지 그대로", ratio: "4/3" },
];

export function PdfPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [paper, setPaper] = useState<PaperKey>("A4");
  const [orient, setOrient] = useState<Orient>("portrait");
  const [fileName, setFileName] = useState(
    `document_${new Date().toISOString().slice(0, 10)}.pdf`
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<UploadedImage[]>([]);

  useEffect(() => {
    previewsRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const totalSize = useMemo(
    () => images.reduce((sum, i) => sum + i.file.size, 0),
    [images]
  );

  const addFiles = useCallback(async (files: File[]) => {
    const accepted = files.filter((f) => ACCEPTED.includes(f.type));
    if (accepted.length === 0) return;

    const items = await Promise.all(
      accepted.map(
        (file, index): Promise<UploadedImage> =>
          new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
              resolve({
                id: `${Date.now()}-${index}-${file.name}`,
                file,
                preview: url,
                size: fmtSize(file.size),
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.onerror = () =>
              resolve({
                id: `${Date.now()}-${index}-${file.name}`,
                file,
                preview: url,
                size: fmtSize(file.size),
                width: 0,
                height: 0,
              });
            img.src = url;
          })
      )
    );

    setImages((prev) => [...prev, ...items]);
    if (!activeId && items[0]) setActiveId(items[0].id);
  }, [activeId]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.id !== id);
    });
    if (activeId === id) setActiveId(null);
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setActiveId(null);
  };

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const opts: PdfOptions = {
        pageSize: paper,
        orientation: orient,
        imageFit: "fit",
        margin: 20,
      };
      const result = await generatePdfFromImages(
        images.map((i) => i.file),
        opts
      );
      if (result.success && result.data) {
        downloadPdf(result.data, fileName || result.fileName || "document.pdf");
      } else {
        console.error("PDF 생성 실패:", result.error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const previewRatio =
    orient === "portrait"
      ? paper === "Letter"
        ? "8.5/11"
        : paper === "Custom"
          ? "3/4"
          : "210/297"
      : paper === "Letter"
        ? "11/8.5"
        : paper === "Custom"
          ? "4/3"
          : "297/210";

  return (
    <AuthRequiredWrapper>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        style={{ display: "none" }}
        onChange={onPick}
      />

      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">도구 · 이미지 → PDF</div>
          <h1 className="wl-page-title">
            이미지를 PDF로
            <span className="wl-page-title__hand">
              {images.length === 0 ? "— 시작해보세요" : "— 거의 다 됐어요"}
            </span>
          </h1>
          <div className="wl-page-sub">
            {images.length === 0 ? (
              <>JPG · PNG · HEIC · WebP 지원 · 최대 100장</>
            ) : (
              <>
                <b>{images.length}장</b> 업로드됨 · 원본 <b>{fmtSize(totalSize)}</b>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {images.length > 0 && (
            <>
              <button type="button" className="wl-timer-btn" onClick={clearAll}>
                전체 삭제
              </button>
              <button
                type="button"
                className="wl-timer-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                + 더 추가
              </button>
              <button
                type="button"
                className="wl-timer-btn wl-timer-btn--primary"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "생성 중…" : "↓ PDF 만들기"}
              </button>
            </>
          )}
        </div>
      </div>

      {images.length === 0 ? (
        <div
          className={`wl-pdf-dropzone${isDragging ? " wl-pdf-dropzone--drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div className="wl-pdf-dz-pile">
            <div className="wl-pdf-dz-sample" style={{ transform: "rotate(-7deg)" }} />
            <div className="wl-pdf-dz-sample" style={{ transform: "rotate(3deg)" }} />
            <div className="wl-pdf-dz-sample" style={{ transform: "rotate(-2deg)" }} />
          </div>
          <h2>여기로 이미지를 끌어다 놓으세요</h2>
          <p>
            또는{" "}
            <button
              type="button"
              className="wl-pdf-dz-link"
              onClick={() => fileInputRef.current?.click()}
            >
              파일 선택
            </button>
          </p>

          <div className="wl-pdf-dz-formats">
            <span>JPG</span>
            <span>PNG</span>
            <span>HEIC</span>
            <span>WebP</span>
            <span>GIF</span>
          </div>

          <div className="wl-pdf-dz-tips">
            <div className="wl-pdf-dz-tip">
              <b>1.</b>
              <span>여러 이미지를 한꺼번에 끌어다 놓아요</span>
            </div>
            <div className="wl-pdf-dz-tip">
              <b>2.</b>
              <span>드래그로 순서를 바꿀 수 있어요</span>
            </div>
            <div className="wl-pdf-dz-tip">
              <b>3.</b>
              <span>용지 크기 (A4 / Letter / 원본) 선택 후 내보내기</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="wl-pdf-uploaded">
          {/* TOP — strip */}
          <section className="wl-pdf-up-strip">
            <div className="wl-pdf-strip-h">
              <span className="wl-rail-h" style={{ marginBottom: 0 }}>
                업로드된 이미지
              </span>
              <small className="wl-memo-muted">드래그로 순서 변경 · 클릭으로 미리보기</small>
            </div>
            <div className="wl-pdf-strip-row">
              {images.map((img, i) => (
                <StripCard
                  key={img.id}
                  img={img}
                  index={i}
                  isActive={activeId === img.id}
                  onSelect={() => setActiveId(img.id)}
                  onRemove={() => removeImage(img.id)}
                  onMove={moveImage}
                  total={images.length}
                />
              ))}
              <div
                className="wl-pdf-strip-card wl-pdf-strip-card--add"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="wl-pdf-add-plus">+</div>
                <small>이미지 추가</small>
                <span className="wl-hand">또는 끌어다 놓기</span>
              </div>
            </div>
          </section>

          {/* BOTTOM — settings + preview */}
          <section className="wl-pdf-up-bottom">
            <div className="wl-pdf-up-settings">
              <div className="wl-rail-h">PDF 설정</div>

              <div className="wl-pdf-set-block">
                <div className="wl-pdf-set-label">용지 크기</div>
                <div className="wl-pdf-paper-row">
                  {PAPER_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`wl-pdf-paper-card${
                        paper === p.id ? " wl-pdf-paper-card--on" : ""
                      }`}
                      onClick={() => setPaper(p.id)}
                    >
                      <span className="wl-pdf-paper-glyph" style={{ aspectRatio: p.ratio }} />
                      <b>{p.label}</b>
                      <small>{p.sub}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wl-pdf-set-block">
                <div className="wl-pdf-set-label">방향</div>
                <div className="wl-pdf-orient-row">
                  <button
                    type="button"
                    className={orient === "portrait" ? "wl-pdf-orient--on" : ""}
                    onClick={() => setOrient("portrait")}
                  >
                    ┃ 세로
                  </button>
                  <button
                    type="button"
                    className={orient === "landscape" ? "wl-pdf-orient--on" : ""}
                    onClick={() => setOrient("landscape")}
                  >
                    ━ 가로
                  </button>
                </div>
              </div>

              <div className="wl-pdf-set-block">
                <div className="wl-pdf-set-label">파일명</div>
                <input
                  className="wl-pdf-rail-input"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>

            <div className="wl-pdf-up-preview">
              <div className="wl-pdf-prev-h">
                미리보기{" "}
                <small>
                  · {paper === "Custom" ? "원본" : paper}{" "}
                  {orient === "portrait" ? "세로" : "가로"}
                </small>
              </div>
              <div className="wl-pdf-prev-stack">
                {images.slice(0, 3).map((img, i) => (
                  <div
                    key={img.id}
                    className="wl-pdf-prev-page"
                    style={{
                      aspectRatio: previewRatio,
                      transform: `translate(${i * 8}px, ${i * 8}px) rotate(${(i - 1) * 1.5}deg)`,
                      zIndex: 3 - i,
                    }}
                  >
                    <span className="wl-pdf-prev-no">{i + 1}</span>
                    <div className="wl-pdf-prev-pad">
                      <img src={img.preview} alt={img.file.name} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="wl-pdf-prev-foot">
                <span className="wl-hand">총 {images.length}쪽</span>
                <span className="wl-memo-muted">원본 {fmtSize(totalSize)}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </AuthRequiredWrapper>
  );
}

function StripCard({
  img,
  index,
  isActive,
  onSelect,
  onRemove,
  onMove,
  total,
}: {
  img: UploadedImage;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
  total: number;
}) {
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(from) && from !== index) onMove(from, index);
  };

  return (
    <div
      className={`wl-pdf-strip-card${isActive ? " wl-pdf-strip-card--active" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
    >
      <span className="wl-pdf-strip-num">{index + 1}</span>
      {total > 1 && <span className="wl-pdf-strip-grip" aria-hidden>⋮⋮</span>}
      <button
        type="button"
        className="wl-pdf-strip-x"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="이미지 제거"
      >
        ×
      </button>
      <div className="wl-pdf-strip-img">
        <img src={img.preview} alt={img.file.name} />
      </div>
      <div className="wl-pdf-strip-meta">
        <b title={img.file.name}>{img.file.name}</b>
        <small>
          {img.size}
          {img.width > 0 && ` · ${img.width}×${img.height}`}
        </small>
      </div>
    </div>
  );
}
