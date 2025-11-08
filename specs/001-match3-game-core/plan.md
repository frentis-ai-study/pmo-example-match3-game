# Implementation Plan: Match-3 게임 코어 기능

**Branch**: `001-match3-game-core` | **Date**: 2025-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-match3-game-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

애니팡 스타일의 Match-3 퍼즐 게임을 프론트엔드 전용으로 구현합니다. 사용자는 8x8 그리드에서 블록을 스와이프하여 3개 이상 매칭시켜 제거하고 점수를 획득합니다. 게임은 Canvas API 또는 HTML5 기반으로 렌더링되며, 모든 상태는 로컬 스토리지에 저장됩니다. 60fps 성능과 100ms 이내 반응성을 목표로 하며, 백엔드 없이 브라우저만으로 동작합니다.

## Technical Context

**Language/Version**: TypeScript 5.x (또는 JavaScript ES2022+)
**Primary Dependencies**: NEEDS CLARIFICATION - Canvas rendering library or framework (PixiJS vs Phaser vs vanilla Canvas)
**Storage**: 브라우저 localStorage (게임 상태 저장)
**Testing**: Vitest (유닛 테스트) + Playwright (E2E 테스트)
**Target Platform**: 웹 브라우저 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Single-page web application
**Performance Goals**: 60fps 렌더링, 100ms 입력 반응, 3초 이내 초기 로딩
**Constraints**: 클라이언트 사이드 전용 (서버 불필요), 오프라인 플레이 가능, 모바일/데스크톱 반응형
**Scale/Scope**: 단일 게임 화면, 8x8 그리드, 5-7가지 블록 타입, 로컬 단일 플레이어

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 단순성 우선 (Simplicity First / YAGNI)
- [x] 현재 요구사항에 필요한 기능만 포함되었는가? - 코어 게임플레이만 구현
- [x] 프론트엔드 전용 게임으로, 백엔드/서버 로직이 없는가? - 완전히 클라이언트 사이드
- [x] 로컬 스토리지나 브라우저 API만으로 데이터 관리가 가능한가? - localStorage 사용
- [x] 불필요한 추상화가 포함되지 않았는가? - 필요 시 리팩토링
- [?] 새로운 의존성이 명확한 가치를 제공하는가? - 렌더링 라이브러리 선택 필요 (Phase 0에서 결정)
- [x] 복잡성 증가가 Complexity Tracking에 문서화되었는가? - 현재 복잡성 없음

### II. 실용적 테스트 (Pragmatic Testing)
- [x] 핵심 게임 로직(매칭, 점수, 상태 전이)에 대한 테스트 계획이 있는가? - Vitest로 유닛 테스트
- [x] 로컬 스토리지 처리 테스트가 포함되었는가? - 상태 저장/복구 테스트
- [x] 테스트 범위가 ROI를 고려하여 적절한가? - 게임 로직 중심, UI는 최소

### III. 성능과 반응성 (Performance & Responsiveness)
- [x] 60fps 렌더링 목표가 고려되었는가? - requestAnimationFrame 사용
- [x] 사용자 입력 반응성(100ms 이내)이 설계에 반영되었는가? - 이벤트 즉시 처리
- [x] 초기 로딩 시간(3초 이내) 목표가 있는가? - Vite 번들링으로 최적화
- [x] 리소스 정리 및 메모리 관리 계획이 있는가? - 이벤트 리스너 정리
- [x] 다양한 디바이스/브라우저 호환성이 고려되었는가? - 반응형 디자인

### IV. 관찰 가능성 (Observability)
- [x] 구조화된 로깅 전략이 정의되었는가? - console + 로컬 로그 저장
- [x] 주요 게임 이벤트 추적 계획이 있는가? - 매칭, 점수, 게임오버 이벤트 로깅
- [x] 디버그 모드 및 에러 리포팅 전략이 있는가? - 개발자 도구 + 에러 경계 처리

**Gate Status**: ⚠️ 1개 항목 보류 (렌더링 라이브러리 선택) - Phase 0 리서치 필요

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── game/
│   ├── Block.ts              # 블록 엔티티 (타입, 위치)
│   ├── Grid.ts               # 8x8 그리드 관리 (배치, 이동, 제거)
│   ├── GameState.ts          # 게임 상태 (점수, 일시정지, 게임오버)
│   ├── MatchDetector.ts      # 매칭 감지 알고리즘
│   └── ScoreCalculator.ts    # 점수 계산 로직
├── rendering/
│   ├── Renderer.ts           # Canvas 또는 라이브러리 렌더러
│   ├── AnimationController.ts # 블록 이동/제거 애니메이션
│   └── InputHandler.ts       # 마우스/터치 입력 처리
├── storage/
│   └── StorageManager.ts     # localStorage 저장/복구
├── ui/
│   ├── GameScreen.ts         # 메인 게임 화면
│   ├── PauseScreen.ts        # 일시정지 화면
│   └── GameOverScreen.ts     # 게임오버 화면
├── utils/
│   ├── Logger.ts             # 로깅 유틸리티
│   └── EventBus.ts           # 이벤트 pub/sub
├── main.ts                   # 앱 진입점
└── index.html                # HTML 템플릿

tests/
├── unit/
│   ├── MatchDetector.test.ts
│   ├── ScoreCalculator.test.ts
│   ├── Grid.test.ts
│   └── StorageManager.test.ts
└── e2e/
    └── gameplay.spec.ts

public/
└── assets/
    └── blocks/               # 블록 이미지/스프라이트
```

**Structure Decision**: 단일 프론트엔드 프로젝트 구조를 선택했습니다. 게임 로직(`game/`), 렌더링(`rendering/`), 저장소(`storage/`), UI(`ui/`)로 명확히 분리하여 테스트와 유지보수가 용이하도록 설계했습니다. 백엔드가 없으므로 모든 코드는 `src/` 디렉토리 안에 위치합니다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
