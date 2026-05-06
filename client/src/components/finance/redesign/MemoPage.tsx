"use client";

import { useMemo, useState } from "react";
import {
  IconSearch,
  IconStar,
  IconStarFilled,
  IconPin,
  IconPinFilled,
  IconNotes,
  IconFolder,
  IconTrash,
  IconHistory,
  IconLink,
  IconDots,
  IconBold,
  IconItalic,
  IconList,
  IconCheck,
  IconQuote,
  IconPhoto,
  IconH1,
} from "@tabler/icons-react";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";

type Folder = "work" | "personal" | "study";
type FolderKey = Folder | "all" | "starred" | "trash";

interface Memo {
  id: number;
  title: string;
  folder: Folder;
  tags: string[];
  starred: boolean;
  pinned: boolean;
  updated: string;
  word: number;
  excerpt: string;
  body: string;
}

const SEED_MEMOS: Memo[] = [
  {
    id: 1,
    title: "디자인 시스템 v2 — 컬러 토큰 정리",
    folder: "work",
    tags: ["디자인", "토큰"],
    starred: true,
    pinned: true,
    updated: "오늘 오후 2:14",
    word: 612,
    excerpt: "primary / secondary / surface 3-tier로 재정리. 다크 모드 대응은 oklch로…",
    body: `# 디자인 시스템 v2 — 컬러 토큰 정리\n\n오늘 회의에서 결정된 사항 정리.\n\n## 토큰 구조\n3단 구조로 간소화한다:\n1. **Primitive** — 원시 색상 팔레트 (raw values)\n2. **Semantic** — 의미 기반 별칭 (surface / ink / accent)\n3. **Component** — 특정 컴포넌트 전용 (button-primary-bg 등)\n\n## 다크 모드\n- oklch 기반으로 명도(lightness)만 반전시키는 방식으로 통일.\n- 채도(chroma)는 라이트보다 살짝 낮춤 — 눈 피로도 ↓.\n\n> "토큰은 약속이지, 색상이 아니다."\n\n## 다음 단계\n- [ ] 피그마 변수 정리 (수요일까지)\n- [x] 라이트 토큰 정의\n- [ ] 다크 토큰 정의`,
  },
  {
    id: 2,
    title: "이번 분기 회고",
    folder: "personal",
    tags: ["회고", "성장"],
    starred: true,
    pinned: false,
    updated: "어제",
    word: 384,
    excerpt: "잘한 것: 디자인 시스템 안정화, 신규 기능 3건 출시. 아쉬운 것…",
    body: `# 이번 분기 회고\n\n## 잘한 것\n- 디자인 시스템 v1 안정화\n- 신규 기능 3건 출시\n- 팀원 1명 멘토링\n\n## 아쉬운 것\n- 야근이 잦았음\n- 책 읽는 시간 부족\n- 운동 빈도가 떨어짐\n\n## 다음 분기 목표\n1. 정시 퇴근 주 3회 이상\n2. 디자인 책 2권 완독\n3. 필라테스 주 2회`,
  },
  {
    id: 3,
    title: "주말에 갈 동네 카페 리스트",
    folder: "personal",
    tags: ["카페", "주말"],
    starred: false,
    pinned: false,
    updated: "그저께",
    word: 142,
    excerpt: "성수 — 어니언, 대림창고. 연남 — 카멜커피, 피어커피…",
    body: `# 주말 카페 리스트\n\n## 성수\n- 어니언 — 빵이 정말 맛있음\n- 대림창고 — 사진 찍기 좋음\n\n## 연남\n- 카멜커피 — 라떼가 진함\n- 피어커피 — 원두 종류가 다양\n\n## 한남\n- 콤마콤마 — 분위기 ◎`,
  },
  {
    id: 4,
    title: "신규 프로젝트 킥오프 — 아이디어 메모",
    folder: "work",
    tags: ["기획", "아이디어"],
    starred: false,
    pinned: false,
    updated: "월요일",
    word: 256,
    excerpt: "타겟: 20-30대 직장인. 핵심 가치: 일과 삶의 분리…",
    body: `# 신규 프로젝트 — 아이디어 노트\n\n## 타겟\n- 20-30대 직장인\n- 출퇴근 1시간 이상\n\n## 핵심 가치\n> 일과 삶의 분리\n\n- 퇴근 후 알림 자동 차단\n- 주말엔 업무 데이터 안 보임\n- 휴가 모드`,
  },
  {
    id: 5,
    title: "책 — 『생각의 탄생』 발췌",
    folder: "study",
    tags: ["독서", "발췌"],
    starred: false,
    pinned: false,
    updated: "지난주",
    word: 521,
    excerpt: "관찰, 형상화, 추상, 패턴인식… 13가지 생각도구.",
    body: `# 『생각의 탄생』 — 핵심 정리\n\n## 13가지 생각도구\n1. 관찰\n2. 형상화\n3. 추상\n4. 패턴인식\n5. 패턴형성\n6. 유추\n7. 몸으로 생각하기\n8. 감정이입`,
  },
  {
    id: 6,
    title: "엄마 생신 선물 아이디어",
    folder: "personal",
    tags: ["가족", "선물"],
    starred: false,
    pinned: false,
    updated: "11.20",
    word: 84,
    excerpt: "캐시미어 머플러? 안마의자는 부담스럽고…",
    body: `# 엄마 생신 (12월 14일)\n\n## 후보\n- 캐시미어 머플러 (베이지 / 카멜)\n- 화분 — 다육이 좋아하심\n- 백화점 상품권`,
  },
  {
    id: 7,
    title: "인터뷰 준비 — 자주 받는 질문",
    folder: "study",
    tags: ["커리어"],
    starred: false,
    pinned: false,
    updated: "11.18",
    word: 402,
    excerpt: "본인 소개, 강점/약점, 갈등 해결 사례, 실패 경험…",
    body: `# 인터뷰 준비\n\n## 자주 받는 질문\n- 자기소개 (1분 / 3분 버전)\n- 강점과 약점\n- 갈등 해결 경험\n- 실패 경험과 배운 점\n\n## STAR 프레임워크\n- **S**ituation\n- **T**ask\n- **A**ction\n- **R**esult`,
  },
];

