"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { IconX } from "@tabler/icons-react";

type Stage = "pick" | "preview" | "scanning" | "done";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string | null;
}

interface OcrItem {
  name: string;
  price: number;
}

interface OcrResult {
  merchant: string;
  address: string;
  date: string;
  items: OcrItem[];
  total: number;
  payment: string;
}

export interface ReceiptAttachData {
  files: UploadedFile[];
  txn: number | "new" | null;
  ocr: OcrResult;
}

interface RecentTxn {
  id: number;
  label: string;
  amount: number;
  time: string;
  cat: string;
  matched?: boolean;
}

const RECENT_TXNS: RecentTxn[] = [
  { id: 1, label: "스타벅스 강남점", amount: -6800, time: "오늘 09:24", cat: "식비", matched: true },
  { id: 2, label: "이마트 트레이더스", amount: -78400, time: "어제 18:42", cat: "장보기" },
  { id: 3, label: "GS25", amount: -3200, time: "어제 11:05", cat: "편의점" },
  { id: 4, label: "올리브영", amount: -22500, time: "11.30 14:20", cat: "쇼핑" },
];

const OCR_RESULT: OcrResult = {
  merchant: "스타벅스 강남역점",
  address: "서울 강남구 강남대로 396",
  date: "2026-05-02 09:24",
  items: [
    { name: "아이스 아메리카노 T", price: 4500 },
    { name: "버터바", price: 2300 },
  ],
  total: 6800,
  payment: "신한카드 1234",
};

const STAGES: { key: Stage; n: string; label: string }[] = [
  { key: "pick", n: "1", label: "업로드" },
  { key: "preview", n: "2", label: "미리보기" },
  { key: "scanning", n: "3", label: "스캔" },
  { key: "done", n: "4", label: "확인" },
];

interface ReceiptUploadModalProps {
  open: boolean;
  onClose: () => void;
  onAttach?: (data: ReceiptAttachData) => void;
}

