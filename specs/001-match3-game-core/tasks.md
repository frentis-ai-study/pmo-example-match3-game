# Tasks: Match-3 게임 코어 기능

**Input**: Design documents from `/specs/001-match3-game-core/`
**Prerequisites**: plan.md (required), spec.md (required), research.md (required)

**Tests**: 테스트는 핵심 게임 로직에만 집중 (실용적 테스트 원칙)

**Organization**: 사용자 스토리별로 작업을 그룹화하여 각 스토리를 독립적으로 구현하고 테스트할 수 있도록 구성

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 사용자 스토리 레이블 (US1, US2, US3)
- 정확한 파일 경로 포함

## Path Conventions

- **프론트엔드 전용**: `src/`, `tests/` at repository root
- plan.md의 구조를 따름

---

## Phase 1: Setup (프로젝트 초기화)

**Purpose**: 프로젝트 구조 생성 및 개발 환경 설정

- [ ] T001 프로젝트 디렉토리 구조 생성 (src/, tests/, public/)
- [ ] T002 [P] package.json 생성 및 TypeScript 5.x 설정
- [ ] T003 [P] Vite 설정 파일 작성 (vite.config.ts)
- [ ] T004 [P] TypeScript 설정 파일 작성 (tsconfig.json)
- [ ] T005 [P] ESLint 및 Prettier 설정
- [ ] T006 [P] PixiJS v8.14.0 의존성 설치 (pnpm add pixi.js)
- [ ] T007 [P] 테스트 도구 설치 (pnpm add -D vitest @playwright/test)
- [ ] T008 [P] HTML 템플릿 작성 (src/index.html)

---

## Phase 2: Foundational (공통 인프라)

**Purpose**: 모든 사용자 스토리가 의존하는 핵심 인프라

**⚠️ CRITICAL**: 이 단계가 완료되어야 사용자 스토리 작업 시작 가능

- [ ] T009 [P] 타입 정의 파일 작성 (src/types.ts) - BlockType, Position, GamePhase 등
- [ ] T010 [P] Logger 유틸리티 구현 (src/utils/Logger.ts)
- [ ] T011 [P] EventBus 유틸리티 구현 (src/utils/EventBus.ts)
- [ ] T012 메인 진입점 작성 (src/main.ts) - PixiJS Application 초기화
- [ ] T013 [P] Vitest 설정 파일 작성 (vitest.config.ts)
- [ ] T014 [P] Playwright 설정 파일 작성 (playwright.config.ts)

**Checkpoint**: 기본 인프라 준비 완료 - 사용자 스토리 구현 시작 가능

---

## Phase 3: User Story 1 - 기본 게임 플레이 (Priority: P1) 🎯 MVP

**Goal**: 블록 스와이프, 매칭, 제거, 점수 획득 - 게임의 핵심 메커니즘

**Independent Test**: 게임 시작 → 블록 스와이프 → 3개 매칭 → 블록 제거 → 점수 증가 확인

### Tests for User Story 1 (핵심 로직만)

> **NOTE: 테스트를 먼저 작성하고 FAIL 확인 후 구현**

- [ ] T015 [P] [US1] MatchDetector 유닛 테스트 작성 (tests/unit/MatchDetector.test.ts)
- [ ] T016 [P] [US1] ScoreCalculator 유닛 테스트 작성 (tests/unit/ScoreCalculator.test.ts)
- [ ] T017 [P] [US1] Grid 유닛 테스트 작성 (tests/unit/Grid.test.ts)

### Implementation for User Story 1

