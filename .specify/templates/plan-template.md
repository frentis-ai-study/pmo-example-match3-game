# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 단순성 우선 (Simplicity First / YAGNI)
- [ ] 현재 요구사항에 필요한 기능만 포함되었는가?
- [ ] 프론트엔드 전용 게임으로, 백엔드/서버 로직이 없는가?
- [ ] 로컬 스토리지나 브라우저 API만으로 데이터 관리가 가능한가?
- [ ] 불필요한 추상화가 포함되지 않았는가?
- [ ] 새로운 의존성이 명확한 가치를 제공하는가?
- [ ] 복잡성 증가가 Complexity Tracking에 문서화되었는가?

### II. 실용적 테스트 (Pragmatic Testing)
- [ ] 핵심 게임 로직(매칭, 점수, 상태 전이)에 대한 테스트 계획이 있는가?
- [ ] 로컬 스토리지 처리 테스트가 포함되었는가?
- [ ] 테스트 범위가 ROI를 고려하여 적절한가?

### III. 성능과 반응성 (Performance & Responsiveness)
- [ ] 60fps 렌더링 목표가 고려되었는가?
- [ ] 사용자 입력 반응성(100ms 이내)이 설계에 반영되었는가?
- [ ] 초기 로딩 시간(3초 이내) 목표가 있는가?
- [ ] 리소스 정리 및 메모리 관리 계획이 있는가?
- [ ] 다양한 디바이스/브라우저 호환성이 고려되었는가?

### IV. 관찰 가능성 (Observability)
- [ ] 구조화된 로깅 전략이 정의되었는가?
- [ ] 주요 게임 이벤트 추적 계획이 있는가?
- [ ] 디버그 모드 및 에러 리포팅 전략이 있는가?

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