export function ReceiptUploadModal({
  open,
  onClose,
  onAttach,
}: ReceiptUploadModalProps) {
  const [stage, setStage] = useState<Stage>("pick");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [linkTxn, setLinkTxn] = useState<number | "new" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (stage !== "scanning") return;
    setScanProgress(0);
    const id = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setStage("done");
          return 100;
        }
        return Math.min(100, p + Math.random() * 18 + 6);
      });
    }, 220);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (!open) {
      // 닫힐 때 상태 리셋 (다음 열림이 깔끔하게)
      const t = setTimeout(() => {
        setStage("pick");
        setFiles((prev) => {
          prev.forEach((f) => f.url && URL.revokeObjectURL(f.url));
          return [];
        });
        setScanProgress(0);
        setLinkTxn(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleFiles = (list: FileList | File[]) => {
    const arr: UploadedFile[] = Array.from(list).slice(0, 5).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    if (arr.length === 0) return;
    setFiles(arr);
    setStage("preview");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const finish = () => {
    onAttach?.({ files, txn: linkTxn, ocr: OCR_RESULT });
    onClose();
  };

  if (!open) return null;

  const currentIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="wl-modal-overlay wl-receipt-overlay" onClick={onClose}>
      <div
        className="wl-modal wl-receipt-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="wl-modal-head">
          <div>
            <div className="wl-modal-eyebrow">거래내역 · 가계부</div>
            <h3 className="wl-modal-title">
              영수증 첨부{" "}
              <span className="wl-page-title__hand">— 사진으로 자동 입력</span>
            </h3>
          </div>
          <button
            type="button"
            className="wl-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="wl-receipt-steps">
          {STAGES.map((s, idx) => {
            const cls =
              idx < currentIdx
                ? "wl-rcpt-step--done"
                : idx === currentIdx
                  ? "wl-rcpt-step--on"
                  : "";
            return (
              <div key={s.key} className={`wl-rcpt-step ${cls}`}>
                <span className="wl-rcpt-step__n">
                  {idx < currentIdx ? "✓" : s.n}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="wl-modal-body wl-receipt-body">
          {stage === "pick" && (
            <PickStage
              isDragging={isDragging}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              openPicker={() => inputRef.current?.click()}
            />
          )}

          {stage === "preview" && (
            <PreviewStage
              files={files}
              onRemove={(id) => {
                const target = files.find((f) => f.id === id);
                if (target?.url) URL.revokeObjectURL(target.url);
                setFiles((prev) => prev.filter((f) => f.id !== id));
              }}
              openPicker={() => inputRef.current?.click()}
            />
          )}

          {stage === "scanning" && (
            <ScanningStage progress={scanProgress} firstFile={files[0]} />
          )}

          {stage === "done" && (
            <DoneStage linkTxn={linkTxn} setLinkTxn={setLinkTxn} />
          )}
        </div>

        <div className="wl-modal-foot">
          {stage !== "pick" && (
            <button
              type="button"
              className="wl-timer-btn"
              onClick={() => {
                if (stage === "preview") setStage("pick");
                else if (stage === "done") setStage("preview");
              }}
            >
              ← 이전
            </button>
          )}
          <button
            type="button"
            className="wl-timer-btn"
            onClick={onClose}
            style={{ marginLeft: stage === "pick" ? "auto" : 0 }}
          >
            취소
          </button>
          {stage === "preview" && (
            <button
              type="button"
              className="wl-timer-btn wl-timer-btn--primary"
              onClick={() => setStage("scanning")}
              disabled={files.length === 0}
            >
              스캔 시작 →
            </button>
          )}
          {stage === "done" && (
            <button
              type="button"
              className="wl-timer-btn wl-timer-btn--primary"
              onClick={finish}
              disabled={!linkTxn}
            >
              {linkTxn === "new" ? "거래 추가하고 첨부" : "연결하고 첨부"}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          hidden
          onChange={onPick}
        />
      </div>
    </div>
  );
}

function PickStage({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  openPicker,
}: {
  isDragging: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  openPicker: () => void;
}) {
  return (
    <>
      <div
        className={`wl-receipt-drop${isDragging ? " wl-receipt-drop--drag" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
      >
        <div className="wl-receipt-drop__ico">📄</div>
        <b>여기로 드래그 또는 클릭해서 업로드</b>
        <small>JPG · PNG · HEIC · PDF · 최대 5장 · 파일당 10MB</small>
      </div>

      <div className="wl-receipt-or">또는 다른 방법으로</div>

      <div className="wl-receipt-method-grid">
        <button type="button" className="wl-rcpt-method" onClick={openPicker}>
          <span className="wl-rm-ico wl-bg-yellow">📷</span>
          <div>
            <b>카메라로 촬영</b>
            <small>지금 영수증을 찍어요</small>
          </div>
        </button>
        <button type="button" className="wl-rcpt-method" onClick={openPicker}>
          <span className="wl-rm-ico wl-bg-mint">🖼️</span>
          <div>
            <b>갤러리에서 선택</b>
            <small>저장된 사진 불러오기</small>
          </div>
        </button>
        <button type="button" className="wl-rcpt-method" disabled>
          <span className="wl-rm-ico wl-bg-pink">📧</span>
          <div>
            <b>이메일에서 가져오기</b>
            <small>영수증 메일 자동 수집</small>
          </div>
        </button>
        <button type="button" className="wl-rcpt-method" disabled>
          <span className="wl-rm-ico wl-bg-blue">☁️</span>
          <div>
            <b>드라이브 연결</b>
            <small>구글 · 드롭박스</small>
          </div>
        </button>
      </div>

      <div className="wl-receipt-tip">
        <span>💡</span>
        <div>
          <b>스캔 팁</b>
          <small>
            밝은 곳에서 영수증 전체가 보이게 촬영하면 OCR 인식률이 올라가요. 구겨진 영수증은 평평하게 펴주세요.
          </small>
        </div>
      </div>
    </>
  );
}

function PreviewStage({
  files,
  onRemove,
  openPicker,
}: {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  openPicker: () => void;
}) {
  return (
    <>
      <div className="wl-receipt-preview-grid">
        {files.map((f) => (
          <div key={f.id} className="wl-rcpt-thumb">
            {f.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.name} />
            ) : (
              <div className="wl-rcpt-thumb__pdf">
                📄<span>PDF</span>
              </div>
            )}
            <button
              type="button"
              className="wl-rcpt-thumb__x"
              onClick={() => onRemove(f.id)}
              aria-label="제거"
            >
              <IconX size={11} />
            </button>
            <div className="wl-rcpt-thumb__name">{f.name}</div>
          </div>
        ))}
        {files.length < 5 && (
          <button
            type="button"
            className="wl-rcpt-thumb wl-rcpt-thumb--add"
            onClick={openPicker}
          >
            <span>+</span>
            <small>추가</small>
          </button>
        )}
      </div>

      <div className="wl-receipt-options">
        <label className="wl-rcpt-check">
          <input type="checkbox" defaultChecked />
          <span className="wl-rcpt-check__box" />
          <span>OCR 자동 인식 — 가게명, 금액, 날짜 추출</span>
        </label>
        <label className="wl-rcpt-check">
          <input type="checkbox" defaultChecked />
          <span className="wl-rcpt-check__box" />
          <span>이미지 자동 보정 — 밝기 · 기울기 보정</span>
        </label>
        <label className="wl-rcpt-check">
          <input type="checkbox" />
          <span className="wl-rcpt-check__box" />
          <span>원본 클라우드 백업</span>
        </label>
      </div>
    </>
  );
}

function ScanningStage({
  progress,
  firstFile,
}: {
  progress: number;
  firstFile?: UploadedFile;
}) {
  return (
    <div className="wl-receipt-scanning">
      <div className="wl-rcpt-scan-card">
        {firstFile?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstFile.url} alt="scanning" />
        ) : (
          <div className="wl-rcpt-scan-placeholder">📄</div>
        )}
        <div className="wl-rcpt-scan-line" />
      </div>
      <div className="wl-rcpt-scan-status">
        <b>영수증을 분석하고 있어요…</b>
        <div className="wl-rcpt-progress">
          <div className="wl-rcpt-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <small>{Math.floor(progress)}% · 텍스트 추출 중</small>
      </div>
      <ul className="wl-rcpt-scan-tasks">
        <li className={progress > 20 ? "wl-rcpt-scan-task--done" : ""}>이미지 보정</li>
        <li className={progress > 50 ? "wl-rcpt-scan-task--done" : ""}>텍스트 영역 감지</li>
        <li className={progress > 80 ? "wl-rcpt-scan-task--done" : ""}>가맹점 · 금액 추출</li>
        <li className={progress >= 100 ? "wl-rcpt-scan-task--done" : ""}>거래내역 매칭</li>
      </ul>
    </div>
  );
}

function DoneStage({
  linkTxn,
  setLinkTxn,
}: {
  linkTxn: number | "new" | null;
  setLinkTxn: (v: number | "new") => void;
}) {
  return (
    <div className="wl-receipt-done">
      <div className="wl-rcpt-done-head">
        <div className="wl-rcpt-success">✓</div>
        <div>
          <b>인식 완료!</b>
          <small>아래 정보를 확인하고 거래내역에 연결해주세요</small>
        </div>
      </div>

      <div className="wl-rcpt-ocr-card">
        <div className="wl-rcpt-ocr-row wl-rcpt-ocr-row--big">
          <span>가맹점</span>
          <b>{OCR_RESULT.merchant}</b>
        </div>
        <div className="wl-rcpt-ocr-row">
          <span>일시</span>
          <b>{OCR_RESULT.date}</b>
        </div>
        <div className="wl-rcpt-ocr-row">
          <span>결제수단</span>
          <b>{OCR_RESULT.payment}</b>
        </div>
        <div className="wl-rcpt-ocr-divider" />
        {OCR_RESULT.items.map((it, i) => (
          <div key={i} className="wl-rcpt-ocr-row">
            <span>{it.name}</span>
            <b>₩{it.price.toLocaleString()}</b>
          </div>
        ))}
        <div className="wl-rcpt-ocr-divider" />
        <div className="wl-rcpt-ocr-row wl-rcpt-ocr-row--total">
          <span>합계</span>
          <b>₩{OCR_RESULT.total.toLocaleString()}</b>
        </div>
      </div>

      <div className="wl-rcpt-link-section">
        <div className="wl-rcpt-link-label">거래내역에 연결</div>
        <small className="wl-rcpt-link-sub">
          동일 금액·시간대로 자동 매칭된 거래입니다
        </small>
        <div className="wl-rcpt-link-list">
          {RECENT_TXNS.map((t) => {
            const checked = linkTxn === t.id;
            return (
              <label
                key={t.id}
                className={`wl-rcpt-link-row${checked ? " wl-rcpt-link-row--on" : ""}`}
              >
                <input
                  type="radio"
                  name="linkTxn"
                  checked={checked}
                  onChange={() => setLinkTxn(t.id)}
                />
                <div className="wl-rcpt-link-body">
                  <b>{t.label}</b>
                  <small>
                    {t.time} · {t.cat}
                  </small>
                </div>
                <span className="wl-rcpt-link-amt">
                  -₩{Math.abs(t.amount).toLocaleString()}
                </span>
                {t.matched && <span className="wl-rcpt-match-tag">자동 매칭</span>}
              </label>
            );
          })}
          <label
            className={`wl-rcpt-link-row wl-rcpt-link-row--new${
              linkTxn === "new" ? " wl-rcpt-link-row--on" : ""
            }`}
          >
            <input
              type="radio"
              name="linkTxn"
              checked={linkTxn === "new"}
              onChange={() => setLinkTxn("new")}
            />
            <div className="wl-rcpt-link-body">
              <b>+ 새 거래내역으로 추가</b>
              <small>OCR 정보로 자동 입력해드려요</small>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
