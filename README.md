# Match-3 Game Core

[![Deploy to GitHub Pages](https://github.com/frentis-ai-study/pmo-example-match3-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/frentis-ai-study/pmo-example-match3-game/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-v8.14.0-e91e63.svg)](https://pixijs.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-orange.svg)](https://pnpm.io/)

**🎮 [게임 플레이하기](https://frentis-ai-study.github.io/pmo-example-match3-game/)**

## 프로젝트 소개

이 프로젝트는 **한국PMO협회 PMO 전문가과정 "바이브 코딩 시대의 SDLC 혁신 전략"**의 데모 프로젝트입니다.

AI 기반 개발 도구(Claude Code)와 Specification-Driven Development를 활용하여 Match-3 퍼즐 게임을 구현했습니다.
PixiJS v8를 사용한 WebGL 렌더링과 애니팡과 유사한 블록 매칭 메커니즘을 포함합니다.

### 개발 방법론

- **Specification-Driven Development**: 명확한 스펙 정의부터 시작
- **AI Pair Programming**: Claude Code를 활용한 협업 개발
- **Test-Driven Development**: 테스트 우선 접근
- **Incremental Delivery**: 사용자 스토리별 점진적 구현

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

## 제작 정보

### 교육 프로그램

이 프로젝트는 **한국PMO협회 PMO 전문가과정**의 일환으로 제작되었습니다.

- **과정명**: "바이브 코딩 시대의 SDLC 혁신 전략"
- **주관**: 한국PMO협회
- **목적**: AI 기반 개발 도구를 활용한 소프트웨어 개발 프로세스 혁신 시연

### 개발 프로세스

이 프로젝트는 다음과 같은 현대적인 개발 방법론을 적용했습니다:

1. **Specification 작성** (`/speckit.specify`)
   - 자연어로 기능 설명
   - AI가 구조화된 스펙 문서 생성

2. **구현 계획 수립** (`/speckit.plan`)
   - 기술 스택 선정 (PixiJS v8)
   - 아키텍처 설계
   - 리스크 분석

3. **작업 분해** (`/speckit.tasks`)
   - 61개의 세부 작업으로 분해
   - 6개 Phase로 구조화
   - 의존성 및 병렬 실행 계획

4. **점진적 구현** (`/speckit.implement`)
   - Phase 1-2: 프로젝트 Setup 및 인프라
   - Phase 3: US1 - 기본 게임플레이 (MVP)
   - Phase 4: US2 - 게임 세션 관리
   - Phase 5: US3 - 진행상황 표시
   - Phase 6: 테스트 및 문서화

### 개발 도구

- **AI Assistant**: Claude Code (Anthropic)
- **Specification Framework**: Speckit
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages

### 성과

- ✅ 6개 Phase 완료 (총 61개 작업)
- ✅ 30개 E2E 테스트 통과 (Chromium, Firefox, WebKit)
- ✅ 자동 배포 파이프라인 구축
- ✅ 완전한 프로젝트 문서화
- 📊 총 개발 시간: AI와 협업으로 대폭 단축

---

**💡 이 프로젝트는 AI 기반 개발 도구가 어떻게 소프트웨어 개발 프로세스를 혁신할 수 있는지 보여주는 실전 사례입니다.**