const FOLDERS: {
  id: FolderKey;
  label: string;
  icon: "note" | "star" | "folder" | "trash";
  count: number;
  color?: string;
}[] = [
  { id: "all", label: "전체 메모", icon: "note", count: 7 },
  { id: "starred", label: "즐겨찾기", icon: "star", count: 2 },
  { id: "work", label: "업무", icon: "folder", count: 2, color: "#e89aac" },
  { id: "personal", label: "개인", icon: "folder", count: 3, color: "#8ec0d6" },
  { id: "study", label: "공부 · 독서", icon: "folder", count: 2, color: "#a8d09b" },
  { id: "trash", label: "휴지통", icon: "trash", count: 0 },
];

const ALL_TAGS = [
  "디자인",
  "토큰",
  "회고",
  "성장",
  "카페",
  "주말",
  "기획",
  "아이디어",
  "독서",
  "가족",
  "커리어",
];

function FolderIcon({ name }: { name: "note" | "star" | "folder" | "trash" }) {
  const props = { size: 15 } as const;
  if (name === "note") return <IconNotes {...props} />;
  if (name === "star") return <IconStar {...props} />;
  if (name === "folder") return <IconFolder {...props} />;
  return <IconTrash {...props} />;
}

const folderColor = (id: Folder) =>
  ({ work: "#fde0e6", personal: "#dbecf5", study: "#dff0d2" }[id]);
const folderLabel = (id: Folder) =>
  ({ work: "업무", personal: "개인", study: "공부 · 독서" }[id]);

