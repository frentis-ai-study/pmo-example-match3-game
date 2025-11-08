<!--
Sync Impact Report:
- Version: 2.0.0 → 2.1.0
- Change Type: MINOR (Removed Python/backend environment specs - non-breaking refinement)
- Modified Sections:
  * Development Environment: Removed Python backend tooling
  * Technology Stack: Frontend-only (JavaScript/TypeScript with pnpm)
  * Documentation: Changed "API" → "game mechanism" (frontend terminology)
- Previous Changes (v2.0.0):
  * REMOVED: I. Layered Architecture (backend-heavy, not suitable for frontend-only game)
  * RENUMBERED: II → I, III → II, IV → III, V → IV
  * ENHANCED: I. Simplicity First - strengthened for frontend-focused development
- Added Sections: N/A
- Removed Sections:
  * Python project development environment
  * Backend/server related tooling references
- Templates Status:
  ✅ plan-template.md (no changes needed - already updated in v2.0.0)
  ✅ spec-template.md (no changes needed)
  ✅ tasks-template.md (no changes needed)
  ✅ agent-file-template.md (no changes needed)
  ✅ checklist-template.md (no changes needed)
- Follow-up TODOs: None
- Ratification Date: 2025-11-07 (original)
- Amendment Reason: Complete removal of backend tooling and Python references for pure frontend game
-->

# PMO2 게임 프로젝트 Constitution

## Core Principles

### I. 단순성 우선 (Simplicity First / YAGNI)

필요한 것만 구현하고, 과도한 추상화를 지양해야 합니다.

**비협상 규칙:**
- 현재 요구사항에 필요하지 않은 기능은 구현하지 않아야 함
- 프론트엔드 전용 게임으로, 백엔드나 복잡한 서버 로직은 포함하지 않음
- 추상화는 실제로 3번 이상 반복되는 패턴이 확인된 후에만 도입해야 함
- 새로운 의존성 추가는 명확한 가치 제공이 입증된 경우에만 허용됨
- 복잡성이 증가하는 모든 결정은 Complexity Tracking 테이블에 문서화되어야 함
- 로컬 스토리지나 브라우저 API만 사용하여 데이터 관리

**근거:** 프론트엔드 중심 게임은 빠른 프로토타이핑과 반복이 핵심입니다. 백엔드 없이
브라우저만으로 동작하는 게임은 배포가 간단하고, 인프라 비용이 없으며, 오프라인 플레이도
가능합니다. 조기 최적화와 불필요한 추상화는 개발 속도를 저하시킵니다.

### II. 실용적 테스트 (Pragmatic Testing)

핵심 비즈니스 로직과 게임 메커니즘에 집중한 테스트를 작성해야 합니다.

**비협상 규칙:**
- 게임 로직(매칭 알고리즘, 점수 계산, 게임 상태 전이)은 반드시 테스트해야 함
- 로컬 스토리지 처리(점수 저장, 게임 상태 저장)는 반드시 테스트해야 함
- UI 컴포넌트는 복잡한 상태 로직이 있는 경우에만 테스트함
- 테스트가 개발 속도를 과도하게 저하시키는 경우 범위를 조정할 수 있음

**근거:** 100% 테스트 커버리지는 비현실적이며, ROI가 낮습니다. 대신 버그 발생 시
큰 영향을 미치는 핵심 로직에 테스트를 집중함으로써 효율성을 극대화합니다.

### III. 성능과 반응성 (Performance & Responsiveness)

부드러운 게임 경험을 위한 성능 최적화는 필수입니다.

**비협상 규칙:**
- 게임 프레임 렌더링은 60fps를 유지해야 함 (16.6ms/frame 이하)
- 사용자 입력에 대한 피드백은 100ms 이내에 제공되어야 함
- 초기 로딩 시간은 3초를 초과하지 않아야 함
- 메모리 누수를 방지하기 위한 리소스 정리가 반드시 구현되어야 함
- 성능 측정 도구(프로파일러, 벤치마크)를 활용해야 함