- [ ] T018 [P] [US1] Block 엔티티 구현 (src/game/Block.ts) - 타입, 위치 속성
- [ ] T019 [P] [US1] GameState 클래스 구현 (src/game/GameState.ts) - 점수, 상태 관리
- [ ] T020 [US1] Grid 클래스 구현 (src/game/Grid.ts) - 8x8 그리드 생성 및 블록 배치
- [ ] T021 [US1] Grid에 블록 교환 메서드 추가 (src/game/Grid.ts::swapBlocks)
- [ ] T022 [US1] MatchDetector 구현 (src/game/MatchDetector.ts) - 수평/수직 3개 이상 감지
- [ ] T023 [US1] ScoreCalculator 구현 (src/game/ScoreCalculator.ts) - 3개, 4개, 콤보 점수 계산
- [ ] T024 [US1] Grid에 블록 제거 메서드 추가 (src/game/Grid.ts::removeBlocks)
- [ ] T025 [US1] Grid에 중력 효과 구현 (src/game/Grid.ts::applyGravity)
- [ ] T026 [US1] Grid에 새 블록 생성 추가 (src/game/Grid.ts::fillEmptySpaces)
- [ ] T027 [P] [US1] Renderer 기본 구조 구현 (src/rendering/Renderer.ts) - PixiJS Application 래퍼
- [ ] T028 [US1] Renderer에 그리드 렌더링 추가 (src/rendering/Renderer.ts::renderGrid)
- [ ] T029 [P] [US1] AnimationController 구현 (src/rendering/AnimationController.ts) - 블록 이동/제거 애니메이션
- [ ] T030 [P] [US1] InputHandler 구현 (src/rendering/InputHandler.ts) - 마우스/터치 스와이프 감지
- [ ] T031 [US1] GameScreen 기본 구조 구현 (src/ui/GameScreen.ts)
- [ ] T032 [US1] GameScreen에 게임 루프 통합 (src/ui/GameScreen.ts::gameLoop) - requestAnimationFrame
- [ ] T033 [US1] 블록 이미지/스프라이트 준비 (public/assets/blocks/) - 5-7가지 색상
- [ ] T034 [US1] 연쇄 반응(콤보) 감지 및 처리 로직 추가 (src/game/Grid.ts::processCascades)

**Checkpoint**: MVP 완성 - 블록 스와이프하여 매칭 및 점수 획득 가능

---

## Phase 4: User Story 2 - 게임 세션 관리 (Priority: P2)

**Goal**: 게임 시작, 일시정지, 재개, 게임 오버 처리

**Independent Test**: 시작 버튼 → 플레이 → 일시정지 → 재개 → 게임 오버 확인

### Tests for User Story 2

- [ ] T035 [P] [US2] GameState 전환 테스트 작성 (tests/unit/GameState.test.ts)
- [ ] T036 [P] [US2] StorageManager 테스트 작성 (tests/unit/StorageManager.test.ts)

### Implementation for User Story 2

- [ ] T037 [P] [US2] PauseScreen 컴포넌트 구현 (src/ui/PauseScreen.ts)
- [ ] T038 [P] [US2] GameOverScreen 컴포넌트 구현 (src/ui/GameOverScreen.ts)
- [ ] T039 [US2] GameState에 일시정지/재개 로직 추가 (src/game/GameState.ts::pause/resume)
- [ ] T040 [US2] 게임 오버 조건 감지 추가 (src/game/Grid.ts::hasValidMoves)
- [ ] T041 [US2] GameScreen에 시작 버튼 통합 (src/ui/GameScreen.ts)
- [ ] T042 [US2] GameScreen에 일시정지 버튼 통합 (src/ui/GameScreen.ts)
- [ ] T043 [US2] GameScreen에 게임 오버 처리 통합 (src/ui/GameScreen.ts)
- [ ] T044 [P] [US2] StorageManager 구현 (src/storage/StorageManager.ts) - localStorage 저장/복구
- [ ] T045 [US2] 게임 상태 자동 저장 로직 추가 (src/game/GameState.ts::save)
- [ ] T046 [US2] 페이지 로드 시 상태 복구 추가 (src/main.ts::restore)

**Checkpoint**: 완전한 게임 세션 흐름 - 시작부터 종료까지 제어 가능

---

## Phase 5: User Story 3 - 진행상황 표시 (Priority: P3)

**Goal**: 실시간 점수 및 게임 정보 UI 표시

**Independent Test**: 플레이 중 UI에서 점수, 콤보 정보 정확히 업데이트되는지 확인

### Implementation for User Story 3

- [ ] T047 [P] [US3] 점수 표시 UI 컴포넌트 작성 (src/ui/ScoreDisplay.ts)
- [ ] T048 [P] [US3] 콤보 카운터 UI 컴포넌트 작성 (src/ui/ComboCounter.ts)
- [ ] T049 [US3] GameScreen에 ScoreDisplay 통합 (src/ui/GameScreen.ts)
- [ ] T050 [US3] GameScreen에 ComboCounter 통합 (src/ui/GameScreen.ts)
- [ ] T051 [US3] EventBus를 통한 점수 업데이트 이벤트 연결
- [ ] T052 [US3] EventBus를 통한 콤보 이벤트 연결

**Checkpoint**: 모든 사용자 스토리 완성 - 완전한 게임 경험 제공

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 품질 개선 및 성능 최적화