export function MemoPage() {
  const [folder, setFolder] = useState<FolderKey>("all");
  const [activeId, setActiveId] = useState<number>(1);
  const [memos, setMemos] = useState<Memo[]>(SEED_MEMOS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "title">("updated");

  const filtered = useMemo(() => {
    let list: Memo[] = memos;
    if (folder === "starred") list = list.filter((m) => m.starred);
    else if (folder === "trash") list = [];
    else if (folder !== "all") list = list.filter((m) => m.folder === folder);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => (m.title + m.excerpt).toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "ko");
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0;
    });
  }, [memos, folder, search, sort]);

  const active = memos.find((m) => m.id === activeId) ?? filtered[0] ?? null;

  const toggleStar = (id: number) =>
    setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));
  const togglePin = (id: number) =>
    setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
  const updateBody = (body: string) => {
    if (!active) return;
    setMemos((prev) => prev.map((m) => (m.id === active.id ? { ...m, body } : m)));
  };
  const updateTitle = (title: string) => {
    if (!active) return;
    setMemos((prev) => prev.map((m) => (m.id === active.id ? { ...m, title } : m)));
  };

  const newMemo = () => {
    const id = Date.now();
    const fallback: Folder =
      folder === "all" || folder === "starred" || folder === "trash" ? "personal" : folder;
    const m: Memo = {
      id,
      title: "제목 없는 메모",
      folder: fallback,
      tags: [],
      starred: false,
      pinned: false,
      updated: "방금",
      word: 0,
      excerpt: "",
      body: "# 제목 없는 메모\n\n",
    };
    setMemos([m, ...memos]);
    setActiveId(id);
  };

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 메모</div>
          <h1 className="wl-page-title">
            메모
            <span className="wl-page-title__hand">— 떠오를 때 곧바로 적어두세요</span>
          </h1>
          <div className="wl-page-sub">
            {memos.length}개의 장문 메모 · 마지막 편집 {active?.updated ?? "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="wl-timer-btn">
            <IconSearch size={14} /> 빠른 검색
          </button>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary" onClick={newMemo}>
            + 새 메모
          </button>
        </div>
      </div>

      <div className="wl-memo-layout">
        {/* COLUMN 1 — Folders */}
        <aside className="wl-memo-folders">
          <div className="wl-memo-side-h">폴더</div>
          <ul className="wl-folder-list">
            {FOLDERS.map((f) => (
              <li
                key={f.id}
                className={`wl-folder-item${folder === f.id ? " wl-folder-item--on" : ""}`}
                onClick={() => setFolder(f.id)}
              >
                <span className="wl-folder-ico" style={f.color ? { color: f.color } : undefined}>
                  <FolderIcon name={f.icon} />
                </span>
                <span className="wl-folder-label">{f.label}</span>
                <span className="wl-folder-count">{f.count}</span>
              </li>
            ))}
          </ul>

          <div className="wl-memo-side-h" style={{ marginTop: 22 }}>
            태그
          </div>
          <div className="wl-tag-cloud">
            {ALL_TAGS.map((t) => (
              <span key={t} className="wl-tag-pill">
                #{t}
              </span>
            ))}
          </div>

          <div className="wl-memo-quote">
            <span className="wl-memo-quote__mark">"</span>
            <p>적어두지 않은 생각은 사라진다. 손이 기억보다 정직하다.</p>
          </div>
        </aside>

        {/* COLUMN 2 — Memo list */}
        <section className="wl-memo-list-col">
          <div className="wl-memo-list-head">
            <div className="wl-memo-search">
              <IconSearch size={13} />
              <input
                placeholder="메모 검색…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="wl-memo-sort">
              {(
                [
                  ["updated", "최근순"],
                  ["title", "가나다"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={sort === k ? "wl-memo-sort--on" : ""}
                  onClick={() => setSort(k)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="wl-memo-list">
            {filtered.length === 0 && (
              <div className="wl-memo-empty">
                <div className="wl-hand" style={{ fontSize: 22, marginBottom: 6 }}>
                  비어있어요
                </div>
                <div>이 폴더엔 아직 메모가 없습니다.</div>
              </div>
            )}
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`wl-memo-card${activeId === m.id ? " wl-memo-card--on" : ""}`}
                onClick={() => setActiveId(m.id)}
              >
                <div className="wl-memo-card__head">
                  {m.pinned && <IconPinFilled size={12} />}
                  <h4>{m.title}</h4>
                  <button
                    type="button"
                    className={`wl-memo-star${m.starred ? " wl-memo-star--on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(m.id);
                    }}
                    aria-label="즐겨찾기"
                  >
                    {m.starred ? <IconStarFilled size={13} /> : <IconStar size={13} />}
                  </button>
                </div>
                <p className="wl-memo-excerpt">{m.excerpt}</p>
                <div className="wl-memo-meta">
                  <span>{m.updated}</span>
                  <span className="wl-dot-sep">·</span>
                  <span>{m.word}자</span>
                  <span className="wl-memo-tag-row">
                    {m.tags.slice(0, 2).map((t) => (
                      <span key={t} className="wl-memo-mini-tag">
                        #{t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMN 3 — Editor */}
        <section className="wl-memo-editor">
          {!active ? (
            <div className="wl-memo-empty wl-memo-empty--large">
              <div className="wl-hand" style={{ fontSize: 28 }}>
                메모를 골라주세요 →
              </div>
            </div>
          ) : (
            <>
              <div className="wl-memo-edit-head">
                <div className="wl-memo-edit-meta">
                  <span
                    className="wl-folder-chip"
                    style={{ background: folderColor(active.folder) }}
                  >
                    {folderLabel(active.folder)}
                  </span>
                  <span className="wl-memo-muted">최종 편집 · {active.updated}</span>
                  <span className="wl-memo-muted">·</span>
                  <span className="wl-memo-muted">{active.word}자</span>
                </div>
                <div className="wl-memo-edit-actions">
                  <button
                    type="button"
                    className="wl-memo-icon-btn"
                    onClick={() => togglePin(active.id)}
                    aria-label="고정"
                  >
                    {active.pinned ? <IconPinFilled size={15} /> : <IconPin size={15} />}
                  </button>
                  <button
                    type="button"
                    className="wl-memo-icon-btn"
                    onClick={() => toggleStar(active.id)}
                    aria-label="즐겨찾기"
                  >
                    {active.starred ? <IconStarFilled size={15} /> : <IconStar size={15} />}
                  </button>
                  <button type="button" className="wl-memo-icon-btn" aria-label="기록">
                    <IconHistory size={15} />
                  </button>
                  <button type="button" className="wl-memo-icon-btn" aria-label="공유">
                    <IconLink size={15} />
                  </button>
                  <button type="button" className="wl-memo-icon-btn" aria-label="더보기">
                    <IconDots size={15} />
                  </button>
                </div>
              </div>

              <div className="wl-memo-toolbar">
                <button type="button" aria-label="제목">
                  <IconH1 size={14} />
                </button>
                <button type="button" aria-label="굵게">
                  <IconBold size={14} />
                </button>
                <button type="button" aria-label="기울임">
                  <IconItalic size={14} />
                </button>
                <span className="wl-tb-sep" />
                <button type="button" aria-label="목록">
                  <IconList size={14} />
                </button>
                <button type="button" aria-label="체크리스트">
                  <IconCheck size={14} />
                </button>
                <button type="button" aria-label="인용">
                  <IconQuote size={14} />
                </button>
                <span className="wl-tb-sep" />
                <button type="button" aria-label="이미지">
                  <IconPhoto size={14} />
                </button>
                <button type="button" aria-label="링크">
                  <IconLink size={14} />
                </button>
                <span className="wl-tb-status">
                  <span className="wl-save-dot" /> 자동 저장됨
                </span>
              </div>

              <div className="wl-memo-paper">
                <input
                  className="wl-memo-title-in"
                  value={active.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="제목을 입력하세요…"
                />
                <div className="wl-memo-tag-edit">
                  {active.tags.map((t) => (
                    <span key={t} className="wl-memo-tag-chip">
                      #{t}
                      <button type="button" aria-label="태그 제거">×</button>
                    </span>
                  ))}
                  <button type="button" className="wl-memo-tag-add">
                    + 태그
                  </button>
                </div>
                <textarea
                  className="wl-memo-body"
                  value={active.body}
                  onChange={(e) => updateBody(e.target.value)}
                  placeholder="여기에 메모를 적어보세요. 마크다운을 지원합니다 — # 제목, **굵게**, - 목록…"
                  spellCheck={false}
                />
              </div>

              <div className="wl-memo-foot">
                <span className="wl-hand">손글씨처럼, 부담없이.</span>
                <div className="wl-memo-foot-stats">
                  <span>
                    <b>{active.body.length}</b>자
                  </span>
                  <span className="wl-dot-sep">·</span>
                  <span>
                    <b>{active.body.split(/\s+/).filter(Boolean).length}</b>단어
                  </span>
                  <span className="wl-dot-sep">·</span>
                  <span>
                    읽는 시간 <b>{Math.max(1, Math.round(active.body.length / 400))}</b>분
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </AuthRequiredWrapper>
  );
}