**근거:** 게임의 사용자 경험은 성능에 직접적으로 의존합니다. 느린 반응이나 끊김 현상은
즉시 이탈로 이어지며, 브라우저 기반 게임은 다양한 디바이스에서 일관된 성능을 보장해야 합니다.

### IV. 관찰 가능성 (Observability)

게임 플레이 추적, 에러 모니터링, 디버깅이 용이해야 합니다.

**비협상 규칙:**
- 모든 에러는 구조화된 로그로 기록되어야 함 (스택 트레이스, 컨텍스트 포함)
- 주요 게임 이벤트(게임 시작/종료, 점수 갱신 등)는 추적 가능해야 함
- 프로덕션 환경에서 디버그 모드를 활성화할 수 있어야 함
- 사용자 피드백과 버그 리포트를 위한 컨텍스트 정보가 자동 수집되어야 함

**근거:** 게임 버그는 특정 상황에서만 재현되는 경우가 많습니다. 충분한 로깅과 추적 없이는
사용자가 겪는 문제를 재현하고 수정하는 것이 거의 불가능합니다.

## 개발 환경 (Development Environment)

### 기술 스택 표준

**프론트엔드 게임 (JavaScript/TypeScript):**
- 패키지 매니저: pnpm (필수)
- Node.js: 최신 LTS 버전 사용
- 포맷터: Prettier 기본 설정 사용
- 린터: ESLint 활용
- 번들러: Vite 또는 필요에 따라 선택

### 코드 작성 가이드라인

- 최소한의 읽기 쉬운 코드 작성
- 함수는 단일 책임 원칙 준수
- 명확하고 의미 있는 이름 사용
- 복잡한 로직에만 주석 추가
- 에러 처리 철저히 수행
- 기능 기반 모듈 분리
- 순환 의존성 금지
- 독립적인 컴포넌트 테스트

## 품질 기준 (Quality Standards)

### 코드 리뷰

- 모든 변경사항은 코드 리뷰를 거쳐야 함
- 리뷰어는 Constitution 준수 여부를 확인해야 함
- 성능에 영향을 미치는 변경사항은 벤치마크 결과를 포함해야 함

### 문서화

- 새로운 기능은 README 또는 docs에 문서화되어야 함
- 게임 메커니즘 변경사항은 문서에 반영되어야 함
- 복잡한 알고리즘은 설계 근거와 함께 문서화되어야 함

### 기술 검증

- 새로운 기술이나 문법 사용 전 웹 검색 또는 context7로 검증해야 함
- 버전 정보 및 deprecation 여부 확인 필수
- 공식 문서를 최우선으로 참조해야 함

## Governance

### 헌법 적용 원칙

이 헌법은 모든 개발 관행과 의사결정에 우선합니다.

**준수 요구사항:**
- 모든 PR과 코드 리뷰는 헌법 준수 여부를 검증해야 함
- 복잡성 증가는 반드시 정당화되어야 함 (Complexity Tracking 테이블 사용)
- 원칙 위반 시 명시적인 예외 승인이 필요함

### 헌법 수정 절차

- 수정 제안은 구체적인 근거와 함께 문서화되어야 함
- 영향받는 템플릿과 문서의 업데이트 계획을 포함해야 함
- 수정 후 버전을 적절히 증가시켜야 함:
  - **MAJOR**: 역호환되지 않는 원칙 제거 또는 재정의
  - **MINOR**: 새로운 원칙/섹션 추가 또는 실질적인 확장
  - **PATCH**: 명확화, 표현 수정, 오타 수정, 의미 변경 없는 개선

### 개발 가이드

- 런타임 개발 지침은 `.claude/CLAUDE.md` 참조
- 템플릿 사용 시 `.specify/templates/` 디렉토리 활용
- 명령어는 `.claude/commands/speckit.*.md` 참조

**Version**: 2.1.0 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-07
