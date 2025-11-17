# WorkLife Dashboard – Recommended Tracking Events

대시보드 주요 기능을 계측하기 위한 이벤트 정의 모음입니다. 각 이벤트는 **언제 발행할지**, **필요한 파라미터**, **활용 목적**을 함께 정리했습니다.  
이 문서는 `analytics.track(eventName, payload)` 같은 래퍼를 기준으로 작성되었으며, 실제 구현 시 공통 유틸을 통해 dispatch 하길 권장합니다.

## 1. Dashboard & Notes

| 이벤트 이름 | 트리거 위치 | 주요 파라미터 | 목적 |
| --- | --- | --- | --- |
| `dashboard_widget_reordered` | `DashboardPage.tsx` `handleDragEnd` 후 | `widget_id`, `from_index`, `to_index`, `layout_size` | 위젯 커스터마이징 패턴, 인기 위젯 포지션 파악 |
| `sticky_note_saved` | `StickyNotes.tsx` `handleCreate`/`handleUpdate` 성공 시 | `action`(`create`/`update`), `color`, `position`, `char_count` | 메모 기능 활용도, 최대 3개 제한 도달 비율 분석 |
| `checklist_item_completed` | `DashboardChecklist.tsx` 토글 시 | `item_id`, `is_completed`, `list_count`, `item_age_days` | 할 일 완료율과 재오픈 빈도 추적 |
| `pomodoro_session_completed` | `PomodoroTimerCard.tsx`에서 포커스 세션 종료 시 | `focus_duration`, `auto_start_flags`, `completed_sessions_today` | 생산성 도구 실제 사용량과 반복 패턴 측정 |
| `note_saved` | `NotesPage.tsx` `handleSubmit` 성공 시 | `mode`(`create`/`edit`), `note_type`, `visibility`, `tags_count`, `source`(`template`/`blank`) | 어떤 노트 유형·소재가 리텐션에 기여하는지 분석 |

## 2. Finance & Calculators

| 이벤트 이름 | 트리거 위치 | 주요 파라미터 | 목적 |
| --- | --- | --- | --- |
| `transactions_tab_changed` | `TransactionsPage.tsx` `setActiveTab` 직후 | `tab_id`, `month`, `payday` | 탭별 체류 시간, 신기능 도입 시 A/B 기초 데이터 |
| `payday_cycle_adjusted` | `TransactionsPage.tsx` & `useFinanceSettingsStore.ts`에서 월급일 변경 시 | `old_payday`, `new_payday`, `week_starts_on` | 급여 주기 설정 변경과 통계 위젯 이탈 지점 분석 |
| `budget_created` | `BudgetsTab.tsx` 예산 생성 성공 시 | `category_id`, `amount`, `month`, `had_existing_budget` | 어떤 카테고리 예산이 반복 생성되는지 파악 |
| `loan_calculator_calculated` | `LoanCalculatorWidget.tsx`에서 유효 계산 시 | `repayment_type`, `loan_amount`, `total_months`, `grace_months` | 금융 도구 입력 분포와 인기 시나리오 파악 |
| `salary_calculator_calculated` | `SalaryCalculatorPage.tsx`에서 `calculateSalary` 재실행 시 | `employment_type`(옵션), `allowances_enabled`, `tax_profile`, `was_reset` | 급여 계산 기능 활용 방식과 옵션 조합 분석 |

## 3. Auth & Settings

| 이벤트 이름 | 트리거 위치 | 주요 파라미터 | 목적 |
| --- | --- | --- | --- |
| `auth_login_submitted` | `LoginPage.tsx` `handleSubmit` | `method`(`email`/`google`), `remember_me`, `result`(`success`/`error`) | 인증 퍼널 실패 지점 실시간 파악 |
| `auth_signup_completed` | `SignupPage.tsx` `register` 성공 시 | `password_strength_bucket`, `agreed_terms`, `has_marketing_opt_in`(있다면) | 온보딩 마찰 지점·비밀번호 정책 검증 |
| `settings_saved` | `SettingsPage.tsx` `handleSubmit` 성공 시 | `sections_touched`, `dirty_fields_count`, `duration_ms` | 실제로 변경되는 설정군과 저장 소요 시간 측정 |
| `settings_reset_clicked` | `SettingsPage.tsx` `handleReset` | `had_unsaved_changes`, `sections_reset` | 저장 전 이탈 행동, UI 복잡도 개선 근거 확보 |

## 4. 구현 팁

- **공통 유틸 작성**: `lib/analytics.ts`에 `track(event, payload)`를 정의하고, Mantine 알림/모달 등 주요 UI 훅에서 재사용하면 누락을 줄일 수 있습니다.
- **에러 케이스 포함**: API 실패 시 `result: "error"`와 `error_code`를 추가하면 품질 지표를 바로 연결할 수 있습니다.
- **PII 주의**: 이메일·금액 등 민감 데이터는 해시 또는 구간(bucket) 단위로만 전송하세요.
- **샘플링 전략**: 고빈도 이벤트(예: 위젯 드래그)에는 샘플 비율을 두거나 debounce를 활용해 데이터 폭주를 방지합니다.