- [ ] T053 [P] 블록 이미지 최적화 (압축, 스프라이트 시트)
- [ ] T054 [P] E2E 테스트 작성 (tests/e2e/gameplay.spec.ts) - 전체 플레이 시나리오
- [ ] T055 성능 프로파일링 및 60fps 검증
- [ ] T056 [P] 메모리 누수 점검 및 리소스 정리 추가
- [ ] T057 [P] 에러 바운더리 및 로깅 강화
- [ ] T058 [P] 반응형 디자인 검증 (모바일/데스크톱)
- [ ] T059 [P] 브라우저 호환성 테스트 (Chrome, Firefox, Safari, Edge)
- [ ] T060 [P] 코드 리뷰 및 리팩토링
- [ ] T061 [P] README.md 작성 - 설치, 실행, 빌드 방법

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 필요 - **모든 US를 BLOCK**
- **User Stories (Phase 3-5)**: Foundational 완료 필요
  - US1 (Phase 3): Foundational 이후 즉시 시작 가능
  - US2 (Phase 4): US1 완료 필요 (GameState 의존)
  - US3 (Phase 5): US1, US2 완료 필요 (점수 및 세션 관리 의존)
- **Polish (Phase 6)**: 모든 US 완료 필요

### User Story Dependencies

```
Setup → Foundational → US1 (MVP) → US2 → US3 → Polish
                         ↓
                       독립 테스트 가능
```

- **US1 (P1)**: Foundational 이후 시작, 독립 테스트 가능
- **US2 (P2)**: US1의 GameState 필요, US1 완료 후 시작
- **US3 (P3)**: US1/US2 완료 후 시작 (UI 표시를 위한 데이터 필요)

### Within Each User Story

1. 테스트 먼저 작성 → FAIL 확인
2. 엔티티/모델 구현
3. 게임 로직 구현
4. 렌더링 및 UI 통합
5. 스토리 독립 검증

### Parallel Opportunities

- **Setup (Phase 1)**: T002-T008 모두 병렬 실행 가능
- **Foundational (Phase 2)**: T009-T011, T013-T014 병렬 가능
- **US1 Tests**: T015-T017 병렬 실행 가능
- **US1 Models**: T018-T019 병렬 실행 가능
- **US1 Rendering**: T027, T029, T030 병렬 가능
- **US2 Tests/UI**: T035-T038 병렬 가능
- **US3 UI**: T047-T048 병렬 가능
- **Polish**: T053-T054, T056-T061 대부분 병렬 가능

---

## Parallel Example: User Story 1 테스트

```bash
# US1 테스트를 동시에 실행:
- [ ] T015 [P] [US1] MatchDetector 유닛 테스트 작성
- [ ] T016 [P] [US1] ScoreCalculator 유닛 테스트 작성
- [ ] T017 [P] [US1] Grid 유닛 테스트 작성

# US1 모델을 동시에 실행:
- [ ] T018 [P] [US1] Block 엔티티 구현
- [ ] T019 [P] [US1] GameState 클래스 구현
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (CRITICAL - 모든 US를 BLOCK)
3. Phase 3: User Story 1 완료
4. **STOP and VALIDATE**: US1 독립 테스트
5. 필요시 배포/데모

### Incremental Delivery

1. Setup + Foundational → 인프라 준비
2. US1 추가 → 독립 테스트 → 배포 (MVP!)
3. US2 추가 → 독립 테스트 → 배포 (세션 관리)
4. US3 추가 → 독립 테스트 → 배포 (UI 완성)
5. Polish → 최종 품질 검증 → 프로덕션 배포

### Parallel Team Strategy

여러 개발자가 있는 경우:

1. 팀이 Setup + Foundational을 함께 완료
2. Foundational 완료 후:
   - Developer A: US1 (MVP)
   - Developer B: US2 준비 (US1 완료 대기)
   - Developer C: US3 준비 (US1/US2 완료 대기)
3. 순차적 통합 (US1 → US2 → US3)

---

## Notes

- **[P]** = 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[USX]** = 사용자 스토리 레이블 (추적 용이)
- 각 사용자 스토리는 독립적으로 완성 및 테스트 가능
- 테스트는 구현 전 작성하여 FAIL 확인
- 각 작업 또는 논리적 그룹 완료 후 커밋
- 체크포인트마다 스토리 독립 검증
- 회피: 모호한 작업, 동일 파일 충돌, 스토리 독립성 깨는 의존성

---

## 작업 통계

- **총 작업 수**: 61개
- **US1 (MVP)**: 20개 작업
- **US2**: 12개 작업
- **US3**: 6개 작업
- **병렬 실행 가능**: 약 30개 작업 (49%)
- **예상 소요 시간**:
  - MVP (US1): 2-3주
  - 전체 (US1+US2+US3): 4-5주
  - Polish 포함: 5-6주
