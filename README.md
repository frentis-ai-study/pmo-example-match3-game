# Match-3 Game Core

PixiJS v8를 사용한 Match-3 퍼즐 게임입니다. 애니팡과 유사한 블록 매칭 메커니즘을 구현했습니다.

## 주요 기능

- **블록 매칭**: 8x8 그리드에서 3개 이상의 같은 색 블록 매칭
- **연쇄 반응**: 블록 제거 후 중력 효과 및 자동 콤보 감지
- **점수 시스템**: 기본 점수, 4개/5개 매칭 보너스, 콤보 보너스
- **게임 세션**: 시작, 일시정지, 재개, 게임 오버, 재시작
- **진행상황 표시**: 실시간 점수, 이동 횟수, 콤보 카운터
- **상태 저장**: LocalStorage를 사용한 자동 저장 및 복구

## 기술 스택

- **Language**: TypeScript 5.x
- **Rendering**: PixiJS v8.14.0 (WebGL)
- **Build Tool**: Vite 5.x
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Package Manager**: pnpm 8.x

## 요구사항

- Node.js 18.x 이상
- pnpm 8.x 이상

## 설치

```bash
# 의존성 설치
pnpm install
```

## 실행

### 개발 서버

```bash
# 개발 서버 시작 (http://localhost:3000)
pnpm run dev
```

### 프로덕션 빌드

```bash
# TypeScript 컴파일 및 프로덕션 빌드
pnpm run build

# 빌드 결과는 dist/ 디렉토리에 생성됩니다
```

### 빌드 미리보기

```bash
# 프로덕션 빌드 로컬 미리보기
pnpm run preview
```

## 테스트

### 유닛 테스트

```bash
# Vitest 실행
pnpm run test

# Watch 모드로 실행
pnpm run test -- --watch
```

### E2E 테스트

```bash
# Playwright E2E 테스트 실행
pnpm run test:e2e

# UI 모드로 실행
pnpm run test:e2e -- --ui

# 특정 브라우저만 테스트
pnpm run test:e2e -- --project=chromium
```

## 프로젝트 구조

```
src/
├── game/              # 게임 로직
│   ├── Block.ts       # 블록 엔티티
│   ├── GameState.ts   # 게임 상태 관리
│   ├── Grid.ts        # 8x8 그리드 관리
│   ├── MatchDetector.ts   # 매칭 감지
│   └── ScoreCalculator.ts # 점수 계산
├── rendering/         # 렌더링 시스템
│   ├── Renderer.ts            # PixiJS 래퍼
│   ├── AnimationController.ts # 애니메이션 관리
│   └── InputHandler.ts        # 입력 처리 (마우스/터치)
├── ui/                # UI 컴포넌트
│   ├── GameScreen.ts      # 메인 게임 화면
│   ├── PauseScreen.ts     # 일시정지 화면
│   ├── GameOverScreen.ts  # 게임 오버 화면
│   └── ComboCounter.ts    # 콤보 카운터
├── storage/           # 저장 시스템
│   └── StorageManager.ts  # LocalStorage 관리
├── utils/             # 유틸리티
│   ├── Logger.ts      # 로깅
│   └── EventBus.ts    # 이벤트 버스 (pub/sub)
├── types.ts           # 타입 정의
└── main.ts            # 진입점

tests/
├── unit/              # 유닛 테스트
│   ├── GameState.test.ts
│   ├── Grid.test.ts
│   ├── MatchDetector.test.ts
│   ├── ScoreCalculator.test.ts
│   └── StorageManager.test.ts
└── e2e/               # E2E 테스트
    └── gameplay.spec.ts
```

## 게임 방법

1. **블록 교환**: 인접한 두 블록을 드래그하여 교환합니다
2. **매칭**: 수평 또는 수직으로 3개 이상 같은 색 블록을 매칭합니다
3. **연쇄**: 블록 제거 후 중력 효과로 새로운 매칭이 생성되어 콤보를 만듭니다
4. **점수**:
   - 3개 매칭: 30점
   - 4개 매칭: 40점 + 20 보너스
   - 5개 이상 매칭: 50점 + 50 보너스
   - 콤보: 추가로 콤보 카운트 × 5점

## 아키텍처

### 디자인 패턴

- **Singleton**: Logger, EventBus, StorageManager
- **Event-Driven**: EventBus를 통한 컴포넌트 간 통신
- **Entity-Component**: 게임 로직, 렌더링, UI 레이어 분리

### 게임 루프

```
사용자 스와이프
  ↓
블록 교환 + 애니메이션
  ↓
매칭 감지
  ↓
매칭 없음? → 교환 되돌리기
  ↓
매칭 있음? → 연쇄 처리 시작
  ↓
┌─────────────────┐
│ 블록 제거       │
│ 점수 계산       │
│ 중력 적용       │
│ 빈 공간 채우기   │
│ 매칭 재확인     │
└─────────────────┘
  ↓
더 이상 매칭 없음? → 입력 활성화
```

## 개발 도구

### TypeScript 타입 체크

```bash
pnpm tsc --noEmit
```

### 코드 포맷팅

```bash
# Prettier 실행 (설정에 따라)
pnpm run format
```

### 린팅

```bash
# ESLint 실행 (설정에 따라)
pnpm run lint
```

## 브라우저 호환성

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)

WebGL을 지원하는 모든 최신 브라우저에서 작동합니다.

## 성능 목표

- 60 FPS 유지
- 블록 애니메이션 부드러운 전환
- 즉각적인 입력 반응

## 라이선스

MIT License

## 제작

이 프로젝트는 Specify 템플릿과 Claude Code를 사용하여 구현되었습니다.

- Specification 기반 개발
- TDD (Test-Driven Development) 접근
- 사용자 스토리별 점진적 구현
