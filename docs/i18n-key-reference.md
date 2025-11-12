# i18n Key Reference

다국어 리소스를 효율적으로 관리하기 위한 공통 규칙을 정의한다. 모든 신규 UI/복합 메시지는 아래 표준을 따른다.

## 1. 네임스페이스 전략
- 화면/도메인 단위로 네임스페이스를 정의한다: `dashboard`, `notes`, `finance`, `settings`, `system`, `auth`, `widgets`.
- 중첩 구조는 `.` 구분자를 사용하고, 최대 3단계까지 허용한다. 예) `dashboard.widgets.timer.start`.
- 재사용이 잦은 짧은 텍스트는 `common` 네임스페이스를 사용한다(`common.actions.save` 등).

## 2. 키 작성 규칙
1. `{namespace}:{component}.{slot}` 형태를 기본으로 하고, 필요한 경우 상태·변형을 후미에 붙인다.  
   - 예: `settings:language.selector.label`, `notes:editor.placeholder.empty`.
2. slot 이름은 snake_case 대신 dot 구분 소문자 kebab-case를 사용하지 않는다. 단어별 소문자 + 점(`.`)만 허용한다.
3. 변수 치환이 필요한 경우 mustache 패턴을 사용한다. 예: `{{count}}`, `{{name}}`.
4. HTML 태그 삽입이 필요한 경우 RichText 컴포넌트(React)나 템플릿 헬퍼에 맡기고, 문자열에는 마크업을 넣지 않는다.

## 3. 번역 워크플로우 체크리스트
- [ ] 새 문자열 추가 시 `docs/i18n-key-reference.md` 기준으로 키 생성
- [ ] `client/src/locales/<lang>/<namespace>.json`에 동일 키 추가
- [ ] `scripts/i18n:extract` 실행하여 누락된 키가 없는지 확인
- [ ] PR 설명에 추가/변경된 키 목록 명시
- [ ] QA가 각 언어에서 UI 깨짐/길이 문제를 확인

## 4. 네임스페이스별 예시
| Namespace | 샘플 키 | 설명 |
| --- | --- | --- |
| `common` | `common.actions.save` | 공통 버튼/액션 |
| `dashboard` | `dashboard.widgets.timer.start` | 대시보드 타이머 위젯 |
| `notes` | `notes.editor.wordCount` | 노트 편집기 |
| `finance` | `finance.cashflow.calendarEmpty` | 재무/현금 흐름 |
| `settings` | `settings.language.selector.label` | 환경 설정 |
| `system` | `system.errors.network` | 글로벌 시스템 메시지 |

## 5. 파일 구조
```
client/src/locales/
  ko/
    common.json
    dashboard.json
    ...
  en/
    common.json
    dashboard.json
    ...
server/src/locales/
  ko.json
  en.json
```

## 6. 린트 & 추출 스크립트
- `npm run i18n:extract`: `scripts/i18n/extract.mjs` 실행, 코드 내 `t("namespace:key")` 패턴을 추출해 레퍼런스 목록 생성.
- `npm run i18n:lint`: `scripts/i18n/lint.mjs` 실행, 언어별 JSON 구조 차이 및 누락 키 검사.

> 추후 언어가 추가될 때는 위 파일 구조를 그대로 확장하고, `scripts/i18n/config.mjs`에 언어 코드를 등록한다.
